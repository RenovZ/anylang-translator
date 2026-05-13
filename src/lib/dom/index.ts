import type { TranslatePageRange } from '@/types/config';

import domFilter from './filter';

/**
 * removeDummyNodes excluded nodes from a document (elements that shouldn't be translated).
 *
 * Uses a TreeWalker instead of querySelectorAll('*') so that removing a
 * parent automatically skips its children, and collects elements before
 * removing to avoid mutating the DOM during traversal.
 *
 * @param root       The document (or cloned document) to clean up.
 * @param pageRange `'all'` to keep structural tags outside content containers,
 *                  `'main'` to remove them.
 */
export function removeDummyNodes(root: Document, pageRange: TranslatePageRange): void {
  const elements = root.querySelectorAll('*');
  elements.forEach((element) => {
    const isDontTranslate =
      domFilter.isHTMLElement(element) &&
      domFilter.isDontWalkIntoAndDontTranslateAsChildElement(element, pageRange);
    if (isDontTranslate) {
      element.remove();
    }
  });
}

export function getOwnerDocument(node: Node): Document {
  return node.ownerDocument || document;
}

export function getContainingShadowRoot(node: Node): ShadowRoot | null {
  const root = node.getRootNode();
  return root instanceof ShadowRoot ? root : null;
}
