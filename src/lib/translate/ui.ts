import configStore from '@/lib/config';
import contentManager from '@/lib/content';
import { FORCE_INLINE_TAGS } from '@/lib/dom/constants';
import domFilter from '@/lib/dom/filter';
import domNode from '@/lib/dom/node';
import logger from '@/lib/logger';
import { TRANS_STYLE_KEY } from '@/preset/dom';
import type { TransNode } from '@/types/dom';
import type { TranslationNodeStyleConfig } from '@/types/translate';
import { translationNodeStylePresetSchema } from '@/types/translate';

import { prepareTranslationText } from './core';

class TranslateUtils {
  // Pattern matches numbers with optional thousand separators and decimal points
  // Examples: "123", "1,234", "1,234.56", "1 234", "1.234,56" (European format)
  NUMERIC_PATTERN = /^[\d\s,.-]+$/;
  CONTAINS_DIGIT_RE = /\d/;

  // Helper function to check if content is purely numeric
  isNumericContent(text: string): boolean {
    // Remove whitespace and check if remaining content is numeric
    const cleanedText = text.trim();
    if (!cleanedText) return false;
    // Allow numbers, decimals, commas, and common numeric separators
    if (!this.NUMERIC_PATTERN.test(cleanedText)) return false;
    // Additional check: ensure there's at least one digit
    return this.CONTAINS_DIGIT_RE.test(cleanedText);
  }

  isForceInline(targetNode: TransNode): boolean {
    if (domFilter.isHTMLElement(targetNode)) {
      const computedStyle = window.getComputedStyle(targetNode);
      return FORCE_INLINE_TAGS.has(targetNode.tagName) || computedStyle.display.includes('flex');
    }
    return false;
  }

  getDisplayTranslation(
    sourceText: string,
    translatedText: string | undefined
  ): string | undefined {
    if (translatedText === undefined) return undefined;
    return prepareTranslationText(sourceText) === prepareTranslationText(translatedText)
      ? ''
      : translatedText;
  }
}

export const translateUtils = new TranslateUtils();

type StyleRoot = Document | ShadowRoot;

class StyleInjector {
  // Cache the probe result per root so we only touch adoptedStyleSheets once.
  // Firefox content scripts can expose adoptedStyleSheets while still
  // throwing when the returned object is iterated or assigned via Xray
  // wrappers. Probe a full read -> assign -> read cycle instead of trusting
  // property existence alone.
  // Related bugs:
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1928865
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1770592
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1817675
  private constructableStyleSheetSupportMap = new WeakMap<StyleRoot, boolean>();
  private injectedPresetRoots = new WeakSet<StyleRoot>();
  private documentPresetStyleSheet: CSSStyleSheet | null = null;
  private shadowPresetStyleSheet: CSSStyleSheet | null = null;
  private customCSSMap = new WeakMap<StyleRoot, CSSStyleSheet>();
  private documentCachedCSS: string | null = null;

  private supportsConstructableStyleSheets(
    root: StyleRoot
  ): root is StyleRoot & { adoptedStyleSheets: CSSStyleSheet[] } {
    const cachedSupport = this.constructableStyleSheetSupportMap.get(root);
    if (cachedSupport !== undefined) return cachedSupport;

    try {
      if (typeof CSSStyleSheet === 'undefined') {
        this.constructableStyleSheetSupportMap.set(root, false);
        return false;
      }
      if (!('adoptedStyleSheets' in root) || root.adoptedStyleSheets === undefined) {
        this.constructableStyleSheetSupportMap.set(root, false);
        return false;
      }
      const probeSheet = new CSSStyleSheet();
      const previousSheets = [...root.adoptedStyleSheets];
      try {
        root.adoptedStyleSheets = [...previousSheets, probeSheet];
        const supportsAssignment = [...root.adoptedStyleSheets].includes(probeSheet);
        this.constructableStyleSheetSupportMap.set(root, supportsAssignment);
        return supportsAssignment;
      } finally {
        root.adoptedStyleSheets = previousSheets;
      }
    } catch {
      this.constructableStyleSheetSupportMap.set(root, false);
      return false;
    }
  }

  private injectStyleElement(root: StyleRoot, id: string, cssText: string): void {
    const container = root instanceof Document ? root.head : root;
    let styleElement = root.querySelector(`#${id}`) as HTMLStyleElement | null;
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = id;
      container.appendChild(styleElement);
    }
    if (styleElement.textContent !== cssText) {
      styleElement.textContent = cssText;
    }
  }

  private getPresetStyleSheet(root: StyleRoot): CSSStyleSheet {
    if (root instanceof Document) {
      if (!this.documentPresetStyleSheet) {
        this.documentPresetStyleSheet = new CSSStyleSheet();
      }
      return this.documentPresetStyleSheet;
    }
    if (!this.shadowPresetStyleSheet) {
      this.shadowPresetStyleSheet = new CSSStyleSheet();
    }
    return this.shadowPresetStyleSheet;
  }

  /** Ensure preset styles are injected into the given root */
  ensurePresetStyles(root: StyleRoot): void {
    if (this.injectedPresetRoots.has(root)) return;

    // Mark as injected first to prevent race condition with concurrent calls
    this.injectedPresetRoots.add(root);

    // When the browser/runtime only partially exposes constructable
    // stylesheets, fall back to injecting a normal <style> element.
    if (this.supportsConstructableStyleSheets(root)) {
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, this.getPresetStyleSheet(root)];
    } else {
      this.injectStyleElement(root, 'anylang-preset-styles', '');
    }
  }

  /** Inject custom CSS into the given root */
  async ensureCustomCSS(root: StyleRoot, cssText: string): Promise<void> {
    this.ensurePresetStyles(root);

    if (root instanceof Document && this.documentCachedCSS === cssText) return;

    if (this.supportsConstructableStyleSheets(root)) {
      let sheet = this.customCSSMap.get(root);
      if (!sheet) {
        sheet = new CSSStyleSheet();
        this.customCSSMap.set(root, sheet);
        root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
      }
      await sheet.replace(cssText);
    } else {
      this.injectStyleElement(root, 'anylang-custom-styles', cssText);
    }

    if (root instanceof Document) {
      this.documentCachedCSS = cssText;
    }
  }
}

export const styleInjector = new StyleInjector();

export function setTranslationDirAndLang(element: HTMLElement): void {
  const config = configStore.get();
  const { dir, lang } = contentManager.getLangDirection(config.targetLangCode);
  element.setAttribute('dir', dir);
  if (lang) {
    element.setAttribute('lang', lang);
  }
}

export async function decorateTranslationNode(
  translatedNode: HTMLElement,
  styleConfig: TranslationNodeStyleConfig
): Promise<void> {
  if (translationNodeStylePresetSchema.safeParse(styleConfig.preset).error) return;

  const root = domNode.getContainingShadowRoot(translatedNode) ?? document;

  if (styleConfig.isCustom && styleConfig.customCSS) {
    translatedNode.dataset[TRANS_STYLE_KEY] = 'custom';
    await styleInjector.ensureCustomCSS(root, styleConfig.customCSS);
    return;
  }

  translatedNode.dataset[TRANS_STYLE_KEY] = styleConfig.preset;
  styleInjector.ensurePresetStyles(root);
}

/**
 * Create a lightweight spinner element without React/Shadow DOM overhead
 * Uses Web Animations API instead of CSS keyframes to avoid DOM injection
 * This is significantly faster than the React-based spinner for bulk operations
 */
export function createLightweightSpinner(ownerDoc: Document): HTMLElement {
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

export function createSpinnerInside(translatedWrapperNode: HTMLElement): HTMLElement {
  const ownerDoc = domNode.getOwnerDocument(translatedWrapperNode);
  const root = domNode.getContainingShadowRoot(translatedWrapperNode) ?? ownerDoc;
  styleInjector.ensurePresetStyles(root);
  const spinner = createLightweightSpinner(ownerDoc);
  translatedWrapperNode.appendChild(spinner);
  return spinner;
}

export async function getTranslatedTextAndRemoveSpinner(
  nodes: ChildNode[],
  textContent: string,
  spinner: HTMLElement,
  translatedWrapperNode: HTMLElement
): Promise<string | undefined> {
  // TODO:
  logger.trace({ nodes, textContent, spinner, translatedWrapperNode });
  throw new Error('unimplemented');

  // let translatedText: string | undefined;

  // try {
  //   translatedText = await translateTextForPage(textContent);
  // } catch (error) {
  //   const errorComponent = React.createElement(TranslationError, {
  //     nodes,
  //     error: error as APICallError
  //   });

  //   const container = createReactShadowHost(errorComponent, {
  //     className: TRANSLATION_ERROR_CONTAINER_CLASS,
  //     position: 'inline',
  //     inheritStyles: false,
  //     cssContent: [themeCSS, textSmallCSS],
  //     style: {
  //       verticalAlign: 'middle'
  //     }
  //   });

  //   translatedWrapperNode.appendChild(container);
  // } finally {
  //   spinner.remove();
  // }

  // return translatedText;
}
