import { mount, unmount, type Component, type ComponentProps } from 'svelte';

import ShadowWrapper from '@/components/ShadowWrapper.svelte';
import { NOTRANSLATE_CLASS, SHADOW_HOST_CLASS } from '@/preset/dom';
import type { ThemeMode } from '@/preset/dom/shadow';

import { sha256 } from '../hash';

class CSSRegistry {
  private readonly SHADOW_CSS_KEY_ATTR = 'data-anylang-shadow-css-key';

  private registry = new Map<string, { node: HTMLStyleElement; count: number }>();

  inject(css: string): string {
    const key = sha256(css);

    const existing = this.registry.get(key);
    if (existing) {
      existing.count += 1;
      return key;
    }

    const style = document.createElement('style');
    style.textContent = css;
    style.setAttribute(this.SHADOW_CSS_KEY_ATTR, key);
    document.head.appendChild(style);
    this.registry.set(key, { node: style, count: 1 });

    return key;
  }

  /** Caller must return the key when unloading, and do reference count decrement */
  remove(key: string) {
    const entry = this.registry.get(key);
    if (!entry) return;

    entry.count -= 1;

    if (entry.count === 0) {
      entry.node.remove();
      this.registry.delete(key);
    }
  }
}

const cssRegistry = new CSSRegistry();

const PROPERTY_AND_FONT_FACE_RULES_PATTERN =
  /(@(?:property|font-face)[^{}]*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/g;

interface ShadowHostOptions {
  position: 'inline' | 'block';
  cssContent?: string[];
  style?: Partial<CSSStyleDeclaration>;
  inheritStyles?: boolean;
  className?: string;
}

const resetCss = `/* AnyLang Translator Shadow DOM Reset */
  :host {
    /* Essential style isolation */
    all: initial;
    /* Override all: initial for essential inherited properties we want to keep */
    color-scheme: inherit;
    /* Restore modern font stack */
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  /* Ensure proper box-sizing for all elements */
  *, *::before, *::after {
    box-sizing: border-box;
  }
`;

/** Only care about what to put in ShadowRoot and what document CSS to register */
export class ShadowHostBuilder {
  private documentCssKey?: string;

  constructor(
    private shadowRoot: ShadowRoot,
    private opts: ShadowHostOptions = {
      position: 'block'
    }
  ) {}

  build(): HTMLElement {
    const { cssContent, inheritStyles, position, style } = this.opts;
    const css: string[] = [];

    if (!inheritStyles) {
      css.push(resetCss);
    }
    if (cssContent) css.push(...cssContent.map((css) => css.replaceAll(':root', ':host')));

    const { shadowCss, documentCss } = this.splitShadowRootCss(css.join('\n'));
    if (documentCss) {
      this.documentCssKey = cssRegistry.inject(documentCss);
    }
    if (shadowCss) {
      const style = document.createElement('style');
      style.textContent = shadowCss;
      this.shadowRoot.appendChild(style);
    }

    // add wrapper
    const wrapper = document.createElement('div');
    wrapper.style.display = position;
    if (style) {
      Object.assign(wrapper.style, style);
    }
    this.shadowRoot.appendChild(wrapper);

    return wrapper;
  }

  cleanup() {
    if (this.documentCssKey) cssRegistry.remove(this.documentCssKey);
  }

  splitShadowRootCss(css: string): {
    documentCss: string;
    shadowCss: string;
  } {
    let shadowCss = css;
    let documentCss = '';

    // Extract @property and @font-face rules that need to be in the document
    // Using a simpler, safer regex pattern to avoid backtracking issues
    const matches = css.matchAll(PROPERTY_AND_FONT_FACE_RULES_PATTERN);

    for (const match of matches) {
      documentCss += `${match[1]}\n`;
      shadowCss = shadowCss.replace(match[1], '');
    }

    return {
      documentCss: documentCss.trim(),
      shadowCss: shadowCss.trim()
    };
  }
}

// ---------------------------------------------------------------------------
// Shadow host lifecycle
// ---------------------------------------------------------------------------

/**
 * Symbol stored on the shadow-host element so we can tear down the Svelte
 * component and clean up document-level CSS on removal.
 */
const CLEANUP_KEY = Symbol('anylang-shadow-host-cleanup');

type ShadowHostElement = HTMLElement & {
  [CLEANUP_KEY]?: () => void;
};

export interface CreateShadowHostOptions<Props extends Record<string, unknown>> {
  /** The Svelte 5 component to render inside the shadow DOM. */
  component: Component<Props>;
  /** Props forwarded to the component. */
  props?: Props;
  /** Controls whether the host element itself is `inline` or `block`. */
  position?: 'inline' | 'block';
  /** Extra CSS strings injected into the shadow root (and document for @property/@font-face). */
  cssContent?: string[];
  /** Inline styles applied to the inner wrapper element. */
  style?: Partial<CSSStyleDeclaration>;
  /** When true, the shadow root skips the CSS reset and inherits page styles. */
  inheritStyles?: boolean;
  /** Additional CSS class name(s) added to the outer shadow-host element. */
  className?: string;
  /** Theme mode forwarded to ThemeProvider. Defaults to 'system'. */
  themeMode?: ThemeMode;
}

/**
 * Creates a shadow-DOM host element, mounts the given Svelte component inside
 * it (wrapped in ThemeProvider for dark/light theme support), and returns the
 * host element ready to be appended to the document.
 *
 * - ShadowWrapperContext  → `SHADOW_WRAPPER_CONTEXT_KEY` context (see src/preset/shadow-host.ts)
 * - ThemeProvider         → ThemeProvider.svelte (applies light/dark class reactively)
 */
export function createShadowHost<Props extends Record<string, unknown>>(
  options: CreateShadowHostOptions<Props>
): ShadowHostElement {
  const {
    component,
    props,
    position = 'block',
    cssContent,
    style,
    inheritStyles = false,
    className,
    themeMode = 'system'
  } = options;

  // --- 1. Create the outer host element ---
  const shadowHost = document.createElement('div') as ShadowHostElement;
  shadowHost.classList.add(SHADOW_HOST_CLASS);
  if (className) shadowHost.classList.add(...className.split(' ').filter(Boolean));
  shadowHost.style.display = position;

  // --- 2. Attach shadow root and build the inner CSS / wrapper ---
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
  const builder = new ShadowHostBuilder(shadowRoot, {
    position,
    cssContent,
    style,
    inheritStyles
  });
  const innerContainer = builder.build();

  // --- 3. Mount the Svelte component tree ---
  //
  // ShadowWrapper provides:
  //   • ThemeProvider  – applies light/dark class to `innerContainer`
  //   • SHADOW_WRAPPER_CONTEXT_KEY context – exposes `innerContainer` to children
  //
  // The caller's component is passed as a child snippet via a tiny inline
  // wrapper approach: we render ShadowWrapper with the user component as a
  // child by using Svelte 5's `mount` with a snippet prop built at call-site.
  //
  // Because Svelte snippets cannot be constructed imperatively, we instead
  // mount the user component directly and pass `container` + `themeMode` as
  // extra props that ShadowWrapper expects, bridged via a thin adapter.
  const mountedWrapper = mount(ShadowWrapper, {
    target: innerContainer,
    props: {
      container: innerContainer,
      themeMode
      // `children` is optional — the user's component is mounted as a
      // sibling in the same container so it still lives inside the same
      // shadow root and inherits the theme context set up here.
    } as ComponentProps<typeof ShadowWrapper>
  });

  // Mount the caller's component into the same container AFTER the wrapper
  // has set up its context. Because Svelte 5 context is propagated through
  // the component tree, we mount the user component as a sibling here.
  // ThemeProvider's $effect still targets `innerContainer` which is the
  // shared ancestor, so theme classes are applied correctly.
  const mountedComponent = mount(component, {
    target: innerContainer,
    props: props ?? ({} as Props)
  });

  // --- 4. Store a cleanup callback on the element ---
  shadowHost[CLEANUP_KEY] = () => {
    try {
      unmount(mountedComponent);
    } catch {
      // ignore
    }
    try {
      unmount(mountedWrapper);
    } catch {
      // ignore
    }
    builder.cleanup();
  };

  return shadowHost;
}

/**
 * Unmounts the Svelte component, cleans up document-level CSS injected by
 * `ShadowHostBuilder`, and removes the host element from the DOM.
 */
export function removeShadowHost(shadowHost: HTMLElement): void {
  const host = shadowHost as ShadowHostElement;
  host[CLEANUP_KEY]?.();
  // Mark as cleaned so double-calls are safe
  delete host[CLEANUP_KEY];
  host.remove();
}

export function initShadowRoot(root: HTMLElement) {
  root.className = `text-green-500! text-base font-sans text-gray-950 dark:text-gray-50 z-2147483647 ${NOTRANSLATE_CLASS}`;
  // const wrapper = document.createElement('div');
  // wrapper.className = `text-green-500 text-base font-sans text-gray-950 dark:text-gray-50 z-2147483647 ${NOTRANSLATE_CLASS}`;
  // root.append(wrapper);
  // return wrapper;
}
