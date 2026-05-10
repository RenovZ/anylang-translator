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

export default new StyleInjector();
