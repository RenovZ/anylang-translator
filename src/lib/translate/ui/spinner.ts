import domNode from '@/lib/dom/node';
import logger from '@/lib/logger';

import translateText from '../core/translate-text';

import styleInjector from './style-injector';

/**
 * Create a lightweight spinner element without React/Shadow DOM overhead
 * Uses Web Animations API instead of CSS keyframes to avoid DOM injection
 * This is significantly faster than the React-based spinner for bulk operations
 */

class TranslateSpinner {
  createLightweightSpinner(ownerDoc: Document): HTMLElement {
    const spinner = ownerDoc.createElement('span');
    spinner.className = 'anylang-spinner';
    // Inline styles keep the spinner resilient against host page CSS overrides.
    // Use a thin muted arc with transparent sides so bulk page translation does
    // not paint a dense field of high-contrast rings across the screen.
    spinner.style.cssText = `
        display: inline-block !important;
        width: 6px !important;
        height: 6px !important;
        min-width: 6px !important;
        min-height: 6px !important;
        max-width: 6px !important;
        max-height: 6px !important;
        aspect-ratio: 1 / 1 !important;
        margin: 0 4px !important;
        padding: 0 !important;
        vertical-align: middle !important;
        border: 1.5px solid transparent !important;
        border-top: 1.5px solid currentColor !important;
        border-radius: 50% !important;
        box-sizing: content-box !important;
        flex-shrink: 0 !important;
        flex-grow: 0 !important;
        align-self: center !important;
    `;

    // Respect user's motion preferences
    const prefersReducedMotion = ownerDoc.defaultView?.matchMedia
      ? ownerDoc.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

    // Use Web Animations API instead of CSS keyframes - no DOM manipulation needed
    if (!prefersReducedMotion && spinner.animate) {
      spinner.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], {
        duration: 600,
        iterations: Infinity,
        easing: 'linear'
      });
    }
    // For reduced motion or when Web Animations API isn't available,
    // keep a static muted segment so the loading state stays visible
    // without requiring animation.

    return spinner;
  }

  createSpinnerInside(translatedWrapperNode: HTMLElement): HTMLElement {
    const ownerDoc = domNode.getOwnerDocument(translatedWrapperNode);
    const root = domNode.getContainingShadowRoot(translatedWrapperNode) ?? ownerDoc;
    styleInjector.ensurePresetStyles(root);
    const spinner = this.createLightweightSpinner(ownerDoc);
    translatedWrapperNode.appendChild(spinner);
    return spinner;
  }

  async getTranslatedTextAndRemoveSpinner(
    _nodes: ChildNode[],
    textContent: string,
    spinner: HTMLElement,
    _translatedWrapperNode: HTMLElement
  ): Promise<string | undefined> {
    let translatedText: string | undefined;
    try {
      translatedText = await translateText.translateTextForPage(textContent);
    } catch (error) {
      logger.error('[anylang] Translation error:', { error });
    } finally {
      spinner.remove();
    }
    return translatedText;
  }
}

export default new TranslateSpinner();
