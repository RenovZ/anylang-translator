import { APICallError } from 'ai';
import { browser } from 'wxt/browser';

import appCss from '@/assets/app.css?inline';
import bundledFontsCss from '@/assets/bundled-fonts.css?raw';
import customTranslationNodeCss from '@/assets/custom-translation-node.css?raw';
import hostThemeCss from '@/assets/host-theme.css?raw';
import textCss from '@/assets/text.css?inline';
import translationNodePresetCss from '@/assets/translation-node-preset.css?raw';
import { toast } from '@/components/toast-wrapper';
import TranslateError, { TranslateErrorProp } from '@/components/TranslateError.svelte';
import configStore from '@/lib/config';
import contentManager from '@/lib/content';
import cryptoPolyfill from '@/lib/crypto-polyfill';
import { getContainingShadowRoot, getOwnerDocument } from '@/lib/dom';
import domFilter from '@/lib/dom/filter';
import domFinder from '@/lib/dom/finder';
import { createShadowHost } from '@/lib/dom/shadow';
import domTraversal from '@/lib/dom/traversal';
import i18n from '@/lib/i18n';
import logger from '@/lib/logger';
import {
  CUSTOM_PRESET_STYLES_INJECTOR_ID,
  CUSTOM_STYLES_INJECTOR_ID,
  PRESET_STYLES_INJECTOR_ID,
  SPINNER_CLASS,
  TRANS_STYLE_KEY,
  TRANSLATE_ERROR_CONTAINER_CLASS
} from '@/preset/dom';
import { Point } from '@/types/dom';
import { DetectedLangCode, LangCode } from '@/types/lang';
import type { AdaptiveTranslateContext } from '@/types/prompt';
import { isLLMProvider } from '@/types/provider';
import type { CustomDisplayStyle, DisplayStyle, TranslateOptions } from '@/types/translate';
import { displayStyleSchema } from '@/types/translate';

import { translateTextCore, translateWalkedElement } from './core';
import * as webpage from './webpage';

type StyleRoot = Document | ShadowRoot;

class StyleInjector {
  private readonly BASE_PRESET_CSS =
    customTranslationNodeCss.replace(/@import[^;]+;/g, '') +
    translationNodePresetCss +
    bundledFontsCss.replace(
      /url\(['"']?(\/fonts\/[^'"')]+)['"']?\)/g,
      (_, p1) => `url('${browser.runtime.getURL(p1)}')`
    );
  private readonly DOCUMENT_PRESET_CSS = hostThemeCss + this.BASE_PRESET_CSS;
  private readonly SHADOW_PRESET_CSS =
    hostThemeCss.replace(/:root/g, ':host') + this.BASE_PRESET_CSS;

  // Cache the probe result per root so we only touch adoptedStyleSheets once.
  private constructableStyleSheetSupportMap = new WeakMap<StyleRoot, boolean>();
  private injectedPresetRoots = new WeakSet<StyleRoot>();
  private documentPresetStyleSheet: CSSStyleSheet | null = null;
  private shadowPresetStyleSheet: CSSStyleSheet | null = null;
  private customCSSMap = new WeakMap<StyleRoot, CSSStyleSheet>();
  private documentCachedCSS: string | null = null;

  // 共享单例 — 因为 custom styles 是全局用户设置，所有 root 注入相同 CSS
  private customStylesSheet: CSSStyleSheet | null = null;
  private customStylesCachedCSS: string | null = null;
  private customStylesAdoptedRoots = new WeakSet<StyleRoot>();

  supportsConstructableStyleSheets(
    root: StyleRoot
  ): root is StyleRoot & { adoptedStyleSheets: CSSStyleSheet[] } {
    const cachedSupport = this.constructableStyleSheetSupportMap.get(root);
    if (cachedSupport !== undefined) {
      return cachedSupport;
    }

    try {
      if (typeof CSSStyleSheet === 'undefined') {
        this.constructableStyleSheetSupportMap.set(root, false);
        return false;
      }

      if (!('adoptedStyleSheets' in root) || root.adoptedStyleSheets === undefined) {
        this.constructableStyleSheetSupportMap.set(root, false);
        return false;
      }

      // Firefox content scripts can expose adoptedStyleSheets while still
      // throwing when the returned object is iterated or assigned via Xray
      // wrappers. Probe a full read -> assign -> read cycle instead of trusting
      // property existence alone.
      // Related bugs:
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1928865
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1770592
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1817675
      const probeSheet = new CSSStyleSheet();
      const previousSheets = [...root.adoptedStyleSheets];

      try {
        root.adoptedStyleSheets = [...previousSheets, probeSheet];

        const assignedSheets = [...root.adoptedStyleSheets];
        const supportsAssignment = assignedSheets.includes(probeSheet);
        this.constructableStyleSheetSupportMap.set(root, supportsAssignment);

        return supportsAssignment;
      } finally {
        root.adoptedStyleSheets = previousSheets;
      }
    } catch (error) {
      // When the browser/runtime only partially exposes constructable
      // stylesheets, fall back to injecting a normal <style> element.
      logger.warn('constructable stylesheet assignment failed, falling back to <style>', { error });
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

  private getPresetCSS(root: StyleRoot): string {
    return root instanceof Document ? this.DOCUMENT_PRESET_CSS : this.SHADOW_PRESET_CSS;
  }

  private getPresetStyleSheet(root: StyleRoot): CSSStyleSheet {
    if (root instanceof Document) {
      if (!this.documentPresetStyleSheet) {
        this.documentPresetStyleSheet = new CSSStyleSheet();
        this.documentPresetStyleSheet.replaceSync(this.DOCUMENT_PRESET_CSS);
      }

      return this.documentPresetStyleSheet;
    }

    if (!this.shadowPresetStyleSheet) {
      this.shadowPresetStyleSheet = new CSSStyleSheet();
      this.shadowPresetStyleSheet.replaceSync(this.SHADOW_PRESET_CSS);
    }

    return this.shadowPresetStyleSheet;
  }

  /** Ensure preset styles are injected into the given root */
  ensurePresetStyles(root: StyleRoot): void {
    if (this.injectedPresetRoots.has(root)) return;

    // Mark as injected first to prevent race condition with concurrent calls
    this.injectedPresetRoots.add(root);

    if (this.supportsConstructableStyleSheets(root)) {
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, this.getPresetStyleSheet(root)];
    } else {
      this.injectStyleElement(root, PRESET_STYLES_INJECTOR_ID, this.getPresetCSS(root));
    }
  }

  // Inject custom styles into the given root
  async ensureCustomStyles(root: StyleRoot, customStyles: CustomDisplayStyle): Promise<void> {
    // Ensure preset styles are injected first (provides CSS variables)
    this.ensurePresetStyles(root);

    /** Convert CustomDisplayStyle to CSS rule text */
    function buildCustomStylesCSS(styles: CustomDisplayStyle): string {
      const props: string[] = [];

      if (styles.backgroundColor) {
        props.push(`  background-color: ${styles.backgroundColor} !important;`);
      }
      if (styles.color) {
        props.push(`  color: ${styles.color} !important;`);
      }
      if (styles.fontSize) {
        props.push(`  font-size: ${styles.fontSize} !important;`);
      }
      if (styles.fontWeight) {
        props.push(`  font-weight: ${styles.fontWeight} !important;`);
      }
      if (styles.fontFamily) {
        props.push(`  font-family: ${styles.fontFamily} !important;`);
      }
      if (styles.borderRadius) {
        props.push(`  border-radius: ${styles.borderRadius} !important;`);
      }
      if (styles.padding) {
        props.push(`  padding: ${styles.padding} !important;`);
      }

      return `[data-anylang-custom-translate-style="custom"] {\n${props.join('\n')}\n}`;
    }

    // Build CSS from structured style properties
    const cssText = buildCustomStylesCSS(customStyles);

    // Only rebuild the shared sheet when CSS actually changes
    if (this.customStylesCachedCSS !== cssText) {
      this.customStylesCachedCSS = cssText;
      if (this.supportsConstructableStyleSheets(root)) {
        if (!this.customStylesSheet) {
          this.customStylesSheet = new CSSStyleSheet();
        }
        await this.customStylesSheet.replace(cssText);
      }
    }

    // Adopt or inject — unified path
    if (this.supportsConstructableStyleSheets(root)) {
      if (!this.customStylesAdoptedRoots.has(root)) {
        this.customStylesAdoptedRoots.add(root);
        root.adoptedStyleSheets = [...root.adoptedStyleSheets, this.customStylesSheet!];
      }
    } else {
      this.injectStyleElement(root, CUSTOM_PRESET_STYLES_INJECTOR_ID, cssText);
    }
  }

  /** Inject custom CSS into the given root */
  async ensureCustomCSS(root: StyleRoot, cssText: string): Promise<void> {
    // Ensure preset styles are injected first (provides CSS variables)
    this.ensurePresetStyles(root);

    // Document-level cache optimization
    if (root instanceof Document && this.documentCachedCSS === cssText) {
      return;
    }

    if (this.supportsConstructableStyleSheets(root)) {
      let sheet = this.customCSSMap.get(root);
      if (!sheet) {
        sheet = new CSSStyleSheet();
        // Set in map first to prevent race condition with concurrent calls
        this.customCSSMap.set(root, sheet);
        root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
      }
      await sheet.replace(cssText);
    } else {
      this.injectStyleElement(root, CUSTOM_STYLES_INJECTOR_ID, cssText);
    }

    if (root instanceof Document) {
      this.documentCachedCSS = cssText;
    }
  }
}

export const styleInjector = new StyleInjector();

export function setTranslationDirAndLang(element: HTMLElement, targetLangCode: LangCode): void {
  const { dir, lang } = contentManager.getLangDirection(targetLangCode);
  element.setAttribute('dir', dir);
  if (lang) {
    element.setAttribute('lang', lang);
  }
}

export async function decorateTranslationNode(
  translatedNode: HTMLElement,
  displayStyle: DisplayStyle
): Promise<void> {
  logger.trace({ outerHTML: translatedNode.outerHTML, displayStyle });

  const { success, error } = displayStyleSchema.safeParse(displayStyle);
  if (!success) {
    logger.error({ error });
    return;
  }

  const { preset, customStyles, customCss } = displayStyle;

  translatedNode.dataset[TRANS_STYLE_KEY] = preset;
  const root = getContainingShadowRoot(translatedNode) ?? document;

  if (customStyles) {
    await styleInjector.ensureCustomStyles(root, customStyles);
    return;
  }

  if (customCss) {
    await styleInjector.ensureCustomCSS(root, customCss);
    return;
  }

  styleInjector.ensurePresetStyles(root);
}

/**
 * Create a lightweight spinner element without React/Shadow DOM overhead
 * Uses Web Animations API instead of CSS keyframes to avoid DOM injection
 * This is significantly faster than the React-based spinner for bulk operations
 */
function createLightweightSpinner(ownerDoc: Document): HTMLElement {
  const spinner = ownerDoc.createElement('span');
  spinner.className = SPINNER_CLASS;
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
    border-top: 1.5px solid var(--anylang-muted) !important;
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
  } else {
    // For reduced motion or when Web Animations API isn't available,
    // keep a static muted segment so the loading state stays visible
    // without requiring animation.
    spinner.style.borderTopColor = 'var(--anylang-muted)';
  }

  return spinner;
}

export function createSpinnerInside(translatedWrapperNode: HTMLElement): HTMLElement {
  const ownerDoc = getOwnerDocument(translatedWrapperNode);
  const root = getContainingShadowRoot(translatedWrapperNode) ?? ownerDoc;
  styleInjector.ensurePresetStyles(root);
  const spinner = createLightweightSpinner(ownerDoc);
  translatedWrapperNode.appendChild(spinner);
  return spinner;
}

export async function getTranslatedTextAndRemoveSpinner(
  nodes: ChildNode[],
  spinner: HTMLElement,
  translatedWrapperNode: HTMLElement,
  options: Required<Pick<TranslateOptions, 'text' | 'mode'>> &
    Omit<TranslateOptions, 'text' | 'mode'>
): Promise<string | undefined> {
  let translatedText: string | undefined;
  try {
    translatedText = await translateTextForPage(options);
  } catch (error) {
    logger.error({ error });
    const props: TranslateErrorProp = {
      nodes,
      error: error as APICallError,
      options
    };
    const container = createShadowHost({
      component: TranslateError,
      props,
      className: TRANSLATE_ERROR_CONTAINER_CLASS,
      position: 'inline',
      inheritStyles: false,
      cssContent: [appCss, textCss],
      style: {
        verticalAlign: 'middle'
      }
    });
    translatedWrapperNode.appendChild(container);
  } finally {
    spinner.remove();
  }
  return translatedText;
}

export function validateTranslationConfigAndToast(detectedCode: DetectedLangCode): boolean {
  const { sourceLangCode, targetLangCode } = configStore.get();

  if (
    sourceLangCode === targetLangCode ||
    (!sourceLangCode && detectedCode && detectedCode === targetLangCode)
  ) {
    toast.error(
      i18n('toast_translation_same_langauge', {
        defaultValue: 'Source and target languages are the same'
      })
    );
    logger.trace('skipped on same language found');
    return false;
  }

  return true;
}

// High-level orchestration function
export async function removeOrShowNodeTranslation(
  detectedCode: DetectedLangCode,
  point: Point,
  options: Required<Pick<TranslateOptions, 'mode'>> & Omit<TranslateOptions, 'mode'>
): Promise<void> {
  const node = domFinder.findNearestAncestorBlockNodeAt(point);

  if (!node || !domFilter.isHTMLElement(node)) return;

  if (!validateTranslationConfigAndToast(detectedCode)) return;

  const id = cryptoPolyfill.getUUID();
  domTraversal.walkAndLabelElement(node, id, options.pageRange);
  await translateWalkedElement(node, id, options, true);
}

async function getWebPagePromptContext(
  options: Pick<TranslateOptions, 'providerConfig' | 'pageRange'>,
  includeSummary: boolean
): Promise<AdaptiveTranslateContext | undefined> {
  const { providerConfig, pageRange } = options;
  // Only LLM (non-free) providers can use web page context
  if (isLLMProvider(providerConfig)) return undefined;

  const ctx = await webpage.context.get(pageRange);
  if (!ctx) {
    return undefined;
  }

  const webSummary = includeSummary
    ? await webpage.summary.get(ctx, providerConfig, isLLMProvider(providerConfig))
    : undefined;

  return {
    webTitle: ctx.webTitle,
    webContent: ctx.webContent,
    webSummary: webSummary ?? undefined
  };
}

const MIN_LANG_DETECT_LEN = 50;

async function isTextAlreadyInTargetLanguage(text: string, targetCode: LangCode): Promise<boolean> {
  if (text.length < MIN_LANG_DETECT_LEN) return false;
  const detected = await contentManager.detectLangCode(text, { enableLLM: false });
  return detected === targetCode;
}

async function translateTextUsingPageConfig(
  options: Required<Pick<TranslateOptions, 'text'>> &
    Omit<TranslateOptions, 'text'> & {
      extraHashTags?: string[];
      webPageContext?: AdaptiveTranslateContext;
    }
): Promise<string> {
  const { text, targetLangCode, extraHashTags, webPageContext } = options;
  const preparedText = text.trim();
  if (preparedText === '') return '';

  if (await isTextAlreadyInTargetLanguage(preparedText, targetLangCode)) {
    logger.info(
      `translateTextForPage: skipping translation because text is already in target language. text: ${preparedText}`
    );
    return '';
  }

  return translateTextCore({
    ...options,
    extraHashTags,
    webPageContext,
    text: preparedText
  });
}

/**
 * Page translation — uses the quickTranslate provider.
 * Includes skip-language logic (page translation only).
 */
export async function translateTextForPage(
  options: Required<Pick<TranslateOptions, 'text'>> & Omit<TranslateOptions, 'text'>
): Promise<string> {
  const webPageContext = await getWebPagePromptContext(options, true);

  return translateTextUsingPageConfig({
    ...options,
    webPageContext
  });
}

/**
 * Page title translation — uses page translation settings, but always treats the
 * current source title as the webpage title context.
 */
export async function translateTextForPageTitle(
  options: Required<Pick<TranslateOptions, 'text'>> & Omit<TranslateOptions, 'text'>
): Promise<string> {
  const { webContent, webSummary } = (await getWebPagePromptContext(options, true)) ?? {};

  const { text: webTitle } = options;
  return translateTextUsingPageConfig({
    ...options,
    extraHashTags: ['pageTitleTranslation'],
    webPageContext: {
      webTitle,
      webContent,
      webSummary
    }
  });
}

/**
 * Input translation — translates user-typed text using configured languages.
 */
export async function translateTextForInput(
  options: Required<Pick<TranslateOptions, 'text'>> & Omit<TranslateOptions, 'text'>
): Promise<string> {
  const { sourceLangCode, targetLangCode, providerConfig, pageRange } = options;
  if (sourceLangCode === targetLangCode) return '';

  const webPageContext = await getWebPagePromptContext({ pageRange, providerConfig }, true);

  return translateTextCore({
    ...options,
    extraHashTags: [`inputTranslation:${sourceLangCode}->${targetLangCode}`],
    webPageContext
  });
}

// Minimum text length for skip language detection (shorter than general detection
// to catch short phrases like "Bonjour!" or "こんにちは")
const MIN_LENGTH_FOR_SKIP_LLM_DETECTION = 10;

/**
 * Check if text should be skipped based on language detection.
 * Uses LLM detection if enabled, falls back to franc library.
 * @param text - Text to detect language for
 * @param skipLangCodes - List of languages to skip translation for
 * @param enableLLM - Whether to use LLM for language detection
 * @returns true if text language is in skipLanguages list (should skip translation)
 */
export async function shouldSkipByLanguage(
  text: string,
  skipLangCodes: LangCode[],
  enableLLM: boolean
): Promise<boolean> {
  const detectedLang = await contentManager.detectLangCode(text, {
    minLength: MIN_LENGTH_FOR_SKIP_LLM_DETECTION,
    enableLLM
  });

  if (!detectedLang) {
    return false;
  }

  return skipLangCodes.includes(detectedLang);
}
