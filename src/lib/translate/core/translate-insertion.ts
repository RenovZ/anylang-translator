import domBatcher from '@/lib/dom/batch-dom';
import domFilter from '@/lib/dom/filter';
import domNode from '@/lib/dom/node';
import { BLOCK_CONTENT_CLASS, INLINE_CONTENT_CLASS, NOTRANSLATE_CLASS } from '@/preset/dom';
import type { TransNode } from '@/types/dom';

import translateUtils from '../ui/translate-utils';

class TranslateInsertion {
  private addInlineTranslation(
    ownerDoc: Document,
    translatedWrapperNode: HTMLElement,
    translatedNode: HTMLElement
  ): void {
    const spaceNode = ownerDoc.createElement('span');
    spaceNode.textContent = '  ';
    translatedWrapperNode.appendChild(spaceNode);
    translatedNode.className = `${NOTRANSLATE_CLASS} ${INLINE_CONTENT_CLASS}`;
  }

  private addBlockTranslation(
    ownerDoc: Document,
    translatedWrapperNode: HTMLElement,
    translatedNode: HTMLElement
  ): void {
    const brNode = ownerDoc.createElement('br');
    translatedWrapperNode.appendChild(brNode);
    translatedNode.className = `${NOTRANSLATE_CLASS} ${BLOCK_CONTENT_CLASS}`;
  }

  async insertTranslation(
    translatedWrapperNode: HTMLElement,
    targetNode: TransNode,
    translatedText: string,
    forceBlockTranslation: boolean = false
  ): Promise<void> {
    const ownerDoc = domNode.getOwnerDocument(translatedWrapperNode);
    const translatedNode = ownerDoc.createElement('span');
    const forceInlineTranslation = translateUtils.isForceInline(targetNode);
    const customForceBlock =
      domFilter.isHTMLElement(targetNode) && domFilter.isSiteForceBlock(targetNode);

    // priority: customForceBlock > forceInlineTranslation > forceBlockTranslation > isInlineTransNode > isBlockTransNode
    if (customForceBlock) {
      this.addBlockTranslation(ownerDoc, translatedWrapperNode, translatedNode);
    } else if (forceInlineTranslation) {
      this.addInlineTranslation(ownerDoc, translatedWrapperNode, translatedNode);
    } else if (forceBlockTranslation) {
      this.addBlockTranslation(ownerDoc, translatedWrapperNode, translatedNode);
    } else if (domFilter.isInlineTransNode(targetNode)) {
      this.addInlineTranslation(ownerDoc, translatedWrapperNode, translatedNode);
    } else if (domFilter.isBlockTransNode(targetNode)) {
      this.addBlockTranslation(ownerDoc, translatedWrapperNode, translatedNode);
    } else {
      // not inline or block, maybe notranslate
      return;
    }

    translatedNode.textContent = translatedText;
    domBatcher.batchDOMOperation(() => translatedWrapperNode.appendChild(translatedNode));
  }
}

export default new TranslateInsertion();
