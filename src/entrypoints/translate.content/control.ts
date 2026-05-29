import configStore from '@/lib/config';
import cryptoPolyfill from '@/lib/crypto-polyfill';
import domFilter from '@/lib/dom/filter';
import domFinder from '@/lib/dom/finder';
import domTraversal from '@/lib/dom/traversal';
import logger from '@/lib/logger';
import { sendMessage } from '@/lib/protocol';
import { translateWalkedElement } from '@/lib/translate/core';
import { removeAllTranslatedWrapperNodes } from '@/lib/translate/dom';
import {
  removeOrShowNodeTranslation,
  translateTextForPageTitle,
  validateTranslationConfigAndToast
} from '@/lib/translate/ui';
import * as webpage from '@/lib/translate/webpage';
import { CONTENT_WRAPPER_CLASS, PARAGRAPH_ATTRIBUTE, WALKED_ATTRIBUTE } from '@/preset/dom';
import { TRIGGER_HOTKEY_MAP } from '@/preset/translate';
import type { Config } from '@/types/config';
import type { Point } from '@/types/dom';
import type { DetectedLangCode } from '@/types/lang';
import { isLLMProvider } from '@/types/provider';

class NodeTranslation {
  private readonly CLICK_AND_HOLD_TRIGGER_MS = 1000;
  private readonly CLICK_AND_HOLD_MOVE_TOLERANCE = 6;
  private readonly MOUSEMOVE_THROTTLE_MS = 300;
  private readonly MOUSEMOVE_DISTANCE_THRESHOLD = 3;

  private ac: AbortController | null = null;

  // Shared mouse position, updated on throttled mousemove
  private mousePosition: Point = { x: 0, y: 0 };

  // --- Mousemove throttle ---
  private lastMoveX = 0;
  private lastMoveY = 0;
  private moveThrottleTimer: ReturnType<typeof setTimeout> | null = null;

  // --- Click-and-hold ---
  private isMousePressed = false;
  private mousePressPosition: Point | null = null;
  private clickAndHoldTimerId: ReturnType<typeof setTimeout> | null = null;

  // --- Hotkey-hold ---
  private isHotkeyPressed = false;
  private isHotkeySessionPure = true;
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private actionTriggered = false;
  private activeHotkeyEventKey: string | null = null;

  /**
   * Registers node translation triggers based on the current config.
   * Returns a teardown function to remove all listeners.
   *
   * Config is read on demand when the interaction fires so long-lived content
   * scripts don't drift if the page was frozen and missed storage events.
   */
  register(): () => void {
    this.ac = new AbortController();
    const opts = { signal: this.ac.signal } as const;

    // Mousemove handler with throttle + distance threshold
    document.addEventListener('mousemove', this.onMouseMove, opts);
    document.addEventListener('keydown', this.onKeyDown, opts);
    document.addEventListener('keyup', this.onKeyUp, opts);

    // Teardown: abort all listeners + cancel pending timers
    return () => this.destroy();
  }

  private destroy(): void {
    this.ac?.abort();
    this.ac = null;
    this.resetHotkeySession();
    if (this.moveThrottleTimer) {
      clearTimeout(this.moveThrottleTimer);
      this.moveThrottleTimer = null;
    }
    this.clearClickAndHoldTimer();
  }

  // ── helpers ───────────────────────────────────────────────────────────────

  private getCurrentConfig(): Config | null {
    if (this.ac?.signal.aborted) return null;
    return configStore.get();
  }

  private trigger(pos: Point, config: Config): void {
    void removeOrShowNodeTranslation(undefined, pos, {
      providerConfig: config.adaptiveTranslate.provider,
      sourceLangCode: config.sourceLangCode ?? 'auto',
      targetLangCode: config.targetLangCode,
      ...config.adaptiveTranslate.translate
    });
  }

  private clearClickAndHoldTimer(): void {
    if (this.clickAndHoldTimerId) {
      clearTimeout(this.clickAndHoldTimerId);
      this.clickAndHoldTimerId = null;
    }
  }

  private resetHotkeySession(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.isHotkeyPressed = false;
    this.isHotkeySessionPure = true;
    this.actionTriggered = false;
    this.activeHotkeyEventKey = null;
  }

  private getHotkey(config: Config): string {
    return TRIGGER_HOTKEY_MAP[
      config.adaptiveTranslate.translate.triggerOnHover.hotkey as keyof typeof TRIGGER_HOTKEY_MAP
    ].key;
  }

  // ── event handlers (arrow functions keep `this` bound) ────────────────────

  private onMouseMove = (e: MouseEvent): void => {
    // logger.debug('onMouseMove', { e });
    // Distance threshold: ignore tiny movements (trackpad tremor, mouse jitter)
    if (
      Math.abs(e.clientX - this.lastMoveX) + Math.abs(e.clientY - this.lastMoveY) <=
      this.MOUSEMOVE_DISTANCE_THRESHOLD
    ) {
      return;
    }

    // Click-and-hold move cancellation (always immediate, no throttle)
    if (this.isMousePressed && this.mousePressPosition) {
      if (
        Math.hypot(e.clientX - this.mousePressPosition.x, e.clientY - this.mousePressPosition.y) >
        this.CLICK_AND_HOLD_MOVE_TOLERANCE
      ) {
        this.isMousePressed = false;
        this.mousePressPosition = null;
        this.clearClickAndHoldTimer();
      }
    }

    // Throttled position update
    if (this.moveThrottleTimer) return;
    this.moveThrottleTimer = setTimeout(() => {
      this.moveThrottleTimer = null;
    }, this.MOUSEMOVE_THROTTLE_MS);

    this.mousePosition.x = e.clientX;
    this.mousePosition.y = e.clientY;
    this.lastMoveX = e.clientX;
    this.lastMoveY = e.clientY;
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.target instanceof HTMLElement && domFilter.isEditable(e.target)) return;

    const config = this.getCurrentConfig();
    if (!config || !config.adaptiveTranslate.translate.triggerOnHover.enabled) {
      this.resetHotkeySession();
      return;
    }

    const hotkey = this.getHotkey(config);

    if (e.key === hotkey) {
      if (this.isHotkeyPressed) return; // already tracking this key

      this.isHotkeyPressed = true;
      this.activeHotkeyEventKey = hotkey;
      this.timerId = setTimeout(() => {
        if (!this.isHotkeySessionPure || !this.isHotkeyPressed) {
          this.timerId = null;
          return;
        }

        const current = this.getCurrentConfig();
        if (!current || !current.adaptiveTranslate.translate.triggerOnHover.enabled) {
          this.timerId = null;
          return;
        }
        if (this.getHotkey(current) !== this.activeHotkeyEventKey) {
          this.timerId = null;
          return;
        }

        this.trigger(this.mousePosition, current);
        this.actionTriggered = true;
        this.timerId = null;
      }, this.CLICK_AND_HOLD_TRIGGER_MS);

      // Session already impure (another key was pressed first) — cancel immediately
      if (!this.isHotkeySessionPure && this.timerId) {
        clearTimeout(this.timerId);
        this.timerId = null;
      }
    } else {
      this.isHotkeySessionPure = false;
      if (this.isHotkeyPressed && this.timerId) {
        clearTimeout(this.timerId);
        this.timerId = null;
      }
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    if (e.target instanceof HTMLElement && domFilter.isEditable(e.target)) return;

    const config = this.getCurrentConfig();
    if (!config || !config.adaptiveTranslate.translate.triggerOnHover.enabled) {
      if (e.key === this.activeHotkeyEventKey) this.resetHotkeySession();
      return;
    }

    const hotkey = this.getHotkey(config);

    if (e.key === hotkey || e.key === this.activeHotkeyEventKey) {
      if (this.isHotkeyPressed && this.isHotkeySessionPure) {
        if (this.timerId) {
          clearTimeout(this.timerId);
          this.timerId = null;
        }
        if (!this.actionTriggered) {
          const current = this.getCurrentConfig();
          if (!current || !current.adaptiveTranslate.translate.triggerOnHover.enabled) return;
          this.trigger(this.mousePosition, current);
        }
      }
      this.resetHotkeySession();
    }
  };
}

export const nodeTranslation = new NodeTranslation();

type SimpleIntersectionOptions = Omit<IntersectionObserverInit, 'threshold'> & {
  threshold?: number;
};

export class PageTranslateManager {
  private readonly MAX_DURATION = 500;
  private readonly MOVE_THRESHOLD = 30 * 30;
  // Pre-translate Range
  // Control how much content below the viewport gets pre-translated to save API costs
  private readonly DEFAULT_INTERSECTION_OPTIONS: SimpleIntersectionOptions = {
    root: null,
    rootMargin: '600px',
    threshold: 0.1
  };

  private isPageTranslating: boolean = false;
  private intersectionObserver: IntersectionObserver | null = null;
  private mutationObservers: MutationObserver[] = [];
  private walkId: string | null = null;
  private intersectionOptions: IntersectionObserverInit;
  private dontWalkIntoElementsCache = new WeakSet<HTMLElement>();
  private titleObserver: MutationObserver | null = null;
  private lastSourceTitle: string | null = null;
  private lastAppliedTranslatedTitle: string | null = null;
  private titleRequestVersion = 0;

  private _detectedLangCode: DetectedLangCode = null;

  constructor(intersectionOptions: SimpleIntersectionOptions = {}) {
    if (intersectionOptions.threshold !== undefined) {
      if (intersectionOptions.threshold < 0 || intersectionOptions.threshold > 1) {
        throw new Error('IntersectionObserver threshold must be between 0 and 1');
      }
    }

    this.intersectionOptions = {
      ...this.DEFAULT_INTERSECTION_OPTIONS,
      ...intersectionOptions
    };
  }

  set detectedLangCode(code: DetectedLangCode) {
    this._detectedLangCode = code;
  }

  get detectedLangCode(): DetectedLangCode {
    return this._detectedLangCode;
  }

  /**
   * Indicates whether the page translation is currently active
   */
  get isTranslating(): boolean {
    return this.isPageTranslating;
  }

  /**
   * Starts the automatic page translation functionality
   * Registers observers, touch triggers and set storage
   */
  async start(): Promise<void> {
    if (this.isPageTranslating) {
      logger.warn('PageTranslateManager is already active');
      return;
    }
    logger.info('Starting PageTranslateManager');

    const detectedLangCode = this.detectedLangCode;
    if (!validateTranslationConfigAndToast(detectedLangCode)) return;

    try {
      logger.debug('reportAdaptiveTranslateState', { enabled: true });
      await sendMessage('reportAdaptiveTranslateState', {
        enabled: true
      });

      this.isPageTranslating = true;
      await this.primeDocumentTitleContext();
      this.startDocumentTitleTracking();

      // Listen to existing elements when they enter the viewpoint
      const walkId = cryptoPolyfill.getUUID();
      this.walkId = walkId;
      this.intersectionObserver = new IntersectionObserver(async (entries, observer) => {
        logger.trace('IntersectionObserver callback triggered', { entries });
        for (const entry of entries) {
          const { target, isIntersecting } = entry;
          if (!isIntersecting) continue;
          if (domFilter.isHTMLElement(target)) {
            logger.debug({ target });
            if (!target.closest(`.${CONTENT_WRAPPER_CLASS}`)) {
              const {
                sourceLangCode = 'auto',
                targetLangCode,
                adaptiveTranslate: { provider: providerConfig, translate }
              } = configStore.get();
              void translateWalkedElement(target, walkId, {
                providerConfig,
                sourceLangCode,
                targetLangCode,
                ...translate
              });
            }
          }
          observer.unobserve(target);
        }
      }, this.intersectionOptions);

      // Initialize walkability state for existing elements
      this.addDontWalkIntoElements(document.body);
      await this.observerTopLevelParagraphs(document.body);

      // Start observing mutations from document.body and all shadow roots
      this.observeMutations(document.body);
    } catch (error) {
      logger.error('Failed to start page translation:', { error });
      throw error;
    }
    logger.info('Started PageTranslateManager');
  }

  /**
   * Stops the automatic page translation functionality
   * Cleans up all observers and removes translated content and set storage
   */
  stop(): void {
    if (!this.isPageTranslating) {
      logger.warn('PageTranslationManager is already inactive');
      return;
    }
    logger.info('Stopping PageTranslateManager');

    logger.debug('reportAdaptiveTranslateState', { enabled: false });
    void sendMessage('reportAdaptiveTranslateState', {
      enabled: false
    });

    this.isPageTranslating = false;
    this.walkId = null;
    this.dontWalkIntoElementsCache = new WeakSet();
    this.stopDocumentTitleTracking();

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    this.mutationObservers.forEach((observer) => observer.disconnect());
    this.mutationObservers = [];

    void removeAllTranslatedWrapperNodes();
    logger.info('Stopped PageTranslateManager');
  }

  /**
   * Registers page translation triggers
   */
  registerTriggers(): () => void {
    let startTime = 0;
    let startTouches: TouchList | null = null;

    const reset = () => {
      startTime = 0;
      startTouches = null;
    };

    const onStart = (e: TouchEvent) => {
      logger.debug('onStart', { e });
      if (e.touches.length === 4) {
        startTime = performance.now();
        startTouches = e.touches;
      } else {
        reset();
      }
    };

    const onMove = (e: TouchEvent) => {
      logger.debug('onMove', { e });
      if (!startTouches) return;
      if (e.touches.length !== 4) return reset();

      for (let i = 0; i < 4; i++) {
        const dx = e.touches[i].clientX - startTouches[i].clientX;
        const dy = e.touches[i].clientY - startTouches[i].clientY;
        if (dx * dx + dy * dy > this.MOVE_THRESHOLD) return reset();
      }
    };

    const onEnd = (e: TouchEvent) => {
      logger.debug('onEnd', { e });
      if (!startTouches) return;
      if (performance.now() - startTime < this.MAX_DURATION) {
        if (this.isPageTranslating) {
          this.stop();
        } else {
          void this.start();
        }
      }
      reset();
    };

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onEnd, { passive: true });
    document.addEventListener('touchcancel', reset, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', reset);
    };
  }

  private shouldManageDocumentTitle(): boolean {
    return window === window.top;
  }

  private async primeDocumentTitleContext(): Promise<void> {
    if (!this.shouldManageDocumentTitle()) return;

    const {
      adaptiveTranslate: {
        provider,
        translate: { pageRange }
      }
    } = configStore.get();

    if (!isLLMProvider(provider)) return;

    try {
      await webpage.context.get(pageRange);
    } catch (error) {
      logger.warn('Failed to prime webpage context before translating document title', { error });
    }
  }

  private startDocumentTitleTracking(): void {
    if (!this.shouldManageDocumentTitle()) return;

    this.lastSourceTitle = document.title || '';
    this.lastAppliedTranslatedTitle = null;
    this.titleRequestVersion = 0;

    this.observeDocumentTitle();
    void this.syncDocumentTitle(this.lastSourceTitle);
  }

  private stopDocumentTitleTracking(): void {
    if (!this.shouldManageDocumentTitle()) return;

    const currentTitle = document.title || '';
    if (currentTitle !== this.lastAppliedTranslatedTitle) {
      this.lastSourceTitle = currentTitle;
    }

    if (this.titleObserver) {
      this.titleObserver.disconnect();
      this.titleObserver = null;
    }

    this.titleRequestVersion++;

    if (this.lastSourceTitle !== null && document.title !== this.lastSourceTitle) {
      document.title = this.lastSourceTitle;
    }

    this.lastSourceTitle = null;
    this.lastAppliedTranslatedTitle = null;
  }

  private observeDocumentTitle(): void {
    if (!document.head) return;

    if (this.titleObserver) {
      this.titleObserver.disconnect();
    }

    this.titleObserver = new MutationObserver(() => {
      this.handleDocumentTitleMutation();
    });

    this.titleObserver.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  private handleDocumentTitleMutation(): void {
    if (!this.isPageTranslating || !this.shouldManageDocumentTitle()) return;

    const currentTitle = document.title || '';

    if (currentTitle === this.lastSourceTitle) return;

    if (currentTitle === this.lastAppliedTranslatedTitle) return;

    this.lastSourceTitle = currentTitle;
    void this.syncDocumentTitle(currentTitle);
  }

  private async syncDocumentTitle(text: string): Promise<void> {
    if (!text.trim() || !this.isPageTranslating || !this.shouldManageDocumentTitle()) return;

    const requestVersion = ++this.titleRequestVersion;
    if (!this.isPageTranslating || requestVersion !== this.titleRequestVersion) return;

    try {
      logger.info('Would translate title:', { text });

      const {
        sourceLangCode = 'auto',
        targetLangCode,
        adaptiveTranslate: { provider: providerConfig, translate }
      } = configStore.get();

      const translatedTitle = await translateTextForPageTitle({
        providerConfig,
        sourceLangCode,
        targetLangCode,
        ...translate,
        text
      });

      const nextTitle = translatedTitle || text;
      this.lastAppliedTranslatedTitle = nextTitle;

      if (document.title === nextTitle) return;

      document.title = nextTitle;
    } catch (error) {
      if (requestVersion === this.titleRequestVersion) {
        logger.warn('Failed to translate document title:', { error });
      }
    }
  }

  private async observerTopLevelParagraphs(container: HTMLElement): Promise<void> {
    const observer = this.intersectionObserver;
    if (!this.walkId || !observer) return;

    const {
      adaptiveTranslate: {
        translate: { pageRange }
      }
    } = configStore.get();

    // Skip if container has an ancestor that should not be walked into
    if (domFilter.hasNoWalkAncestor(container, pageRange)) return;

    domTraversal.walkAndLabelElement(container, this.walkId, pageRange);

    // if container itself has paragraph and the id
    const containerWalked = container.getAttribute(WALKED_ATTRIBUTE);
    if (container.hasAttribute(PARAGRAPH_ATTRIBUTE) && containerWalked === this.walkId) {
      observer.observe(container);
      return;
    }

    const paragraphs = this.collectParagraphsDeep(container, this.walkId);
    const topLevelParagraphs = paragraphs.filter((el) => {
      const ancestor = el.parentElement?.closest(`[${PARAGRAPH_ATTRIBUTE}]`);
      // keep it if either:
      //  • no paragraph ancestor at all, or
      //  • the ancestor is *not* inside container
      return !ancestor || !container.contains(ancestor);
    });
    topLevelParagraphs.forEach((el) => observer.observe(el));
  }

  /**
   * Recursively collect elements with paragraph attributes from shadow roots and iframes
   */
  private collectParagraphsDeep(container: HTMLElement, walkId: string): HTMLElement[] {
    const result: HTMLElement[] = [];

    const collectFromContainer = (root: HTMLElement | Document | ShadowRoot) => {
      const elements = Array.from(
        root.querySelectorAll<HTMLElement>(
          `[${PARAGRAPH_ATTRIBUTE}][${WALKED_ATTRIBUTE}="${CSS.escape(walkId)}"]`
        )
      );
      result.push(...elements);
    };

    const traverseElement = (element: HTMLElement) => {
      if (element.shadowRoot) {
        collectFromContainer(element.shadowRoot);
        for (const child of Array.from(element.shadowRoot.children)) {
          if (child instanceof HTMLElement) {
            traverseElement(child);
          }
        }
      }

      for (const child of Array.from(element.children)) {
        if (child instanceof HTMLElement) {
          traverseElement(child);
        }
      }
    };

    collectFromContainer(container);
    traverseElement(container);

    return result;
  }

  /**
   * Handle style/class attribute changes and only trigger observation
   * when element transitions from "don't walk into" to "walkable"
   */
  private didChangeToWalkable(element: HTMLElement): boolean {
    const wasDontWalkInto = this.dontWalkIntoElementsCache.has(element);
    const isDontWalkIntoNow = domFilter.isDontWalkIntoButTranslateAsChildElement(element);

    // Update cache with current state
    if (isDontWalkIntoNow) {
      this.dontWalkIntoElementsCache.add(element);
    } else {
      this.dontWalkIntoElementsCache.delete(element);
    }

    // Only trigger observation if element transitioned from "don't walk into" to "walkable"
    // wasDontWalkInto === true means it was previously not walkable
    // isDontWalkIntoNow === false means it's now walkable
    return wasDontWalkInto === true && isDontWalkIntoNow === false;
  }

  /**
   * Initialize walkability state for an element and its descendants
   */
  private addDontWalkIntoElements(element: HTMLElement): void {
    const dontWalkIntoElements = domFinder.deepQueryTopLevelSelector(
      element,
      domFilter.isDontWalkIntoButTranslateAsChildElement.bind(domFilter)
    );
    dontWalkIntoElements.forEach((el) => this.dontWalkIntoElementsCache.add(el));
  }

  /**
   * Start observing mutations for a container and all its shadow roots
   */
  private observeMutations(container: HTMLElement): void {
    const mutationObserver = new MutationObserver((records) => {
      for (const rec of records) {
        if (rec.type === 'childList') {
          rec.addedNodes.forEach((node) => {
            if (domFilter.isHTMLElement(node)) {
              this.addDontWalkIntoElements(node);
              void this.observerTopLevelParagraphs(node);
              this.observeIsolatedDescendantsMutations(node);
            }
          });
        } else if (
          rec.type === 'attributes' &&
          (rec.attributeName === 'style' || rec.attributeName === 'class')
        ) {
          const el = rec.target;
          if (domFilter.isHTMLElement(el) && this.didChangeToWalkable(el)) {
            void this.observerTopLevelParagraphs(el);
          }
        }
      }
    });

    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    this.mutationObservers.push(mutationObserver);
    this.observeIsolatedDescendantsMutations(container);
  }

  /**
   * Recursively find and observe shadow roots and iframes in an element and its descendants
   * These can't be find as top level paragraph elements because isolated shadow roots and iframes are not
   * considered as part of the document.
   */
  private observeIsolatedDescendantsMutations(element: HTMLElement): void {
    // Check if this element has a shadow root
    if (element.shadowRoot) {
      for (const child of Array.from(element.shadowRoot.children)) {
        if (domFilter.isHTMLElement(child)) {
          this.observeMutations(child);
        }
      }
    }

    // Recursively check children
    for (const child of Array.from(element.children)) {
      if (domFilter.isHTMLElement(child)) {
        this.observeIsolatedDescendantsMutations(child);
      }
    }
  }
}

/**
 * Handles config changes and re-translates page when translation mode changes
 * while page translation is active.
 */
export function handleTranslationModeChange(
  newConfig: Config | null,
  oldConfig: Config | null,
  manager: PageTranslateManager
): void {
  const modeChanged =
    newConfig &&
    oldConfig &&
    newConfig.adaptiveTranslate.translate.mode !== oldConfig.adaptiveTranslate.translate.mode;

  if (modeChanged && manager.isTranslating) {
    manager.stop();
    void manager.start();
  }
}
