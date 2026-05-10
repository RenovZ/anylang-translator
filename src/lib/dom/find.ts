import { CONTENT_WRAPPER_CLASS } from '@/preset/dom';
import type { Point } from '@/types/dom';

import domFilter from './filter';
import domStyle from './style';

class DomFind {
  blockNodeFor(element: Element) {
    const startElement = element.closest(`.${CONTENT_WRAPPER_CLASS}`)?.parentElement || element;
    let currentNode = startElement;
    while (
      currentNode &&
      currentNode.parentElement &&
      domFilter.isHTMLElement(currentNode) &&
      domFilter.isInlineEl(currentNode)
    ) {
      currentNode = currentNode.parentElement;
    }
    return currentNode;
  }

  /**
   * Find the nearest block node from the point
   * @param point - The point to find the nearest block node
   */
  blockNodeAt(point: Point) {
    const currentNode = this.findElementAt(document, point);
    if (!currentNode) return null;

    return this.blockNodeFor(currentNode);
  }

  /**
   * Find the deepest element at the given point, including inside shadow roots
   * @param root - The root element (Document or ShadowRoot)
   * @param point - The point to find the deepest element
   */
  private findElementAt(root: Document | ShadowRoot, point: Point): Element | null {
    const { x, y } = point;

    // First, try to get the element at the point from the root
    const initialElement = root.elementFromPoint(x, y);
    if (!initialElement) {
      return null;
    }

    // If the initial element has a shadow root, check if the point is actually inside the shadow content
    if (initialElement.shadowRoot) {
      const shadowElement = this.findElementAt(initialElement.shadowRoot, point);
      if (shadowElement) {
        return shadowElement;
      }
    }

    // Find the deepest element by traversing children
    const findDeepestElement = (element: Element): Element => {
      let deepestElement = element;

      for (const child of Array.from(element.children)) {
        if (domFilter.isHTMLElement(child)) {
          const rect = child.getBoundingClientRect();
          const isPointInChild =
            x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

          if (isPointInChild) {
            // If child has shadow root, recursively search within it
            if (child.shadowRoot) {
              const shadowResult = this.findElementAt(child.shadowRoot, point);
              if (shadowResult) {
                return shadowResult;
              }
            }

            // Continue searching deeper in this child
            deepestElement = findDeepestElement(child);
            if (deepestElement.textContent?.trim()) return deepestElement;
          }
        }
      }

      return deepestElement;
    };

    return findDeepestElement(initialElement);
  }

  async deepSingleChild(element: HTMLElement) {
    let currentElement = element;
    while (currentElement) {
      domStyle.smashTruncationStyle(currentElement);

      const shouldKeepNode = (child: ChildNode) => {
        if (!child.textContent?.trim()) return false;
        if (child.nodeType === Node.TEXT_NODE) return true;
        return domFilter.isHTMLElement(child) && !domFilter.isSkipped(child);
      };

      const effectiveChildNodes = Array.from(currentElement.childNodes).filter(shouldKeepNode);
      const effectiveChildren = effectiveChildNodes.filter(
        (child) => child.nodeType === Node.ELEMENT_NODE
      );

      // Only have one HTML child and no Text Child
      if (!(effectiveChildren.length === 1 && effectiveChildNodes.length === 1)) break;

      const onlyChildElement = effectiveChildren[0];
      if (!domFilter.isHTMLElement(onlyChildElement)) break;

      currentElement = onlyChildElement;
    }

    return currentElement;
  }

  deepQueryTopLevelSelector(
    element: HTMLElement | ShadowRoot | Document,
    selectorFn: (element: HTMLElement) => boolean
  ): HTMLElement[] {
    if (element instanceof Document) {
      return this.deepQueryTopLevelSelector(element.body, selectorFn);
    }

    const result: HTMLElement[] = [];
    if (element instanceof ShadowRoot) {
      for (const child of Array.from(element.children)) {
        if (domFilter.isHTMLElement(child)) {
          result.push(...this.deepQueryTopLevelSelector(child, selectorFn));
        }
      }
      return result;
    }

    if (selectorFn(element)) {
      return [element];
    }

    if (element.shadowRoot) {
      for (const child of Array.from(element.shadowRoot.children)) {
        if (domFilter.isHTMLElement(child)) {
          result.push(...this.deepQueryTopLevelSelector(child, selectorFn));
        }
      }
    }

    for (const child of Array.from(element.children)) {
      if (domFilter.isHTMLElement(child)) {
        result.push(...this.deepQueryTopLevelSelector(child, selectorFn));
      }
    }

    return result;
  }
}

export default new DomFind();
