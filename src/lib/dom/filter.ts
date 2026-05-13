import {
  BLOCK_ATTRIBUTE,
  BLOCK_CONTENT_CLASS,
  CONTENT_WRAPPER_CLASS,
  INLINE_ATTRIBUTE,
  INLINE_CONTENT_CLASS,
  NOTRANSLATE_CLASS
} from '@/preset/dom';
import { TranslatePageRange } from '@/types/config';
import type { TransNode } from '@/types/dom';

import {
  CUSTOM_DONT_WALK_INTO_ELEMENT_SELECTOR_MAP,
  CUSTOM_FORCE_BLOCK_TRANSLATION_SELECTOR_MAP,
  DONT_WALK_AND_TRANSLATE_TAGS,
  DONT_WALK_BUT_TRANSLATE_TAGS,
  FORCE_BLOCK_TAGS,
  MAIN_CONTENT_IGNORE_TAGS
} from './constants';

class DomFilter {
  isEditable(element: HTMLElement): boolean {
    const tag = element.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return true;
    if (element.isContentEditable) return true;
    return false;
  }

  // shallow means only check the node itself, not the children
  // if a shallow inline node has children are block node, then it's block node rather than inline node
  isShallowInlineTransNode(node: Node): boolean {
    if (this.isTextNode(node) && node.textContent?.trim()) {
      return true;
    } else if (this.isHTMLElement(node)) {
      return this.isShallowInlineHTMLElement(node);
    }
    return false;
  }

  // treat large floating letter on some news websites as inline node
  // for example: https://www.economist.com/business/2025/08/21/china-is-quietly-upstaging-america-with-its-open-models
  private isLargeInitialFloatingLetter(element: HTMLElement): boolean {
    const computedStyle = window.getComputedStyle(element);
    return (
      computedStyle.float === 'left' &&
      !!element.nextSibling &&
      this.isShallowInlineTransNode(element.nextSibling)
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

  isShallowInlineHTMLElement(element: HTMLElement): boolean {
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
  isShallowBlockTransNode(node: Node): boolean {
    if (this.isTextNode(node)) {
      return false;
    } else if (this.isHTMLElement(node)) {
      return this.isShallowBlockHTMLElement(node);
    }
    return false;
  }

  isShallowBlockHTMLElement(element: HTMLElement): boolean {
    const computedStyle = window.getComputedStyle(element);

    if (FORCE_BLOCK_TAGS.has(element.tagName)) {
      return true;
    }

    if (this.isLargeInitialFloatingLetter(element)) {
      return false;
    }

    return !this.isInlineDisplay(computedStyle.display);
  }

  isCustomDontWalkIntoElement(element: HTMLElement): boolean {
    const dontWalkIntoElementSelectorList =
      CUSTOM_DONT_WALK_INTO_ELEMENT_SELECTOR_MAP[window.location.hostname] ?? [];

    const dontWalkSelector = dontWalkIntoElementSelectorList.join(',');

    if (!dontWalkSelector) return false;

    return element.matches(dontWalkSelector);
  }

  isCustomForceBlockTranslation(element: HTMLElement): boolean {
    const forceBlockSelectorList =
      CUSTOM_FORCE_BLOCK_TRANSLATION_SELECTOR_MAP[window.location.hostname] ?? [];

    const forceBlockSelector = forceBlockSelectorList.join(',');

    if (!forceBlockSelector) return false;

    return element.matches(forceBlockSelector);
  }

  isDontWalkIntoButTranslateAsChildElement(element: HTMLElement): boolean {
    const dontWalkClass = element.classList.contains(NOTRANSLATE_CLASS);

    const dontWalkTag = DONT_WALK_BUT_TRANSLATE_TAGS.has(element.tagName);

    // issue: https://github.com/mengxi-ream/read-frog/issues/459
    // const dontWalkAttr = element.getAttribute('translate') === 'no'

    return dontWalkClass || dontWalkTag;
  }

  // https://github.com/mengxi-ream/read-frog/issues/940
  private isInsideContentContainer(element: HTMLElement): boolean {
    let current: HTMLElement | null = element.parentElement;
    while (current) {
      if (current.tagName === 'ARTICLE' || current.tagName === 'MAIN') {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  isDontWalkIntoAndDontTranslateAsChildElement(
    element: HTMLElement,
    pageRange: TranslatePageRange
  ): boolean {
    const dontWalkCustomElement = this.isCustomDontWalkIntoElement(element);
    const dontWalkContent =
      pageRange !== 'all' &&
      MAIN_CONTENT_IGNORE_TAGS.has(element.tagName) &&
      !this.isInsideContentContainer(element);
    const dontWalkInvalidTag = DONT_WALK_AND_TRANSLATE_TAGS.has(element.tagName);
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

  isInlineTransNode(node: TransNode): boolean {
    if (this.isTextNode(node)) {
      return true;
    }
    return node.hasAttribute(INLINE_ATTRIBUTE);
  }

  isBlockTransNode(node: TransNode): boolean {
    if (this.isTextNode(node)) {
      return false;
    }
    return node.hasAttribute(BLOCK_ATTRIBUTE);
  }

  /**
   * More reliable check for HTML elements that works across different contexts (iframe, shadow DOM)
   * avoid using instanceof HTMLElement
   * @param node - The node to check
   * @returns Whether the node is an HTML element
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

  isIFrameElement(node: Node): node is HTMLIFrameElement {
    return node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'IFRAME';
  }

  isTranslatedWrapperNode(node: Node) {
    return this.isHTMLElement(node) && node.classList.contains(CONTENT_WRAPPER_CLASS);
  }

  /**
   * Check if a node is translated content (block or inline)
   */
  isTranslatedContentNode(node: Node): boolean {
    return (
      this.isHTMLElement(node) &&
      (node.classList.contains(BLOCK_CONTENT_CLASS) ||
        node.classList.contains(INLINE_CONTENT_CLASS))
    );
  }

  /**
   * Check if an element has an ancestor that should not be walked into
   */
  hasNoWalkAncestor(element: HTMLElement, pageRange: TranslatePageRange): boolean {
    let current: HTMLElement | null = element.parentElement;
    while (current) {
      if (
        this.isDontWalkIntoButTranslateAsChildElement(current) ||
        this.isDontWalkIntoAndDontTranslateAsChildElement(current, pageRange)
      ) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }
}

export default new DomFilter();
