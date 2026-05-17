import * as domBatcher from '@/lib/dom/batcher';
import domFilter from '@/lib/dom/filter';
import domFinder from '@/lib/dom/finder';
import domTraversal from '@/lib/dom/traversal';
import { sha256 } from '@/lib/hash';
import logger from '@/lib/logger';
import {
  BLOCK_ATTRIBUTE,
  CONTENT_WRAPPER_CLASS,
  MARK_ATTRIBUTES,
  NOTRANSLATE_CLASS,
  PARAGRAPH_ATTRIBUTE,
  TRANSLATE_MODE_ATTRIBUTE,
  WALKED_ATTRIBUTE
} from '@/preset/dom';
import type { TranslateMode } from '@/types/config';
import type { WebPagePromptContext } from '@/types/content';
import type { TransNode } from '@/types/dom';
import type { LangCode } from '@/types/lang';
import { isLLMProvider, type ProviderConfig } from '@/types/provider';
import type { TranslateOptions } from '@/types/translate';

import { getOwnerDocument } from '../dom';
import { getTranslatePrompt } from '../prompt';
import { sendMessage } from '../protocol';

import {
  findPreviousTranslatedWrapperInside,
  insertTranslatedNodeIntoWrapper,
  removeTranslatedWrapperWithRestore
} from './dom';
import {
  createSpinnerInside,
  getTranslatedTextAndRemoveSpinner,
  setTranslationDirAndLang
} from './ui';
import { translateUtils } from './utils';

const HTML_COMMENT_RE = /<!--[\s\S]*?-->/g;

function getDisplayTranslation(sourceText: string, translatedText: string | undefined) {
  if (translatedText === undefined) {
    return undefined;
  }

  return translateUtils.prepareTranslationText(sourceText) ===
    translateUtils.prepareTranslationText(translatedText)
    ? ''
    : translatedText;
}

export const translateState = {
  // State management for translation operations
  nodes: new WeakSet<ChildNode>(),
  originalContentMap: new Map<Element, string>(),

  // Pre-compiled regex for better performance - removes all mark attributes
  MARK_ATTRIBUTES_REGEX: new RegExp(
    `\\s*(?:${[...MARK_ATTRIBUTES].join('|')})(?:=['""][^'"]*['""]|=[^\\s>]*)?`,
    'g'
  )
};

export async function translateNodes(
  nodes: ChildNode[],
  walkId: string,
  options: Required<Pick<TranslateOptions, 'mode'>> & Omit<TranslateOptions, 'mode'>,
  toggle: boolean = false,
  forceBlockTranslation: boolean = false
): Promise<void> {
  const { mode } = options;
  if (mode === 'translation_only') {
    await translationOnlyMode(nodes, walkId, options, toggle);
  } else if (mode === 'bilingual') {
    await bilingualMode(nodes, walkId, options, toggle, forceBlockTranslation);
  }
}

async function bilingualMode(
  nodes: ChildNode[],
  walkId: string,
  options: Required<Pick<TranslateOptions, 'mode'>> & Omit<TranslateOptions, 'mode'>,
  toggle: boolean = false,
  forceBlockTranslation: boolean = false
): Promise<void> {
  const transNodes = nodes.filter(domFilter.isTransNode.bind(domFilter));
  if (transNodes.length === 0) return;

  try {
    // prevent duplicate translation
    if (transNodes.every((node) => translateState.nodes.has(node))) {
      return;
    }
    transNodes.forEach((node) => translateState.nodes.add(node));

    const lastNode = transNodes.at(-1)!;
    const targetNode =
      transNodes.length === 1 &&
      domFilter.isBlockTransNode(lastNode) &&
      domFilter.isHTMLElement(lastNode)
        ? await domFinder.unwrapDeepestOnlyHTMLChild(lastNode, options.pageRange)
        : lastNode;

    const existedTranslatedWrapper = findPreviousTranslatedWrapperInside(targetNode, walkId);
    if (existedTranslatedWrapper) {
      removeTranslatedWrapperWithRestore(existedTranslatedWrapper);
      if (toggle) {
        return;
      } else {
        nodes.forEach((node) => translateState.nodes.delete(node));
        void bilingualMode(nodes, walkId, options, toggle);
        return;
      }
    }

    const text = transNodes
      .map((node) => domTraversal.extractTextContent(node, options.pageRange))
      .join('')
      .trim();
    if (!text || translateUtils.isNumericContent(text)) return;

    // TODO: 不确定是否需要这个
    // if (await shouldFilterSmallParagraph(textContent, config)) return;

    const ownerDoc = getOwnerDocument(targetNode);
    const translatedWrapperNode = ownerDoc.createElement('span');
    translatedWrapperNode.className = `${NOTRANSLATE_CLASS} ${CONTENT_WRAPPER_CLASS}`;
    translatedWrapperNode.setAttribute(
      TRANSLATE_MODE_ATTRIBUTE,
      'bilingual' satisfies TranslateMode
    );
    translatedWrapperNode.setAttribute(WALKED_ATTRIBUTE, walkId);
    setTranslationDirAndLang(translatedWrapperNode, options.targetLangCode);
    const spinner = createSpinnerInside(translatedWrapperNode);

    // Batch DOM insertion to reduce layout thrashing
    const insertOperation = () => {
      if (domFilter.isTextNode(targetNode) || transNodes.length > 1) {
        targetNode.parentNode?.insertBefore(translatedWrapperNode, targetNode.nextSibling);
      } else {
        targetNode.appendChild(translatedWrapperNode);
      }
    };
    domBatcher.batchDOMOperation(insertOperation);

    const realTranslatedText = await getTranslatedTextAndRemoveSpinner(
      nodes,
      spinner,
      translatedWrapperNode,
      { text, ...options }
    );

    const translatedText = getDisplayTranslation(text, realTranslatedText);

    if (!translatedText) {
      // Only remove wrapper if translation returned empty (not needed),
      // but keep it for error display (undefined)
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
      options.displayStyle,
      forceBlockTranslation
    );
  } finally {
    transNodes.forEach((node) => translateState.nodes.delete(node));
  }
}

async function translationOnlyMode(
  nodes: ChildNode[],
  walkId: string,
  options: Required<Pick<TranslateOptions, 'mode'>> & Omit<TranslateOptions, 'mode'>,
  toggle: boolean = false
): Promise<void> {
  const isTransNodeAndNotTranslatedWrapper = (node: Node): node is TransNode => {
    if (domFilter.isHTMLElement(node) && node.classList.contains(CONTENT_WRAPPER_CLASS))
      return false;
    return domFilter.isTransNode(node);
  };

  const outerTransNodes = nodes.filter(domFilter.isTransNode.bind(domFilter));
  if (outerTransNodes.length === 0) return;

  // snapshot the outer parent element, to prevent lose it if we go to deeper by unwrapDeepestOnlyHTMLChild
  // test case is:
  // <div data-testid="test-node">
  //   <span style={{ display: 'inline' }}>原文</span> // get the outer parent snapshot before go to inner element
  //   <br />
  //   <span style={{ display: 'inline' }}>原文</span>
  //   原文
  //   <br />
  //   <span style={{ display: 'inline' }}>原文</span>
  // </div>,
  // Only save originalContent when there's no existing translation wrapper
  // If wrapper exists, we're removing translation and should restore from saved content
  const outerParentElement = outerTransNodes[0].parentElement;
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
    const unwrappedHTMLChild = await domFinder.unwrapDeepestOnlyHTMLChild(
      outerTransNodes[0],
      options.pageRange
    );
    allChildNodes = Array.from(unwrappedHTMLChild.childNodes);
    transNodes = allChildNodes.filter(isTransNodeAndNotTranslatedWrapper);
  } else {
    transNodes = outerTransNodes;
    allChildNodes = nodes;
  }

  if (transNodes.length === 0) return;

  try {
    if (nodes.every((node) => translateState.nodes.has(node))) {
      return;
    }
    nodes.forEach((node) => translateState.nodes.add(node));

    const targetNode = transNodes.at(-1)!;

    const parentNode = targetNode.parentElement;
    if (!parentNode) {
      logger.error('targetNode.parentElement is null', {
        parentNode: targetNode.parentElement,
        targetNode: targetNode
      });
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
      if (toggle) {
        return;
      } else {
        // In translationOnly mode, removeTranslatedWrapperWithRestore uses innerHTML to restore content,
        // which destroys the original DOM nodes and creates new ones. The 'nodes' array still references
        // the old detached nodes, and targetNode can't reference to the new dom added by innerHTML anymore.
        // Therefore, by recursively calling translateNodeTranslationOnlyMode here with the
        // same nodes array, we ensure the translation uses the newly created DOM elements since the
        // function will re-query and find the correct parent and child nodes from the restored DOM.
        nodes.forEach((node) => translateState.nodes.delete(node));
        void translationOnlyMode(nodes, walkId, options, toggle);
        return;
      }
    }

    const innerTextContent = transNodes
      .map((node) => domTraversal.extractTextContent(node, options.pageRange))
      .join('');
    if (!innerTextContent.trim() || translateUtils.isNumericContent(innerTextContent)) return;

    // TODO: 不确定是否需要这个
    // if (await shouldFilterSmallParagraph(innerTextContent, config)) return;

    const cleanTextContent = (content: string): string => {
      if (!content) return content;

      let cleanedContent = content.replace(translateState.MARK_ATTRIBUTES_REGEX, '');
      cleanedContent = cleanedContent.replace(HTML_COMMENT_RE, ' ');

      return cleanedContent;
    };

    // Only save originalContent when there's no existing translation wrapper
    const hasExistingWrapperInParent = parentNode.querySelector(`.${CONTENT_WRAPPER_CLASS}`);
    if (!translateState.originalContentMap.has(parentNode) && !hasExistingWrapperInParent) {
      translateState.originalContentMap.set(parentNode, parentNode.innerHTML);
    }

    const getStringFormatFromNode = (node: Element | Text) => {
      if (domFilter.isTextNode(node)) return node.textContent;

      return node.outerHTML;
    };

    const text = cleanTextContent(transNodes.map(getStringFormatFromNode).join(''));
    if (!text) return;

    const ownerDoc = getOwnerDocument(targetNode);
    const translatedWrapperNode = ownerDoc.createElement('span');
    translatedWrapperNode.className = `${NOTRANSLATE_CLASS} ${CONTENT_WRAPPER_CLASS}`;
    translatedWrapperNode.setAttribute(
      TRANSLATE_MODE_ATTRIBUTE,
      'translation_only' satisfies TranslateMode
    );
    translatedWrapperNode.setAttribute(WALKED_ATTRIBUTE, walkId);
    translatedWrapperNode.style.display = 'contents';
    setTranslationDirAndLang(translatedWrapperNode, options.targetLangCode);
    const spinner = createSpinnerInside(translatedWrapperNode);

    // Batch DOM insertion to reduce layout thrashing
    const insertOperation = () => {
      if (domFilter.isTextNode(targetNode) || transNodes.length > 1) {
        targetNode.parentNode?.insertBefore(translatedWrapperNode, targetNode.nextSibling);
      } else {
        targetNode.appendChild(translatedWrapperNode);
      }
    };
    domBatcher.batchDOMOperation(insertOperation);

    const realTranslatedText = await getTranslatedTextAndRemoveSpinner(
      nodes,
      spinner,
      translatedWrapperNode,
      { text, ...options }
    );
    const translatedText = realTranslatedText
      ? getDisplayTranslation(text, realTranslatedText)
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
      // Insert translated content after the last node
      const lastChildNode = allChildNodes.at(-1)!;
      lastChildNode.parentNode?.insertBefore(translatedWrapperNode, lastChildNode.nextSibling);

      // Remove all original nodes
      allChildNodes.forEach((childNode) => childNode.remove());
    });
  } finally {
    nodes.forEach((node) => translateState.nodes.delete(node));
  }
}

export async function translateWalkedElement(
  element: HTMLElement,
  walkId: string,
  options: Required<Pick<TranslateOptions, 'mode'>> & Omit<TranslateOptions, 'mode'>,
  toggle: boolean = false
): Promise<void> {
  if (!toggle && element.querySelector(`.${CONTENT_WRAPPER_CLASS}`)) return;

  // if the walkId is not the same, return
  if (element.getAttribute(WALKED_ATTRIBUTE) !== walkId) return;

  const promises: Promise<void>[] = [];

  if (element.hasAttribute(PARAGRAPH_ATTRIBUTE)) {
    let hasBlockNodeChild = false;

    const childNodes = Array.from(element.childNodes);
    for (const child of childNodes) {
      if (domFilter.isHTMLElement(child) && child.hasAttribute(BLOCK_ATTRIBUTE)) {
        hasBlockNodeChild = true;
        break;
      }
    }

    const computedStyle = window.getComputedStyle(element);
    const isFlexParent = computedStyle.display.includes('flex');

    if (!hasBlockNodeChild) {
      promises.push(translateNodes([element], walkId, options, toggle));
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
          promises.push(translateNodes(consecutiveInlineNodes, walkId, options, toggle));
          consecutiveInlineNodes = [];
          promises.push(translateWalkedElement(child, walkId, options, toggle));
        } else {
          consecutiveInlineNodes.push(child);
        }
      }

      if (consecutiveInlineNodes.length) {
        promises.push(
          translateNodes(consecutiveInlineNodes, walkId, options, toggle, !isFlexParent)
        );
        // consecutiveInlineNodes = [];
      }
    }
  } else {
    const childNodes = Array.from(element.childNodes);
    for (const child of childNodes) {
      if (domFilter.isHTMLElement(child)) {
        promises.push(translateWalkedElement(child, walkId, options, toggle));
      }
    }
    if (element.shadowRoot) {
      const children = Array.from(element.shadowRoot.children);
      for (const child of children) {
        if (domFilter.isHTMLElement(child)) {
          promises.push(translateWalkedElement(child, walkId, options, toggle));
        }
      }
    }
  }
  // This simultaneously ensures that when concurrent translation
  // and external await call this function, all translations are completed
  await Promise.all(promises);
}

async function buildWebPageHashComponents(
  text: string,
  providerConfig: ProviderConfig,
  sourceLangCode: LangCode | 'auto' | 'default',
  targetLangCode: LangCode,
  enableAIContentAware: boolean,
  webPageContext?: WebPagePromptContext
): Promise<string[]> {
  const preparedText = translateUtils.prepareTranslationText(text);
  const context = translateUtils.normalizeWebPagePromptContext(webPageContext);
  const hashComponents = [
    preparedText,
    JSON.stringify(providerConfig),
    sourceLangCode,
    targetLangCode
  ];

  if (!isLLMProvider(providerConfig)) return hashComponents;

  const { systemPrompt, prompt } = getTranslatePrompt(
    providerConfig,
    targetLangCode,
    preparedText,
    {
      isBatch: true,
      context
    }
  );
  hashComponents.push(systemPrompt, prompt);
  hashComponents.push(
    enableAIContentAware
      ? 'enableAIContentAware=true' // TODO: 这是什么意思
      : 'enableAIContentAware=false'
  );

  if (enableAIContentAware && context) {
    if (context.webTitle) {
      hashComponents.push(`webTitle:${context.webTitle}`);
    }
    if (context.webContent) {
      // Use a substring hash to avoid huge hash inputs while still differentiating contexts.
      hashComponents.push(`webContent:${context.webContent.slice(0, 1000)}`);
    }
    if (context.webSummary) {
      hashComponents.push(`webSummary:${context.webSummary}`);
    }
  }

  return hashComponents;
}

/**
 * Core translation function — pure, zero config fetching.
 * All dependencies must be provided explicitly.
 */
export async function translateTextCore(
  options: Required<Pick<TranslateOptions, 'text'>> &
    Omit<TranslateOptions, 'text'> & {
      enableAIContentAware?: boolean;
      extraHashTags?: string[];
      webPageContext?: WebPagePromptContext;
    }
): Promise<string> {
  const {
    text,
    sourceLangCode,
    targetLangCode,
    providerConfig,
    enableAIContentAware = false,
    extraHashTags = [],
    webPageContext
  } = options;

  const preparedText = translateUtils.prepareTranslationText(text);
  if (preparedText === '') return '';

  const normalizedWebPageContext = translateUtils.normalizeWebPagePromptContext(webPageContext);

  const hashComponents = await buildWebPageHashComponents(
    preparedText,
    providerConfig,
    sourceLangCode,
    targetLangCode,
    enableAIContentAware,
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
  return await sendMessage('enqueueAdaptiveTranslateRequest', msg);
}
