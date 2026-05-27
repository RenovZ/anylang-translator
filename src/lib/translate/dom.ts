import * as domBatcher from '@/lib/dom/batcher';
import domFilter from '@/lib/dom/filter';
import domFinder from '@/lib/dom/finder';
import {
  BLOCK_CONTENT_CLASS,
  CONTENT_WRAPPER_CLASS,
  FLOAT_WRAP_ATTRIBUTE,
  INLINE_CONTENT_CLASS,
  NOTRANSLATE_CLASS,
  PARAGRAPH_ATTRIBUTE,
  SHADOW_HOST_CLASS,
  SPINNER_CLASS,
  TRANSLATE_MODE_ATTRIBUTE,
  WALKED_ATTRIBUTE
} from '@/preset/dom';
import { displayStyles } from '@/preset/translate';
import { translateModeSchema } from '@/types/config';
import { TransNode } from '@/types/dom';
import type { DisplayStyle } from '@/types/translate';

import { getOwnerDocument } from '../dom';
import { FORCE_INLINE_TRANSLATION_TAGS } from '../dom/constants';
import logger from '../logger';

import { translateState } from './core';
import { decorateTranslationNode } from './ui';

export function removeShadowHostInTranslatedWrapper(wrapper: HTMLElement): void {
  // Remove React shadow hosts (for error components)
  const translationShadowHost = wrapper.querySelector(`.${SHADOW_HOST_CLASS}`);
  if (translationShadowHost && domFilter.isHTMLElement(translationShadowHost)) {
    translationShadowHost.remove();
  }

  // Remove lightweight spinners
  const spinner = wrapper.querySelector(`.${SPINNER_CLASS}`);
  if (spinner) {
    domBatcher.batchDOMOperation(() => spinner.remove());
  }
}

/**
 * Remove translated wrapper and restore original content based on translation mode
 * @param wrapper - The translated wrapper element to remove
 */
export function removeTranslatedWrapperWithRestore(wrapper: HTMLElement): void {
  removeShadowHostInTranslatedWrapper(wrapper);

  const rawTranslateMode = wrapper.getAttribute(TRANSLATE_MODE_ATTRIBUTE);
  const { success, data: translationMode, error } = translateModeSchema.safeParse(rawTranslateMode);
  if (!success) {
    logger.error('Failed to parse translate mode', { error });
    return;
  }

  if (translationMode === 'translation_only') {
    // For translation-only mode, find nearest ancestor in originalContentMap and restore
    let currentNode = wrapper.parentNode;

    while (currentNode && domFilter.isHTMLElement(currentNode)) {
      const originalContent = translateState.originalContentMap.get(currentNode);
      if (originalContent) {
        const nodeToRestore = currentNode;
        domBatcher.batchDOMOperation(() => {
          nodeToRestore.innerHTML = originalContent;
        });
        translateState.originalContentMap.delete(currentNode);
        return;
      }
      currentNode = currentNode.parentNode;
    }
  }

  // For bilingual mode or when no original content is found, just remove the wrapper
  domBatcher.batchDOMOperation(() => wrapper.remove());
}

export function removeAllTranslatedWrapperNodes(root: Document | ShadowRoot = document): void {
  const translatedNodes = domFinder.deepQueryTopLevelSelector(
    root,
    domFilter.isTranslatedWrapperNode.bind(domFilter)
  );
  translatedNodes.forEach((contentWrapperNode) => {
    removeTranslatedWrapperWithRestore(contentWrapperNode);
  });
}

export function findPreviousTranslatedWrapperInside(
  node: Element | Text,
  walkId: string
): HTMLElement | null {
  if (domFilter.isHTMLElement(node)) {
    // Check if the node itself is a translated wrapper
    if (
      node.classList.contains(CONTENT_WRAPPER_CLASS) &&
      node.getAttribute(WALKED_ATTRIBUTE) !== walkId
    ) {
      return node;
    }
    // Otherwise, look for a wrapper as a child that doesn't match the current walkId
    return node.querySelector(`.${CONTENT_WRAPPER_CLASS}:not([${WALKED_ATTRIBUTE}="${walkId}"])`);
  }
  return null;
}

function isFloatedElement(element: HTMLElement): boolean {
  const floatValue = window.getComputedStyle(element).float;
  return floatValue === 'left' || floatValue === 'right';
}

function hasVisibleLayoutBox(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function findActiveFloatSibling(paragraphElement: HTMLElement): HTMLElement | null {
  const flowContainer = paragraphElement.parentElement;
  if (!flowContainer) return null;

  const paragraphRect = paragraphElement.getBoundingClientRect();

  const children = Array.from(flowContainer.children);
  for (const sibling of children) {
    if (!domFilter.isHTMLElement(sibling)) continue;
    if (sibling === paragraphElement || sibling.contains(paragraphElement)) continue;

    const siblings = Array.from(sibling.querySelectorAll<HTMLElement>('*'));
    const floatCandidates = [sibling, ...siblings];
    for (const candidate of floatCandidates) {
      if (!isFloatedElement(candidate) || !hasVisibleLayoutBox(candidate)) continue;

      const floatRect = candidate.getBoundingClientRect();
      const verticallyAffectsParagraph =
        paragraphRect.top < floatRect.bottom - 1 && paragraphRect.bottom > floatRect.top + 1;
      if (verticallyAffectsParagraph) return candidate;
    }
  }

  return null;
}

function shouldWrapInsideFloatFlow(targetNode: TransNode): boolean {
  const paragraphElement = domFilter.isHTMLElement(targetNode)
    ? targetNode.hasAttribute(PARAGRAPH_ATTRIBUTE)
      ? targetNode
      : targetNode.closest<HTMLElement>(`[${PARAGRAPH_ATTRIBUTE}]`)
    : targetNode.parentElement?.closest<HTMLElement>(`[${PARAGRAPH_ATTRIBUTE}]`);
  if (!paragraphElement) return false;

  const activeFloat = findActiveFloatSibling(paragraphElement);
  return !!activeFloat;
}

export function addInlineTranslation(
  ownerDoc: Document,
  translatedWrapperNode: HTMLElement,
  translatedNode: HTMLElement
): void {
  const spaceNode = ownerDoc.createElement('span');
  spaceNode.textContent = '  ';
  translatedWrapperNode.appendChild(spaceNode);
  translatedNode.className = `${NOTRANSLATE_CLASS} ${INLINE_CONTENT_CLASS}`;
}

export function addBlockTranslation(
  ownerDoc: Document,
  translatedWrapperNode: HTMLElement,
  translatedNode: HTMLElement
): void {
  const brNode = ownerDoc.createElement('br');
  translatedWrapperNode.appendChild(brNode);
  translatedNode.className = `${NOTRANSLATE_CLASS} ${BLOCK_CONTENT_CLASS}`;
}

export async function insertTranslatedNodeIntoWrapper(
  translatedWrapperNode: HTMLElement,
  targetNode: TransNode,
  translatedText: string,
  displayStyle: DisplayStyle = displayStyles[0],
  forceBlockTranslation: boolean = false
): Promise<void> {
  // Use the wrapper's owner document
  const ownerDoc = getOwnerDocument(translatedWrapperNode);
  const translatedNode = ownerDoc.createElement('span');
  const forceInlineTranslation = isForceInlineTranslation(targetNode);
  const customForceBlock =
    domFilter.isHTMLElement(targetNode) && domFilter.isCustomForceBlockTranslation(targetNode);

  // priority: customForceBlock > forceInlineTranslation > forceBlockTranslation > isInlineTransNode > isBlockTransNode
  if (customForceBlock) {
    addBlockTranslation(ownerDoc, translatedWrapperNode, translatedNode);
  } else if (forceInlineTranslation) {
    addInlineTranslation(ownerDoc, translatedWrapperNode, translatedNode);
  } else if (forceBlockTranslation) {
    addBlockTranslation(ownerDoc, translatedWrapperNode, translatedNode);
  } else if (domFilter.isInlineTransNode(targetNode)) {
    addInlineTranslation(ownerDoc, translatedWrapperNode, translatedNode);
  } else if (domFilter.isBlockTransNode(targetNode)) {
    addBlockTranslation(ownerDoc, translatedWrapperNode, translatedNode);
  } else {
    // not inline or block, maybe notranslate
    return;
  }

  translatedNode.textContent = translatedText;
  translatedWrapperNode.appendChild(translatedNode);
  await decorateTranslationNode(translatedNode, displayStyle);

  if (
    translatedNode.classList.contains(BLOCK_CONTENT_CLASS) &&
    shouldWrapInsideFloatFlow(targetNode)
  ) {
    translatedNode.setAttribute(FLOAT_WRAP_ATTRIBUTE, 'true');
  }
}

function isForceInlineTranslation(targetNode: TransNode): boolean {
  if (domFilter.isHTMLElement(targetNode)) {
    const computedStyle = window.getComputedStyle(targetNode);
    return (
      FORCE_INLINE_TRANSLATION_TAGS.has(targetNode.tagName) ||
      computedStyle.display.includes('flex')
    );
  }
  return false;
}
