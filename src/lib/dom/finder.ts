import { CONTENT_WRAPPER_CLASS } from '@/preset/dom';
import { TranslatePageRange } from '@/types/config';
import type { Point } from '@/types/dom';

import domFilter from './filter';

class DomFind {
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

      const children = Array.from(element.children);
      for (const child of children) {
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

  findNearestAncestorBlockNodeFor(element: Element) {
    const startElement = element.closest(`.${CONTENT_WRAPPER_CLASS}`)?.parentElement || element;
    let currentNode = startElement;
    while (
      currentNode &&
      currentNode.parentElement &&
      domFilter.isHTMLElement(currentNode) &&
      domFilter.isShallowInlineHTMLElement(currentNode)
    ) {
      currentNode = currentNode.parentElement;
    }
    return currentNode;
  }

  /**
   * Find the nearest block node from the point
   * @param point - The point to find the nearest block node
   */
  findNearestAncestorBlockNodeAt(point: Point) {
    const currentNode = this.findElementAt(document, point);
    if (!currentNode) return null;

    return this.findNearestAncestorBlockNodeFor(currentNode);
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
      const children = Array.from(element.children);
      for (const child of children) {
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
      const children = Array.from(element.shadowRoot.children);
      for (const child of children) {
        if (domFilter.isHTMLElement(child)) {
          result.push(...this.deepQueryTopLevelSelector(child, selectorFn));
        }
      }
    }

    const children = Array.from(element.children);
    for (const child of children) {
      if (domFilter.isHTMLElement(child)) {
        result.push(...this.deepQueryTopLevelSelector(child, selectorFn));
      }
    }

    return result;
  }

  /**
   * Smash the truncation style of the node if it has truncation style
   * @param element - The node to smash the truncation style
   */
  smashTruncationStyle(element: HTMLElement) {
    // Ensure we're in a window context
    if (typeof window === 'undefined') {
      return;
    }

    // Use a wrapper function to ensure proper `this` binding
    const scheduleIdleTask = (callback: () => void) => {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(callback);
      } else if (typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(callback);
      } else {
        setTimeout(callback, 0);
      }
    };

    scheduleIdleTask(() => {
      const computedStyle = window.getComputedStyle(element);

      if (computedStyle.webkitLineClamp && computedStyle.webkitLineClamp !== 'none') {
        element.style.webkitLineClamp = 'unset';
      }

      if (computedStyle.maxHeight && computedStyle.maxHeight !== 'none') {
        element.style.maxHeight = 'unset';
      }

      if (computedStyle.textOverflow === 'ellipsis') {
        element.style.textOverflow = 'unset';
      }
    });
  }

  async unwrapDeepestOnlyHTMLChild(element: HTMLElement, pageRange: TranslatePageRange) {
    let currentElement = element;
    while (currentElement) {
      this.smashTruncationStyle(currentElement);

      const shouldKeepNode = (child: ChildNode) => {
        if (!child.textContent?.trim()) return false;
        if (child.nodeType === Node.TEXT_NODE) return true;
        return (
          domFilter.isHTMLElement(child) &&
          !domFilter.isDontWalkIntoAndDontTranslateAsChildElement(child, pageRange)
        );
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

  /**
   * Find the nearest translated content wrapper ancestor
   * @param node - The node should be a translated content node
   */
  findTranslatedContentWrapper(node: HTMLElement): HTMLElement | null {
    if (!domFilter.isTranslatedContentNode(node)) return null;

    let currentElement = node.parentElement;
    while (currentElement) {
      if (domFilter.isTranslatedWrapperNode(currentElement)) {
        return currentElement;
      }
      currentElement = currentElement.parentElement;
    }
    return null;
  }
}

export default new DomFind();
