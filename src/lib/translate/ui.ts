import customTranslationNodeCss from '@/assets/custom-translation-node.css?raw';
import hostThemeCss from '@/assets/host-theme.css?raw';
import translationNodePresetCss from '@/assets/translation-node-preset.css?raw';
import contentManager from '@/lib/content';
import logger from '@/lib/logger';
import {
  CUSTOM_STYLES_INJECTOR_ID,
  PRESET_STYLES_INJECTOR_ID,
  SPINNER_CLASS,
  TRANS_STYLE_KEY
} from '@/preset/dom';
import { LangCode } from '@/types/lang';
import type { DisplayStyle } from '@/types/translate';
import { displayStyleSchema } from '@/types/translate';

import { getContainingShadowRoot, getOwnerDocument } from '../dom';

type StyleRoot = Document | ShadowRoot;

class StyleInjector {
  private readonly BASE_PRESET_CSS =
    customTranslationNodeCss.replace(/@import[^;]+;/g, '') + translationNodePresetCss;
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
      logger.warn(
        '[style-injector] constructable stylesheet assignment failed, falling back to <style>',
        { error }
      );
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
  if (displayStyleSchema.safeParse(displayStyle.value).error) return;

  const root = getContainingShadowRoot(translatedNode) ?? document;

  if (displayStyle.customCSS) {
    translatedNode.dataset[TRANS_STYLE_KEY] = 'custom';
    await styleInjector.ensureCustomCSS(root, displayStyle.customCSS);
    return;
  }

  translatedNode.dataset[TRANS_STYLE_KEY] = displayStyle.value;
  styleInjector.ensurePresetStyles(root);
}

/**
 * Create a lightweight spinner element without React/Shadow DOM overhead
 * Uses Web Animations API instead of CSS keyframes to avoid DOM injection
 * This is significantly faster than the React-based spinner for bulk operations
 */
export function createLightweightSpinner(ownerDoc: Document): HTMLElement {
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
    border-top: 1.5px solid var(--anylang-muted-foreground) !important;
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
    spinner.style.borderTopColor = 'var(--anylang-muted-foreground)';
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
