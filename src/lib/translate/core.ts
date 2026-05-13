import configStore from '@/lib/config';
import contentManager from '@/lib/content';
import domBatcher from '@/lib/dom/batch-dom';
import domFilter from '@/lib/dom/filter';
import domFind from '@/lib/dom/find';
import domNode from '@/lib/dom/node';
import domTraversal from '@/lib/dom/traversal';
import { sha256 } from '@/lib/hash';
import logger from '@/lib/logger';
import { sendMessage } from '@/lib/protocol';
import {
  BLOCK_ATTRIBUTE,
  BLOCK_CONTENT_CLASS,
  CONTENT_WRAPPER_CLASS,
  FLOAT_WRAP_ATTRIBUTE,
  INLINE_CONTENT_CLASS,
  MARK_ATTRIBUTES,
  NOTRANSLATE_CLASS,
  PARAGRAPH_ATTRIBUTE,
  TRANSLATION_MODE_ATTRIBUTE,
  WALKED_ATTRIBUTE
} from '@/preset/dom';
import type { TranslateMode } from '@/types/config';
import type { WebPagePromptContext } from '@/types/content';
import type { TransNode } from '@/types/dom';
import type { LangCode } from '@/types/lang';
import type { ProviderConfig } from '@/types/provider';
import { TranslationNodeStyleConfig } from '@/types/translate';

import { findPreviousTranslatedWrapperInside, removeTranslatedWrapperWithRestore } from './dom';
import {
  createSpinnerInside,
  decorateTranslationNode,
  getTranslatedTextAndRemoveSpinner,
  setTranslationDirAndLang,
  translateUtils
} from './ui';

// State management for translation operations
// Pre-compiled regex for better performance - removes all mark attributes
export const translateState = {
  translatingNodes: new WeakSet<ChildNode>(),
  originalContentMap: new Map<Element, string>(),
  MARK_ATTRIBUTES_REGEX: new RegExp(
    `\\s*(?:${[...MARK_ATTRIBUTES].join('|')})(?:=['""][^'"]*['""]|=[^\\s>]*)?`,
    'g'
  )
};

const HTML_COMMENT_RE = /<!--[\s\S]*?-->/g;

export async function translateNodes(
  nodes: ChildNode[],
  walkId: string,
  toggle: boolean = false,
  forceBlockTranslation: boolean = false
): Promise<void> {
  const config = configStore.get();
  const translationMode = config.adaptiveTranslate.translate.mode;
  if (translationMode === 'translation_only') {
    await translationOnlyMode(nodes, walkId, toggle);
  } else if (translationMode === 'bilingual') {
    await bilingualMode(nodes, walkId, toggle, forceBlockTranslation);
  }
}

async function bilingualMode(
  nodes: ChildNode[],
  walkId: string,
  toggle: boolean = false,
  forceBlockTranslation: boolean = false
): Promise<void> {
  const transNodes = nodes.filter((n): n is TransNode => domFilter.isTransNode(n));
  if (transNodes.length === 0) return;

  try {
    // prevent duplicate translation
    if (transNodes.every((node) => translateState.translatingNodes.has(node))) return;
    transNodes.forEach((node) => translateState.translatingNodes.add(node));

    const lastNode = transNodes.at(-1)!;
    const targetNode =
      transNodes.length === 1 &&
      domFilter.isBlockTransNode(lastNode) &&
      domFilter.isHTMLElement(lastNode)
        ? await domFind.deepSingleChild(lastNode)
        : lastNode;

    const existedTranslatedWrapper = findPreviousTranslatedWrapperInside(targetNode, walkId);
    if (existedTranslatedWrapper) {
      removeTranslatedWrapperWithRestore(existedTranslatedWrapper);
      if (toggle) return;
      transNodes.forEach((node) => translateState.translatingNodes.delete(node));
      void bilingualMode(nodes, walkId, toggle, forceBlockTranslation);
      return;
    }

    const textContent = transNodes
      .map((node) => domTraversal.extractTextContent(node))
      .join('')
      .trim();
    if (!textContent || translateUtils.isNumericContent(textContent)) return;

    const ownerDoc = domNode.getOwnerDocument(targetNode);
    const translatedWrapperNode = ownerDoc.createElement('span');
    translatedWrapperNode.className = `${NOTRANSLATE_CLASS} ${CONTENT_WRAPPER_CLASS}`;
    translatedWrapperNode.setAttribute(
      TRANSLATION_MODE_ATTRIBUTE,
      'bilingual' satisfies TranslateMode
    );
    translatedWrapperNode.setAttribute(WALKED_ATTRIBUTE, walkId);
    setTranslationDirAndLang(translatedWrapperNode);
    const spinner = createSpinnerInside(translatedWrapperNode);

    // Batch DOM insertion to reduce layout thrashing
    domBatcher.batchDOMOperation(() => {
      if (domFilter.isTextNode(targetNode) || transNodes.length > 1) {
        targetNode.parentNode?.insertBefore(translatedWrapperNode, targetNode.nextSibling);
      } else {
        (targetNode as HTMLElement).appendChild(translatedWrapperNode);
      }
    });

    const realTranslatedText = await getTranslatedTextAndRemoveSpinner(
      nodes,
      textContent,
      spinner,
      translatedWrapperNode
    );
    const translatedText = translateUtils.getDisplayTranslation(textContent, realTranslatedText);

    if (!translatedText) {
      // Keep the wrapper when translation failed so the injected error UI remains visible.
      // Only remove the wrapper when translation returned an empty string.
      if (translatedText === '') {
        // Batch the remove operation to execute remove operation after insert operation
        domBatcher.batchDOMOperation(() => translatedWrapperNode.remove());
      }
      return;
    }

    await insertTranslatedNodeIntoWrapper(
      translatedWrapperNode,
      targetNode,
      translatedText,
      {} as TranslationNodeStyleConfig,
      forceBlockTranslation
    );
  } finally {
    transNodes.forEach((node) => translateState.translatingNodes.delete(node));
  }
}

async function translationOnlyMode(
  nodes: ChildNode[],
  walkId: string,
  toggle: boolean = false
): Promise<void> {
  const isTransNodeAndNotTranslatedWrapper = (node: Node): node is TransNode => {
    if (domFilter.isHTMLElement(node) && node.classList.contains(CONTENT_WRAPPER_CLASS))
      return false;
    return domFilter.isTransNode(node);
  };

  const outerTransNodes = nodes.filter((n): n is TransNode => domFilter.isTransNode(n));
  if (outerTransNodes.length === 0) return;

  // snapshot the outer parent element, to prevent lose it if we go to deeper by deepSingleChild
  // test case is:
  // <div data-testid="test-node">
  //   <span style={{ display: 'inline' }}>原文</span> // get the outer parent snapshot before go to inner element
  //   <br />
  //   <span style={{ display: 'inline' }}>原文</span>
  //   原文
  //   <br />
  //   <span style={{ display: 'inline' }}>原文</span>
  // </div>,
  const outerParentElement = outerTransNodes[0].parentElement;
  // Only save originalContent when there's no existing translation wrapper
  // If wrapper exists, we're removing translation and should restore from saved content
  const hasExistingWrapper = outerParentElement?.querySelector(`.${CONTENT_WRAPPER_CLASS}`);
  if (
    outerParentElement &&
    !translateState.originalContentMap.has(outerParentElement) &&
    !hasExistingWrapper
  ) {
    translateState.originalContentMap.set(outerParentElement, outerParentElement.innerHTML);
  }

  let transNodes: TransNode[] = [];
  let allChildNodes: ChildNode[] = [];
  if (outerTransNodes.length === 1 && domFilter.isHTMLElement(outerTransNodes[0])) {
    const unwrappedHTMLChild = await domFind.deepSingleChild(outerTransNodes[0]);
    allChildNodes = Array.from(unwrappedHTMLChild.childNodes);
    transNodes = allChildNodes.filter(isTransNodeAndNotTranslatedWrapper);
  } else {
    transNodes = outerTransNodes;
    allChildNodes = nodes;
  }

  if (transNodes.length === 0) return;

  try {
    // prevent duplicate translation
    if (nodes.every((node) => translateState.translatingNodes.has(node))) return;
    nodes.forEach((node) => translateState.translatingNodes.add(node));

    const targetNode = transNodes.at(-1)!;

    const parentNode = targetNode.parentElement;
    if (!parentNode) {
      logger.error('targetNode.parentElement is null', { targetNode });
      return;
    }

    const existedTranslatedWrapper = findPreviousTranslatedWrapperInside(
      targetNode.parentElement,
      walkId
    );
    const existedTranslatedWrapperOutside = targetNode.parentElement.closest(
      `.${CONTENT_WRAPPER_CLASS}`
    );

    const finalTranslatedWrapper = existedTranslatedWrapperOutside ?? existedTranslatedWrapper;
    if (finalTranslatedWrapper && domFilter.isHTMLElement(finalTranslatedWrapper)) {
      removeTranslatedWrapperWithRestore(finalTranslatedWrapper);
      if (toggle) return;
      nodes.forEach((node) => translateState.translatingNodes.delete(node));
      // In translationOnly mode, restoreWrapper uses innerHTML to restore content,
      // which destroys the original DOM nodes and creates new ones. The 'nodes' array still references
      // the old detached nodes, and targetNode can't reference to the new dom added by innerHTML anymore.
      // Therefore, by recursively calling translateOnly here with the
      // same nodes array, we ensure the translation uses the newly created DOM elements since the
      // function will re-query and find the correct parent and child nodes from the restored DOM.
      void translationOnlyMode(nodes, walkId, toggle);
      return;
    }

    const innerTextContent = transNodes
      .map((node) => domTraversal.extractTextContent(node))
      .join('');
    if (!innerTextContent.trim() || translateUtils.isNumericContent(innerTextContent)) return;

    const cleanTextContent = (content: string): string => {
      if (!content) return content;
      return content
        .replace(translateState.MARK_ATTRIBUTES_REGEX, '')
        .replace(HTML_COMMENT_RE, ' ');
    };

    const hasExistingWrapperInParent = parentNode.querySelector(`.${CONTENT_WRAPPER_CLASS}`);
    if (!translateState.originalContentMap.has(parentNode) && !hasExistingWrapperInParent) {
      translateState.originalContentMap.set(parentNode, parentNode.innerHTML);
    }

    const getStringFormatFromNode = (node: Element | Text) => {
      if (domFilter.isTextNode(node)) return node.textContent;
      return node.outerHTML;
    };

    const textContent = cleanTextContent(transNodes.map(getStringFormatFromNode).join(''));
    if (!textContent) return;

    const ownerDoc = domNode.getOwnerDocument(targetNode);
    const translatedWrapperNode = ownerDoc.createElement('span');
    translatedWrapperNode.className = `${NOTRANSLATE_CLASS} ${CONTENT_WRAPPER_CLASS}`;
    translatedWrapperNode.setAttribute(
      TRANSLATION_MODE_ATTRIBUTE,
      'translation_only' satisfies TranslateMode
    );
    translatedWrapperNode.setAttribute(WALKED_ATTRIBUTE, walkId);
    translatedWrapperNode.style.display = 'contents';
    setTranslationDirAndLang(translatedWrapperNode);
    const spinner = createSpinnerInside(translatedWrapperNode);

    // Batch DOM insertion to reduce layout thrashing
    domBatcher.batchDOMOperation(() => {
      if (domFilter.isTextNode(targetNode) || transNodes.length > 1) {
        targetNode.parentNode?.insertBefore(translatedWrapperNode, targetNode.nextSibling);
      } else {
        (targetNode as HTMLElement).appendChild(translatedWrapperNode);
      }
    });

    const realTranslatedText = await getTranslatedTextAndRemoveSpinner(
      nodes,
      textContent,
      spinner,
      translatedWrapperNode
    );
    const translatedText = realTranslatedText
      ? translateUtils.getDisplayTranslation(textContent, realTranslatedText)
      : realTranslatedText;

    if (!translatedText) {
      // Keep the wrapper when translation failed so the injected error UI remains visible.
      // Only remove the wrapper when translation returned an empty string.
      if (translatedText === '') {
        // Batch the remove operation to execute remove operation after insert operation
        domBatcher.batchDOMOperation(() => translatedWrapperNode.remove());
      }
      return;
    }

    translatedWrapperNode.innerHTML = translatedText;

    // Batch final DOM mutations to reduce layout thrashing
    domBatcher.batchDOMOperation(() => {
      const lastChildNode = allChildNodes.at(-1)!;
      // Insert translated content after the last node
      lastChildNode.parentNode?.insertBefore(translatedWrapperNode, lastChildNode.nextSibling);
      // Remove all original nodes
      allChildNodes.forEach((childNode) => childNode.remove());
    });
  } finally {
    nodes.forEach((node) => translateState.translatingNodes.delete(node));
  }
}

// Minimum text length for skip language detection (shorter than general detection
// to catch short phrases like "Bonjour!" or "こんにちは")
export const MIN_SKIP_LEN = 10;

/**
 * Check if text should be skipped based on language detection.
 * Uses LLM detection if enabled, falls back to franc library.
 * @param text - Text to detect language for
 * @param skipLanguages - List of languages to skip translation for
 * @param enableLLM - Whether to use LLM for language detection
 * @returns true if text language is in skipLanguages list (should skip translation)
 */
export async function shouldSkipLang(
  text: string,
  skipLanguages: LangCode[],
  enableLLM: boolean
): Promise<boolean> {
  const detectedLang = await contentManager.detectLangCode(text, {
    minLength: MIN_SKIP_LEN,
    enableLLM
  });

  if (!detectedLang) {
    return false;
  }

  return skipLanguages.includes(detectedLang);
}

export function normalizeValue(value: string | null | undefined): string | null | undefined {
  if (value == null) {
    return value;
  }
  return value.trim() === '' ? null : value;
}

export function normalizeContext(
  webPageContext?: WebPagePromptContext
): WebPagePromptContext | undefined {
  if (!webPageContext) {
    return undefined;
  }

  return {
    webTitle: normalizeValue(webPageContext.webTitle),
    webContent: normalizeValue(webPageContext.webContent),
    webSummary: normalizeValue(webPageContext.webSummary)
  };
}

function buildHashComponents(
  preparedText: string,
  providerConfig: ProviderConfig,
  sourceLangCode: LangCode | 'auto',
  targetLangCode: LangCode,
  normalizedWebPageContext?: WebPagePromptContext
): string[] {
  const hashComponents = [
    preparedText,
    JSON.stringify(providerConfig),
    sourceLangCode,
    targetLangCode
  ];

  if (normalizedWebPageContext) {
    if (normalizedWebPageContext.webTitle) {
      hashComponents.push(`webTitle:${normalizedWebPageContext.webTitle}`);
    }
    if (normalizedWebPageContext.webContent) {
      // Use a substring to avoid huge hash inputs while still differentiating contexts.
      hashComponents.push(`webContent:${normalizedWebPageContext.webContent.slice(0, 1000)}`);
    }
    if (normalizedWebPageContext.webSummary) {
      hashComponents.push(`webSummary:${normalizedWebPageContext.webSummary}`);
    }
  }

  return hashComponents;
}

/**
 * Core translation function — pure, zero config fetching.
 * All dependencies must be provided explicitly.
 */
export async function translateTextCore(options: {
  text: string;
  sourceLangCode: LangCode | 'auto';
  targetLangCode: LangCode;
  providerConfig: ProviderConfig;
  enableAIContentAware?: boolean;
  extraHashTags?: string[];
  webPageContext?: WebPagePromptContext;
}): Promise<string> {
  const {
    text,
    sourceLangCode,
    targetLangCode,
    providerConfig,
    extraHashTags = [],
    webPageContext
  } = options;

  const preparedText = prepareTranslationText(text);
  if (preparedText === '') {
    return '';
  }

  const normalizedWebPageContext = normalizeContext(webPageContext);

  const hashComponents = buildHashComponents(
    preparedText,
    providerConfig,
    sourceLangCode,
    targetLangCode,
    normalizedWebPageContext
  );

  // Add extra hash tags for cache differentiation
  hashComponents.push(...extraHashTags);

  const msg = {
    text: preparedText,
    sourceLangCode,
    targetLangCode,
    providerConfig,
    scheduleAt: Date.now(),
    hash: sha256(...hashComponents),
    webTitle: normalizedWebPageContext?.webTitle,
    webContent: normalizedWebPageContext?.webContent,
    webSummary: normalizedWebPageContext?.webSummary
  };
  logger.debug('enqueueTranslateRequest', { msg });
  return await sendMessage('enqueueTranslateRequest', msg);
}

export async function translateWalkedElement(
  element: HTMLElement,
  walkId: string,
  toggle: boolean = false
): Promise<void> {
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
      promises.push(translateNodes([element], walkId, toggle));
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
          promises.push(translateNodes(consecutiveInlineNodes, walkId, toggle, !isFlexParent));
          consecutiveInlineNodes = [];
          promises.push(translateWalkedElement(child, walkId, toggle));
        } else {
          consecutiveInlineNodes.push(child);
        }
      }
      if (consecutiveInlineNodes.length) {
        promises.push(translateNodes(consecutiveInlineNodes, walkId, toggle, !isFlexParent));
      }
    }
  } else {
    for (const child of Array.from(element.childNodes)) {
      if (domFilter.isHTMLElement(child)) {
        promises.push(translateWalkedElement(child, walkId, toggle));
      }
    }
    if (element.shadowRoot) {
      for (const child of Array.from(element.shadowRoot.children)) {
        if (domFilter.isHTMLElement(child)) {
          promises.push(translateWalkedElement(child, walkId, toggle));
        }
      }
    }
  }

  // This simultaneously ensures that when concurrent translation
  // and external await call this function, all translations are completed
  await Promise.all(promises);
}

const INVISIBLE_TRANSLATION_CHARACTERS_REGEX = /[\u200B-\u200D\uFEFF]/g;

export function prepareTranslationText(value: string | null | undefined): string {
  return value?.replace(INVISIBLE_TRANSLATION_CHARACTERS_REGEX, '').trim() ?? '';
}

async function insertTranslatedNodeIntoWrapper(
  translatedWrapperNode: HTMLElement,
  targetNode: TransNode,
  translatedText: string,
  translationNodeStyle: TranslationNodeStyleConfig,
  forceBlockTranslation: boolean = false
): Promise<void> {
  // TODO:
  logger.trace({
    translatedWrapperNode,
    targetNode,
    translatedText,
    translationNodeStyle,
    forceBlockTranslation
  });
  throw new Error('unimplemented translationNodeStyle');

  // Use the wrapper's owner document
  const ownerDoc = domNode.getOwnerDocument(translatedWrapperNode);
  const translatedNode = ownerDoc.createElement('span');
  const forceInlineTranslation = translateUtils.isForceInline(targetNode);
  const customForceBlock =
    domFilter.isHTMLElement(targetNode) && domFilter.isSiteForceBlock(targetNode);

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

  // translatedNode.textContent = translatedText;
  // domBatcher.batchDOMOperation(() => translatedWrapperNode.appendChild(translatedNode));

  translatedNode.textContent = translatedText;
  translatedWrapperNode.appendChild(translatedNode);
  await decorateTranslationNode(translatedNode, translationNodeStyle);

  if (
    translatedNode.classList.contains(BLOCK_CONTENT_CLASS) &&
    shouldWrapInsideFloatFlow(targetNode)
  ) {
    translatedNode.setAttribute(FLOAT_WRAP_ATTRIBUTE, 'true');
  }
}

function addInlineTranslation(
  ownerDoc: Document,
  translatedWrapperNode: HTMLElement,
  translatedNode: HTMLElement
): void {
  const spaceNode = ownerDoc.createElement('span');
  spaceNode.textContent = '  ';
  translatedWrapperNode.appendChild(spaceNode);
  translatedNode.className = `${NOTRANSLATE_CLASS} ${INLINE_CONTENT_CLASS}`;
}

function addBlockTranslation(
  ownerDoc: Document,
  translatedWrapperNode: HTMLElement,
  translatedNode: HTMLElement
): void {
  const brNode = ownerDoc.createElement('br');
  translatedWrapperNode.appendChild(brNode);
  translatedNode.className = `${NOTRANSLATE_CLASS} ${BLOCK_CONTENT_CLASS}`;
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

function findActiveFloatSibling(paragraphElement: HTMLElement): HTMLElement | null {
  const flowContainer = paragraphElement.parentElement;
  if (!flowContainer) return null;

  const paragraphRect = paragraphElement.getBoundingClientRect();

  for (const sibling of Array.from(flowContainer.children)) {
    if (!domFilter.isHTMLElement(sibling)) continue;
    if (sibling === paragraphElement || sibling.contains(paragraphElement)) continue;

    const floatCandidates = [sibling, ...Array.from(sibling.querySelectorAll<HTMLElement>('*'))];
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

function isFloatedElement(element: HTMLElement): boolean {
  const floatValue = window.getComputedStyle(element).float;
  return floatValue === 'left' || floatValue === 'right';
}

function hasVisibleLayoutBox(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}
