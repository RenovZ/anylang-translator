import type { TranslatePageRange } from '@/types/config';

import {
  SITE_SKIP_SELECTOR_MAP,
  SKIP_TAGS,
  NOISE_TAGS
} from './constants';
import domFilter from './filter';

// Lazily cached joined selector string for the current hostname.
// Avoids re-joining the selector array on every call to matchesSiteExclusion().
let _siteSelectorHostname: string | undefined;
let _siteSelectorCache = '';

class DomPrune {
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
      const selectors = SITE_SKIP_SELECTOR_MAP[hostname] ?? [];
      _siteSelectorCache = selectors.join(',');
    }
    return !!_siteSelectorCache && element.matches(_siteSelectorCache);
  }

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
    if (SKIP_TAGS.has(element.tagName)) return true;

    // 2. Structural tags outside <article>/<main> when not showing all
    if (
      pageRange !== 'all' &&
      NOISE_TAGS.has(element.tagName) &&
      !domFilter.inMainContent(element)
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
      if (domFilter.isHTMLElement(node) && this.isExcluded(node, pageRange)) {
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

export default new DomPrune();
