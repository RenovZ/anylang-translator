import configStore from '@/lib/config';
import domBatcher from '@/lib/dom/batch-dom';
import domFilter from '@/lib/dom/filter';
import domFind from '@/lib/dom/find';
import domNode from '@/lib/dom/node';
import domTraversal from '@/lib/dom/traversal';
import logger from '@/lib/logger';
import {
  CONTENT_WRAPPER_CLASS,
  NOTRANSLATE_CLASS,
  TRANSLATION_MODE_ATTRIBUTE,
  WALKED_ATTRIBUTE
} from '@/preset/dom';
import type { TranslateMode } from '@/types/config';
import type { TransNode } from '@/types/dom';

import translateCleanup from '../dom/translate-cleanup';
import translateWrapper from '../dom/translate-wrapper';
import translateSpinner from '../ui/spinner';
import translateDir from '../ui/translate-dir';
import translateUtils from '../ui/translate-utils';

import translateInsertion from './translate-insertion';
import translateState from './translate-state';

const HTML_COMMENT_RE = /<!--[\s\S]*?-->/g;

class TranslateModeManager {
  async run(
    nodes: ChildNode[],
    walkId: string,
    toggle: boolean = false,
    forceBlockTranslation: boolean = false
  ): Promise<void> {
    const config = configStore.get();
    const translationMode = config.quickTranslate.translate.mode;
    if (translationMode === 'translation_only') {
      await this.translationOnly(nodes, walkId, toggle);
    } else if (translationMode === 'bilingual') {
      await this.bilingual(nodes, walkId, toggle, forceBlockTranslation);
    }
  }

  private async bilingual(
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

      const existedTranslatedWrapper = translateWrapper.findWrapper(targetNode, walkId);
      if (existedTranslatedWrapper) {
        translateCleanup.restoreWrapper(existedTranslatedWrapper);
        if (toggle) return;
        transNodes.forEach((node) => translateState.translatingNodes.delete(node));
        void this.bilingual(nodes, walkId, toggle, forceBlockTranslation);
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
      translateDir.setTranslationDirAndLang(translatedWrapperNode);
      const spinner = translateSpinner.createSpinnerInside(translatedWrapperNode);

      // Batch DOM insertion to reduce layout thrashing
      domBatcher.batchDOMOperation(() => {
        if (domFilter.isTextNode(targetNode) || transNodes.length > 1) {
          targetNode.parentNode?.insertBefore(translatedWrapperNode, targetNode.nextSibling);
        } else {
          (targetNode as HTMLElement).appendChild(translatedWrapperNode);
        }
      });

      const realTranslatedText = await translateSpinner.getTranslatedTextAndRemoveSpinner(
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

      await translateInsertion.insertTranslation(
        translatedWrapperNode,
        targetNode,
        translatedText,
        forceBlockTranslation
      );
    } finally {
      transNodes.forEach((node) => translateState.translatingNodes.delete(node));
    }
  }

  private async translationOnly(
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

      const existedTranslatedWrapper = translateWrapper.findWrapper(
        targetNode.parentElement!,
        walkId
      );
      const existedTranslatedWrapperOutside = targetNode.parentElement!.closest(
        `.${CONTENT_WRAPPER_CLASS}`
      );

      const finalTranslatedWrapper = existedTranslatedWrapperOutside ?? existedTranslatedWrapper;
      if (finalTranslatedWrapper && domFilter.isHTMLElement(finalTranslatedWrapper)) {
        translateCleanup.restoreWrapper(finalTranslatedWrapper);
        if (toggle) return;
        nodes.forEach((node) => translateState.translatingNodes.delete(node));
        // In translationOnly mode, restoreWrapper uses innerHTML to restore content,
        // which destroys the original DOM nodes and creates new ones. The 'nodes' array still references
        // the old detached nodes, and targetNode can't reference to the new dom added by innerHTML anymore.
        // Therefore, by recursively calling translateOnly here with the
        // same nodes array, we ensure the translation uses the newly created DOM elements since the
        // function will re-query and find the correct parent and child nodes from the restored DOM.
        void this.translationOnly(nodes, walkId, toggle);
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
      translateDir.setTranslationDirAndLang(translatedWrapperNode);
      const spinner = translateSpinner.createSpinnerInside(translatedWrapperNode);

      // Batch DOM insertion to reduce layout thrashing
      domBatcher.batchDOMOperation(() => {
        if (domFilter.isTextNode(targetNode) || transNodes.length > 1) {
          targetNode.parentNode?.insertBefore(translatedWrapperNode, targetNode.nextSibling);
        } else {
          (targetNode as HTMLElement).appendChild(translatedWrapperNode);
        }
      });

      const realTranslatedText = await translateSpinner.getTranslatedTextAndRemoveSpinner(
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
}

export default new TranslateModeManager();
