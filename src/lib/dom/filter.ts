import configStore from '@/lib/config';
import {
  BLOCK_ATTRIBUTE,
  BLOCK_CONTENT_CLASS,
  CONTENT_WRAPPER_CLASS,
  INLINE_ATTRIBUTE,
  INLINE_CONTENT_CLASS,
  NOTRANSLATE_CLASS
} from '@/preset/dom';
import type { TransNode } from '@/types/dom';

import {
  FORCE_BLOCK_TAGS,
  FORCE_INLINE_TAGS,
  NOISE_TAGS,
  OPAQUE_TAGS,
  SITE_FORCE_BLOCK_SELECTOR_MAP,
  SITE_SKIP_SELECTOR_MAP,
  SKIP_TAGS
} from './constants';

class DomFilter {
  // ────────────────────────────────────────────────────────────────────────────
  // General node helpers
  // ────────────────────────────────────────────────────────────────────────────

  isEditable(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    const editableElements = ['input', 'textarea'];
    if (editableElements.includes(tagName)) {
      return true;
    }
    if (element.isContentEditable) {
      return true;
    }
    return false;
  }

  /**
   * More reliable check for HTML elements that works across different contexts
   * (iframe, shadow DOM). Avoids `instanceof HTMLElement`.
   */
  isHTMLElement(node: Node): node is HTMLElement {
    return (
      node.nodeType === Node.ELEMENT_NODE &&
      node.nodeName !== undefined &&
      'tagName' in node &&
      'getAttribute' in node &&
      'setAttribute' in node
    );
  }

  isElement(node: Node): node is Element {
    return node.nodeType === Node.ELEMENT_NODE;
  }

  /**
   * More reliable check for Text nodes that works across different contexts
   * avoid using instanceof Text
   * @param node - The node to check
   * @returns Whether the node is a Text node
   */
  isTextNode(node: Node): node is Text {
    return node.nodeType === Node.TEXT_NODE && 'textContent' in node && 'data' in node;
  }

  isTransNode(node: Node): node is TransNode {
    return this.isHTMLElement(node) || this.isTextNode(node);
  }

  isBlockTransNode(node: TransNode): boolean {
    if (this.isTextNode(node)) {
      return false;
    }
    return node.hasAttribute(BLOCK_ATTRIBUTE);
  }

  isInlineTransNode(node: TransNode): boolean {
    if (this.isTextNode(node)) {
      return true;
    }
    return node.hasAttribute(INLINE_ATTRIBUTE);
  }

  isWrapper(node: Node): boolean {
    return this.isHTMLElement(node) && node.classList.contains(CONTENT_WRAPPER_CLASS);
  }

  /**
   * Check if a node is translated content (block or inline)
   */
  isTransContent(node: Node): boolean {
    return (
      this.isHTMLElement(node) &&
      (node.classList.contains(BLOCK_CONTENT_CLASS) ||
        node.classList.contains(INLINE_CONTENT_CLASS))
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Inline / block display helpers
  // ────────────────────────────────────────────────────────────────────────────

  // treat large floating letter on some news websites as inline node
  // for example: https://www.economist.com/business/2025/08/21/china-is-quietly-upstaging-america-with-its-open-models
  private isLargeInitialFloatingLetter(element: HTMLElement): boolean {
    const computedStyle = window.getComputedStyle(element);
    return (
      computedStyle.float === 'left' &&
      !!element.nextSibling &&
      this.isInlineNode(element.nextSibling)
    );
  }

  private isInlineDisplay(display: string): boolean {
    const normalizedDisplay = display.trim().toLowerCase();

    if (!normalizedDisplay) {
      return false;
    }

    if (normalizedDisplay === 'contents') {
      return true;
    }

    if (normalizedDisplay.startsWith('inline')) {
      return true;
    }

    return [
      'ruby',
      'ruby-base',
      'ruby-text',
      'ruby-base-container',
      'ruby-text-container'
    ].includes(normalizedDisplay);
  }

  // shallow means only check the node itself, not the children
  // if a shallow inline node has children are block node, then it's block node rather than inline node
  isInlineNode(node: Node): boolean {
    if (this.isTextNode(node) && node.textContent?.trim()) {
      return true;
    } else if (this.isHTMLElement(node)) {
      return this.isInlineEl(node);
    }
    return false;
  }

  isInlineEl(element: HTMLElement): boolean {
    // to prevent too many inline nodes that make <body> as a paragraph node
    if (!element.textContent?.trim()) {
      return false;
    }

    if (FORCE_BLOCK_TAGS.has(element.tagName)) {
      return false;
    }

    const computedStyle = window.getComputedStyle(element);

    if (this.isLargeInitialFloatingLetter(element)) {
      return true;
    }

    return this.isInlineDisplay(computedStyle.display);
  }

  // Note: !(inline node) != block node because of `notranslate` class and all cases not in the if else block
  isBlockEl(element: HTMLElement): boolean {
    const computedStyle = window.getComputedStyle(element);

    if (FORCE_BLOCK_TAGS.has(element.tagName)) {
      return true;
    }

    if (this.isLargeInitialFloatingLetter(element)) {
      return false;
    }

    return !this.isInlineDisplay(computedStyle.display);
  }

  isForceInline(targetNode: TransNode): boolean {
    if (this.isHTMLElement(targetNode)) {
      const computedStyle = window.getComputedStyle(targetNode);
      return FORCE_INLINE_TAGS.has(targetNode.tagName) || computedStyle.display.includes('flex');
    }
    return false;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Walk / translation filter predicates
  // ────────────────────────────────────────────────────────────────────────────

  isOpaque(element: HTMLElement): boolean {
    const dontWalkClass = element.classList.contains(NOTRANSLATE_CLASS);

    const dontWalkTag = OPAQUE_TAGS.has(element.tagName);

    // issue: https://github.com/mengxi-ream/read-frog/issues/459
    // const dontWalkAttr = element.getAttribute('translate') === 'no'

    return dontWalkClass || dontWalkTag;
  }

  isSiteSkipped(element: HTMLElement): boolean {
    const dontWalkIntoElementSelectorList = SITE_SKIP_SELECTOR_MAP[window.location.hostname] ?? [];

    const dontWalkSelector = dontWalkIntoElementSelectorList.join(',');

    if (!dontWalkSelector) return false;

    return element.matches(dontWalkSelector);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Content-container check
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Check if an element sits inside `<article>` or `<main>`.
   * Elements outside these containers are candidates for removal when the
   * page range is not `"all"`.
   */
  // https://github.com/mengxi-ream/read-frog/issues/940
  inMainContent(element: HTMLElement): boolean {
    let current: HTMLElement | null = element.parentElement;
    while (current) {
      if (current.tagName === 'ARTICLE' || current.tagName === 'MAIN') {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  isSkipped(element: HTMLElement): boolean {
    const dontWalkCustomElement = this.isSiteSkipped(element);
    const config = configStore.get();
    const dontWalkContent =
      config.quickTranslate.translate.pageRange !== 'all' &&
      NOISE_TAGS.has(element.tagName) &&
      !this.inMainContent(element);
    const dontWalkInvalidTag = SKIP_TAGS.has(element.tagName);
    const dontWalkCSS =
      window.getComputedStyle(element).display === 'none' ||
      window.getComputedStyle(element).visibility === 'hidden';
    const dontWalkHidden = element.hidden;
    const dontWalkAriaHidden = element.getAttribute('aria-hidden') === 'true';
    const dontWalkVisuallyHidden = ['sr-only', 'visually-hidden'].some((cls) =>
      element.classList.contains(cls)
    );

    if (
      dontWalkCustomElement ||
      dontWalkContent ||
      dontWalkInvalidTag ||
      dontWalkCSS ||
      dontWalkHidden ||
      dontWalkAriaHidden ||
      dontWalkVisuallyHidden
    ) {
      return true;
    }

    return false;
  }

  isSiteForceBlock(element: HTMLElement): boolean {
    const forceBlockSelectorList = SITE_FORCE_BLOCK_SELECTOR_MAP[window.location.hostname] ?? [];

    const forceBlockSelector = forceBlockSelectorList.join(',');

    if (!forceBlockSelector) return false;

    return element.matches(forceBlockSelector);
  }

  /**
   * Check if an element has an ancestor that should not be walked into
   */
  hasNoWalkAncestor(element: HTMLElement): boolean {
    let current: HTMLElement | null = element.parentElement;
    while (current) {
      if (this.isOpaque(current) || this.isSkipped(current)) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }
}

export default new DomFilter();
