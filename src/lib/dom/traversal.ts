import {
  BLOCK_ATTRIBUTE,
  INLINE_ATTRIBUTE,
  PARAGRAPH_ATTRIBUTE,
  WALKED_ATTRIBUTE
} from '@/preset/dom';
import { TranslatePageRange } from '@/types/config';
import type { TransNode } from '@/types/dom';

import { FORCE_BLOCK_TAGS } from './constants';
import domFilter from './filter';

class DomTraversal {
  extractTextContent(node: TransNode, pageRange: TranslatePageRange): string {
    if (domFilter.isTextNode(node)) {
      const text = node.textContent ?? '';
      const trimmed = text.trim();
      if (trimmed === '') return ' ';
      const leadingWs = text.slice(0, text.length - text.trimStart().length);
      const trailingWs = text.slice(text.trimEnd().length);
      const hasLeading = NON_NEWLINE_WHITESPACE_RE.test(leadingWs);
      const hasTrailing = NON_NEWLINE_WHITESPACE_RE.test(trailingWs);
      return (hasLeading ? ' ' : '') + trimmed + (hasTrailing ? ' ' : '');
    }

    // Handle <br> elements as line breaks
    if (domFilter.isHTMLElement(node) && node.tagName === 'BR') {
      return '\n';
    }

    // We already don't walk and label the element which isDontWalkIntoElement
    // for the parent element we already walk and label, if we have a notranslate element inside this parent element,
    // we should extract the text content of the parent.
    // see this issue: https://github.com/mengxi-ream/read-frog/issues/249
    // if (isDontWalkIntoButTranslateAsChildElement(node)) {
    //   return ''
    // }

    if (domFilter.isDontWalkIntoAndDontTranslateAsChildElement(node, pageRange)) {
      return '';
    }

    return Array.from(node.childNodes).reduce((text: string, child: Node): string => {
      // TODO: support SVGElement in the future
      if (domFilter.isTextNode(child) || domFilter.isHTMLElement(child)) {
        return text + this.extractTextContent(child, pageRange);
      }
      return text;
    }, '');
  }

  walkAndLabelElement(
    element: HTMLElement,
    walkId: string,
    pageRange: TranslatePageRange
  ): { forceBlock: boolean; isInlineNode: boolean } {
    if (
      domFilter.isDontWalkIntoButTranslateAsChildElement(element) ||
      domFilter.isDontWalkIntoAndDontTranslateAsChildElement(element, pageRange)
    ) {
      return {
        forceBlock: false,
        isInlineNode: false
      };
    }

    element.setAttribute(WALKED_ATTRIBUTE, walkId);

    if (element.shadowRoot) {
      const children = Array.from(element.shadowRoot.children);
      for (const child of children) {
        if (domFilter.isHTMLElement(child)) {
          this.walkAndLabelElement(child, walkId, pageRange);
        }
      }
    }

    let hasInlineNodeChild = false;
    let forceBlock = false;

    const validChildNodes = Array.from(element.childNodes).filter((child: ChildNode) => {
      if (child.nodeType === Node.TEXT_NODE) return true;
      if (domFilter.isHTMLElement(child)) {
        return !(
          domFilter.isDontWalkIntoButTranslateAsChildElement(child) ||
          domFilter.isDontWalkIntoAndDontTranslateAsChildElement(child, pageRange)
        );
      }
      return false;
    });

    for (const child of validChildNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        if (child.textContent?.trim()) {
          hasInlineNodeChild = true;
        }
        continue;
      }

      if (domFilter.isHTMLElement(child)) {
        const result = this.walkAndLabelElement(child, walkId, pageRange);

        forceBlock = forceBlock || result.forceBlock;

        if (result.isInlineNode) {
          hasInlineNodeChild = true;
        }
      }
    }

    if (hasInlineNodeChild) {
      element.setAttribute(PARAGRAPH_ATTRIBUTE, '');
    }

    // force block will force the current and ancestor elements to be block node
    forceBlock = forceBlock || FORCE_BLOCK_TAGS.has(element.tagName);

    if (element.textContent?.trim() === '' && !forceBlock) {
      return {
        forceBlock: false,
        isInlineNode: false
      };
    }

    const isInlineNode = domFilter.isShallowInlineHTMLElement(element);

    if (
      domFilter.isShallowBlockHTMLElement(element) ||
      forceBlock ||
      domFilter.isCustomForceBlockTranslation(element)
    ) {
      element.setAttribute(BLOCK_ATTRIBUTE, '');
    } else if (isInlineNode) {
      element.setAttribute(INLINE_ATTRIBUTE, '');
    }

    return {
      forceBlock,
      isInlineNode
    };
  }
}

const NON_NEWLINE_WHITESPACE_RE = /[^\S\n]/;

export default new DomTraversal();
