/**
 * DOM filtering utilities migrated from read-frog.
 *
 * Centralises the logic that determines which DOM elements should be excluded
 * during content extraction — hidden elements, non-content tags, and
 * site-specific noise.
 *
 * @see read-frog/src/utils/constants/dom-rules.ts
 * @see read-frog/src/utils/host/dom/filter.ts
 */

import type { TranslatePageRange } from '@/types/config';

// ─────────────────────────────────────────────────────────────────────────────
// Tags that should never be walked into or translated
// ─────────────────────────────────────────────────────────────────────────────

const MATH_TAGS = new Set([
  'math',
  'maction',
  'annotation',
  'annotation-xml',
  'menclose',
  'merror',
  'mfenced',
  'mfrac',
  'mi',
  'mmultiscripts',
  'mn',
  'mo',
  'mover',
  'mpadded',
  'mphantom',
  'mprescripts',
  'mroot',
  'mrow',
  'ms',
  'mspace',
  'msqrt',
  'mstyle',
  'msub',
  'msubsup',
  'msup',
  'mtable',
  'mtd',
  'mtext',
  'mtr',
  'munder',
  'munderover',
  'semantics'
]);

const DONT_WALK_AND_TRANSLATE_TAGS = new Set([
  'HEAD',
  'TITLE',
  'HR',
  'INPUT',
  'TEXTAREA',
  'IMG',
  'VIDEO',
  'AUDIO',
  'CANVAS',
  'SOURCE',
  'TRACK',
  'META',
  'SCRIPT',
  'NOSCRIPT',
  'STYLE',
  'LINK',
  'RT',
  'RP',
  'PRE',
  'svg',
  ...MATH_TAGS
]);

// ─────────────────────────────────────────────────────────────────────────────
// Tags that are ignorable when they sit *outside* the main content container
// (e.g. <header>, <footer>, <nav> outside <article>/<main>)
// ─────────────────────────────────────────────────────────────────────────────

const MAIN_CONTENT_IGNORE_TAGS = new Set(['HEADER', 'FOOTER', 'NAV', 'NOSCRIPT']);

// ─────────────────────────────────────────────────────────────────────────────
// Site-specific CSS selectors for elements that should never be walked into.
// Keyed by hostname (includes subdomain prefix).
// ─────────────────────────────────────────────────────────────────────────────

const CUSTOM_DONT_WALK_INTO_ELEMENT_SELECTOR_MAP: Record<string, string[]> = {
  'chatgpt.com': ['.ProseMirror'],
  'arxiv.org': ['.ltx_listing'],
  'www.reddit.com': [
    'faceplate-screen-reader-content > *',
    'reddit-header-large *',
    'shreddit-comment-action-row > *',
    'shreddit-post-flair'
  ],
  'www.youtube.com': [
    '#masthead-container *',
    '#guide-inner-content *',
    '#metadata *',
    '#channel-name',
    '.yt-lockup-metadata-view-model__metadata',
    '.yt-spec-avatar-shape__badge-text',
    '.shortsLockupViewModelHostOutsideMetadataSubhead',
    'ytd-comments-header-renderer',
    '#top-row',
    '#header-author',
    '#reply-button-end',
    '#more-replies',
    '#info',
    '#badges *'
  ],
  'discord.com': [
    '[id^="message-username"]',
    'span[class*="-timestamp"]',
    'div[class*="-repliedMessage"]',
    'li[class*="-containerDefault"]',
    '[class*="-subtitleContainer"]',
    '[class*="-formWithLoadedChatInput"]'
  ],
  'github.com': [
    '[aria-labelledby="folders-and-files"] *',
    'header *',
    '#repository-container-header *',
    '[class*="OverviewContent-module__Box_1--"] *',
    'table.diff-table'
  ]
};

// Lazily cached joined selector string for the current hostname.
// Avoids re-joining the selector array on every call to matchesSiteExclusion().
let _siteSelectorHostname: string | undefined;
let _siteSelectorCache = '';

class DOMManager {
  // ────────────────────────────────────────────────────────────────────────────
  // General node helpers
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * More reliable check for HTML elements that works across different contexts
   * (iframe, shadow DOM). Avoids `instanceof HTMLElement`.
   */
  private isHTMLElement(node: Node): node is HTMLElement {
    return (
      node.nodeType === Node.ELEMENT_NODE &&
      node.nodeName !== undefined &&
      'tagName' in node &&
      'getAttribute' in node &&
      'setAttribute' in node
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Content-container check
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Check if an element sits inside `<article>` or `<main>`.
   * Elements outside these containers are candidates for removal when the
   * page range is not `"all"`.
   */
  private isInMainContent(element: HTMLElement): boolean {
    let current: HTMLElement | null = element.parentElement;
    while (current) {
      if (current.tagName === 'ARTICLE' || current.tagName === 'MAIN') {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Site-specific selector check
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Check if an element matches any site-specific exclusion selector
   * for the current hostname. Caches the joined selector string so it
   * is only recomputed when the hostname changes (i.e. never within a
   * single page load).
   */
  private matchesSiteExclusion(element: HTMLElement): boolean {
    const hostname = window.location.hostname;
    if (hostname !== _siteSelectorHostname) {
      _siteSelectorHostname = hostname;
      const selectors = CUSTOM_DONT_WALK_INTO_ELEMENT_SELECTOR_MAP[hostname];
      _siteSelectorCache = selectors?.length ? selectors.join(',') : '';
    }
    if (!_siteSelectorCache) return false;
    return element.matches(_siteSelectorCache);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Main predicate
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Determine whether an element should be **removed entirely** during content
   * extraction — i.e. neither walked into nor translated.
   *
   * An element is removed when any of the following is true:
   *
   * 1. It matches a site-specific "don't walk into" selector.
   * 2. It is a structural-noise tag (`<header>`, `<footer>`, `<nav>`,
   *    `<noscript>`) outside a content container, and `pageRange` is not
   *    `"all"`.
   * 3. It is a non-content tag (`<script>`, `<style>`, `<img>`, etc.).
   * 4. It is CSS-hidden (`display: none` or `visibility: hidden`).
   * 5. It has the `hidden` attribute.
   * 6. It has `aria-hidden="true"`.
   * 7. It has a screen-reader-only class (`sr-only`, `visually-hidden`).
   *
   * @param element   The element to check.
   * @param pageRange `'all'` to keep structural tags outside content containers,
   *                  `'main'` (default) to remove them.
   */
  private isExcluded(element: HTMLElement, pageRange: TranslatePageRange = 'main'): boolean {
    // ── Cheap checks first (Set lookups, attributes, classList) ────────────

    // 1. Non-content tags (cheapest — Set.has on tagName)
    if (DONT_WALK_AND_TRANSLATE_TAGS.has(element.tagName)) return true;

    // 2. Structural tags outside <article>/<main> when not showing all
    if (
      pageRange !== 'all' &&
      MAIN_CONTENT_IGNORE_TAGS.has(element.tagName) &&
      !this.isInMainContent(element)
    ) {
      return true;
    }

    // 3. HTML hidden attribute
    if (element.hidden) return true;

    // 4. aria-hidden
    if (element.getAttribute('aria-hidden') === 'true') return true;

    // 5. Screen-reader-only classes
    if (element.classList.contains('sr-only') || element.classList.contains('visually-hidden')) {
      return true;
    }

    // ── Moderate checks (CSS selector matching, but cached) ───────────────

    // 6. Site-specific selectors
    if (this.matchesSiteExclusion(element)) return true;

    // ── Expensive check (forces layout reflow) — keep last ────────────────

    // 7. CSS-hidden (getComputedStyle forces synchronous layout)
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') return true;

    return false;
  }

  /**
   * Prune excluded nodes from a document (elements that shouldn't be translated).
   *
   * Uses a TreeWalker instead of querySelectorAll('*') so that removing a
   * parent automatically skips its children, and collects elements before
   * removing to avoid mutating the DOM during traversal.
   *
   * @param root       The document (or cloned document) to clean up.
   * @param pageRange `'all'` to keep structural tags outside content containers,
   *                  `'main'` (default) to remove them.
   */
  prune(root: Document, pageRange: TranslatePageRange = 'main'): void {
    const walker = root.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    const toRemove: Element[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (this.isHTMLElement(node) && this.isExcluded(node, pageRange)) {
        toRemove.push(node);
      }
    }
    // Remove in reverse order so children are removed before parents,
    // keeping the DOM consistent during isExcluded checks in future calls.
    for (let i = toRemove.length - 1; i >= 0; i--) {
      toRemove[i].remove();
    }
  }
}

export default new DOMManager();
