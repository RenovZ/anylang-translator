import domBatcher from '@/lib/dom/batch-dom';
import domFilter from '@/lib/dom/filter';
import { SHADOW_HOST_CLASS, TRANSLATION_MODE_ATTRIBUTE } from '@/preset/dom';

import translationState from '../core/translate-state';

class TranslateCleanup {
  cleanWrapper(wrapper: HTMLElement): void {
    // Remove React shadow hosts (for error components)
    const translationShadowHost = wrapper.querySelector(`.${SHADOW_HOST_CLASS}`);
    if (translationShadowHost && domFilter.isHTMLElement(translationShadowHost)) {
      translationShadowHost.remove();
    }

    // Remove lightweight spinners
    const spinner = wrapper.querySelector('.anylang-spinner');
    if (spinner) {
      domBatcher.batchDOMOperation(() => spinner.remove());
    }
  }

  /**
   * Remove translated wrapper and restore original content based on translation mode
   * @param wrapper - The translated wrapper element to remove
   */
  restoreWrapper(wrapper: HTMLElement): void {
    this.cleanWrapper(wrapper);

    const translationMode = wrapper.getAttribute(TRANSLATION_MODE_ATTRIBUTE);

    if (translationMode === 'translation_only') {
      // For translation-only mode, find nearest ancestor in originalContentMap and restore
      let currentNode = wrapper.parentNode;

      while (currentNode && domFilter.isHTMLElement(currentNode)) {
        const originalContent = translationState.originalContentMap.get(currentNode);
        if (originalContent) {
          const nodeToRestore = currentNode;
          domBatcher.batchDOMOperation(() => {
            nodeToRestore.innerHTML = originalContent;
          });
          translationState.originalContentMap.delete(currentNode);
          return;
        }
        currentNode = currentNode.parentNode;
      }
    }

    // For bilingual mode or when no original content is found, just remove the wrapper
    domBatcher.batchDOMOperation(() => wrapper.remove());
  }

  removeAllWrappers(root: Document | ShadowRoot = document): void {
    const allWrappers: HTMLElement[] = [];

    function collect(r: Document | ShadowRoot | HTMLElement): void {
      const elements =
        r instanceof HTMLElement
          ? Array.from(r.querySelectorAll('*'))
          : Array.from((r as Document | ShadowRoot).querySelectorAll('*'));

      for (const el of elements) {
        if (domFilter.isHTMLElement(el) && domFilter.isWrapper(el)) {
          allWrappers.push(el);
        }
      }
    }

    collect(root);
    for (const wrapper of allWrappers) {
      this.restoreWrapper(wrapper);
    }
  }
}

export default new TranslateCleanup();
