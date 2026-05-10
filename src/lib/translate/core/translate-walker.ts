import domFilter from '@/lib/dom/filter';
import {
  BLOCK_ATTRIBUTE,
  CONTENT_WRAPPER_CLASS,
  PARAGRAPH_ATTRIBUTE,
  WALKED_ATTRIBUTE
} from '@/preset/dom';

import translationModes from './translate-modes';

class TranslateWalker {
  async run(element: HTMLElement, walkId: string, toggle: boolean = false): Promise<void> {
    if (!toggle && element.querySelector(`.${CONTENT_WRAPPER_CLASS}`)) return;
    // if the walkId is not the same, return
    if (element.getAttribute(WALKED_ATTRIBUTE) !== walkId) return;

    const promises: Promise<void>[] = [];

    if (element.hasAttribute(PARAGRAPH_ATTRIBUTE)) {
      let hasBlockNodeChild = false;

      // prevent children change during iteration
      for (const child of Array.from(element.childNodes)) {
        if (domFilter.isHTMLElement(child) && child.hasAttribute(BLOCK_ATTRIBUTE)) {
          hasBlockNodeChild = true;
          break;
        }
      }

      const computedStyle = window.getComputedStyle(element);
      const isFlexParent = computedStyle.display.includes('flex');

      if (!hasBlockNodeChild) {
        promises.push(translationModes.run([element], walkId, toggle));
      } else {
        // prevent children change during iteration
        const children = Array.from(element.childNodes);
        let consecutiveInlineNodes: ChildNode[] = [];
        for (const child of children) {
          if (
            domFilter.isTransNode(child) &&
            domFilter.isBlockTransNode(child) &&
            !domFilter.isTextNode(child)
          ) {
            // force the children to be block translation style unless the parent is a flex parent
            promises.push(
              translationModes.run(consecutiveInlineNodes, walkId, toggle, !isFlexParent)
            );
            consecutiveInlineNodes = [];
            promises.push(this.run(child, walkId, toggle));
          } else {
            consecutiveInlineNodes.push(child);
          }
        }
        if (consecutiveInlineNodes.length) {
          promises.push(
            translationModes.run(consecutiveInlineNodes, walkId, toggle, !isFlexParent)
          );
        }
      }
    } else {
      for (const child of Array.from(element.childNodes)) {
        if (domFilter.isHTMLElement(child)) {
          promises.push(this.run(child, walkId, toggle));
        }
      }
      if (element.shadowRoot) {
        for (const child of Array.from(element.shadowRoot.children)) {
          if (domFilter.isHTMLElement(child)) {
            promises.push(this.run(child, walkId, toggle));
          }
        }
      }
    }

    // This simultaneously ensures that when concurrent translation
    // and external await call this function, all translations are completed
    await Promise.all(promises);
  }
}

export default new TranslateWalker();
