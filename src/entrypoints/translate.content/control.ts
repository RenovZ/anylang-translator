import analyticsManager from '@/lib/analytics';
import configStore from '@/lib/config';
import cryptoPolyfill from '@/lib/crypto-polyfill';
import domFilter from '@/lib/dom/filter';
import domFinder from '@/lib/dom/finder';
import domTraversal from '@/lib/dom/traversal';
import logger from '@/lib/logger';
import { sendMessage } from '@/lib/protocol';
import { removeOrShowNodeTranslation, validateTranslationConfigAndToast } from '@/lib/translate';
import { translateWalkedElement } from '@/lib/translate/core';
import { removeAllTranslatedWrapperNodes } from '@/lib/translate/dom';
import * as webpage from '@/lib/translate/webpage';
import { CONTENT_WRAPPER_CLASS } from '@/preset/dom';
import { HOTKEY_EVENT_KEYS } from '@/preset/translate';
import { FeatureUsageContext } from '@/types/analytics';
import type { Config } from '@/types/config';
import type { Point } from '@/types/dom';

const HOLD_DELAY_MS = 1000;
const HOLD_MOVE_TOLERANCE = 6;
const MOVE_THROTTLE_MS = 300;
const MOVE_MIN_DIST = 3;

class NodeTranslation {
  private ac: AbortController | null = null;

  // Shared mouse position, updated on throttled mousemove
  private pos: Point = { x: 0, y: 0 };

  // --- Mousemove throttle ---
  private lastX = 0;
  private lastY = 0;
  private moveTimer: ReturnType<typeof setTimeout> | null = null;

  // --- Click-and-hold ---
  private pressed = false;
  private holdFired = false;
  private pressPos: Point | null = null;
  private holdTimer: ReturnType<typeof setTimeout> | null = null;

  // --- Hotkey-hold ---
  private keyDown = false;
  private pureSession = true;
  private keyTimer: ReturnType<typeof setTimeout> | null = null;
  private keyTriggered = false;
  private activeKey: string | null = null;

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

    document.addEventListener('mousemove', this.onMouseMove, opts);
    document.addEventListener('mousedown', this.onMouseDown, opts);
    document.addEventListener('mouseup', this.onMouseUp, opts);
    document.addEventListener('keydown', this.onKeyDown, opts);
    document.addEventListener('keyup', this.onKeyUp, opts);

    // Teardown: abort all listeners + cancel pending timers
    return () => this.destroy();
  }

  private destroy(): void {
    this.ac?.abort();
    this.ac = null;
    this.resetKey();
    if (this.moveTimer) {
      clearTimeout(this.moveTimer);
      this.moveTimer = null;
    }
    this.clearHoldTimer();
  }

  // ── helpers ───────────────────────────────────────────────────────────────

  private cfg(): Config | null {
    if (this.ac?.signal.aborted) return null;
    return configStore.get();
  }

  private inTriggerMode(config: Config): boolean {
    return (
      !!config.adaptiveTranslate.provider &&
      config.adaptiveTranslate.translate.triggerOnHover === 'clickAndHold'
    );
  }

  private trigger(pos: Point): void {
    const config = this.cfg();
    if (!config) return;
    const {
      targetLangCode,
      adaptiveTranslate: {
        translate: { mode: translateMode, pageRange, displayStyle }
      }
    } = config;
    void removeOrShowNodeTranslation(pos, translateMode, pageRange, targetLangCode, displayStyle);
  }

  private clearHoldTimer(): void {
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
  }

  private resetKey(): void {
    if (this.keyTimer) {
      clearTimeout(this.keyTimer);
      this.keyTimer = null;
    }
    this.keyDown = false;
    this.pureSession = true;
    this.keyTriggered = false;
    this.activeKey = null;
  }

  // ── event handlers (arrow functions keep `this` bound) ────────────────────

  private onMouseMove = (e: MouseEvent): void => {
    // Distance threshold: ignore tiny movements (trackpad tremor, mouse jitter)
    if (Math.abs(e.clientX - this.lastX) + Math.abs(e.clientY - this.lastY) <= MOVE_MIN_DIST) {
      return;
    }

    // Click-and-hold move cancellation (always immediate, no throttle)
    if (this.pressed && this.pressPos) {
      if (
        Math.hypot(e.clientX - this.pressPos.x, e.clientY - this.pressPos.y) > HOLD_MOVE_TOLERANCE
      ) {
        this.pressed = false;
        this.pressPos = null;
        this.clearHoldTimer();
      }
    }

    // Throttled position update
    if (this.moveTimer) return;
    this.moveTimer = setTimeout(() => {
      this.moveTimer = null;
    }, MOVE_THROTTLE_MS);

    this.pos.x = e.clientX;
    this.pos.y = e.clientY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  };

  private onMouseDown = (e: MouseEvent): void => {
    if (e.button !== 0) return;
    if (e.target instanceof HTMLElement && domFilter.isEditable(e.target)) return;

    const config = this.cfg();
    if (!config || !this.inTriggerMode(config)) return;

    this.pressed = true;
    this.holdFired = false;
    this.pressPos = { x: e.clientX, y: e.clientY };

    this.clearHoldTimer();
    this.holdTimer = setTimeout(() => {
      if (!this.pressed || !this.pressPos || this.holdFired) return;

      const current = this.cfg();
      if (!current || !this.inTriggerMode(current)) return;

      this.trigger(this.pressPos);
      this.holdFired = true;
    }, HOLD_DELAY_MS);
  };

  private onMouseUp = (e: MouseEvent): void => {
    if (e.button !== 0) return;
    if (!this.pressed && !this.holdTimer) return;

    this.pressed = false;
    this.holdFired = false;
    this.pressPos = null;
    this.clearHoldTimer();
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.target instanceof HTMLElement && domFilter.isEditable(e.target)) return;

    const config = this.cfg();
    if (!config || !this.inTriggerMode(config)) {
      this.resetKey();
      return;
    }

    const hotkey = HOTKEY_EVENT_KEYS[config.adaptiveTranslate.translate.triggerOnHover];

    if (e.key === hotkey) {
      if (this.keyDown) return; // already tracking this key

      this.keyDown = true;
      this.activeKey = hotkey;
      this.keyTimer = setTimeout(() => {
        if (!this.pureSession || !this.keyDown) {
          this.keyTimer = null;
          return;
        }

        const current = this.cfg();
        if (!current || !this.inTriggerMode(current)) {
          this.keyTimer = null;
          return;
        }
        if (
          HOTKEY_EVENT_KEYS[current.adaptiveTranslate.translate.triggerOnHover] !== this.activeKey
        ) {
          this.keyTimer = null;
          return;
        }

        this.trigger(this.pos);
        this.keyTriggered = true;
        this.keyTimer = null;
      }, HOLD_DELAY_MS);

      // Session already impure (another key was pressed first) — cancel immediately
      if (!this.pureSession && this.keyTimer) {
        clearTimeout(this.keyTimer);
        this.keyTimer = null;
      }
    } else {
      this.pureSession = false;
      if (this.keyDown && this.keyTimer) {
        clearTimeout(this.keyTimer);
        this.keyTimer = null;
      }
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    if (e.target instanceof HTMLElement && domFilter.isEditable(e.target)) return;

    const config = this.cfg();
    if (!config || !this.inTriggerMode(config)) {
      if (e.key === this.activeKey) this.resetKey();
      return;
    }

    const hotkey = HOTKEY_EVENT_KEYS[config.adaptiveTranslate.translate.triggerOnHover];

    if (e.key === hotkey || e.key === this.activeKey) {
      if (this.keyDown && this.pureSession) {
        if (this.keyTimer) {
          clearTimeout(this.keyTimer);
          this.keyTimer = null;
        }
        if (!this.keyTriggered) {
          const current = this.cfg();
          if (!current || !this.inTriggerMode(current)) return;
          this.trigger(this.pos);
        }
      }
      this.resetKey();
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
  private readonly DEFAULT_INTERSECTION_OPTIONS: SimpleIntersectionOptions = {
    root: null,
    rootMargin: '600px',
    threshold: 0.1
  };

  private active: boolean = false;
  private intersectionObserver: IntersectionObserver | null = null;
  private mutationObservers: MutationObserver[] = [];
  private walkId: string | null = null;
  private intersectionOptions: IntersectionObserverInit;
  private dontWalkCache = new WeakSet<HTMLElement>();
  private titleObserver: MutationObserver | null = null;
  private lastSourceTitle: string | null = null;
  private lastAppliedTranslatedTitle: string | null = null;
  private titleRequestVersion = 0;

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

  /**
   * Indicates whether the page translation is currently active
   */
  get isTranslating(): boolean {
    return this.active;
  }

  /**
   * Starts the automatic page translation functionality
   * Registers observers, touch triggers and set storage
   */
  async start(analyticsContext?: FeatureUsageContext): Promise<void> {
    if (this.active) {
      logger.warn('PageTranslateManager is already active');
      return;
    }
    logger.info('Starting PageTranslateManager');

    const trackedContext = window === window.top ? analyticsContext : undefined;

    if (!validateTranslationConfigAndToast()) {
      if (trackedContext) {
        void analyticsManager.trackFeatureUsed({
          ...trackedContext,
          outcome: 'failure'
        });
      }
      return;
    }

    try {
      logger.debug('reportPageTranslateState', { enabled: true });
      await sendMessage('reportPageTranslateState', {
        enabled: true
      });

      this.active = true;
      await this.primeTitle();
      this.startTitleTracking();

      // Listen to existing elements when they enter the viewpoint
      const walkId = cryptoPolyfill.getUUID();
      this.walkId = walkId;
      this.intersectionObserver = new IntersectionObserver(async (entries, observer) => {
        logger.trace('IntersectionObserver callback triggered', { entries });
        for (const entry of entries) {
          const { target, isIntersecting } = entry;
          if (isIntersecting) {
            if (domFilter.isHTMLElement(target)) {
              logger.info('Element entered viewport', { target });
              if (!target.closest(`.${CONTENT_WRAPPER_CLASS}`)) {
                const {
                  targetLangCode,
                  adaptiveTranslate: {
                    translate: { mode: translateMode, pageRange, displayStyle }
                  }
                } = configStore.get();
                void translateWalkedElement(
                  target,
                  walkId,
                  translateMode,
                  pageRange,
                  targetLangCode,
                  displayStyle
                );
              }
            }
            observer.unobserve(entry.target);
          }
        }
      }, this.intersectionOptions);

      // Initialize walkability state for existing elements
      this.addDontWalkIntoElements(document.body);
      await this.observeParagraphs(document.body);

      // Start observing mutations from document.body and all shadow roots
      this.observeMutations(document.body);

      if (trackedContext) {
        void analyticsManager.trackFeatureUsed({
          ...trackedContext,
          outcome: 'success'
        });
      }
    } catch (error) {
      logger.error('Failed to start page translation:', { error });
      if (trackedContext) {
        void analyticsManager.trackFeatureUsed({
          ...trackedContext,
          outcome: 'failure'
        });
      }
      throw error;
    }
    logger.info('Started PageTranslateManager');
  }

  /**
   * Stops the automatic page translation functionality
   * Cleans up all observers and removes translated content and set storage
   */
  stop(): void {
    if (!this.active) {
      logger.warn('PageTranslationManager is already inactive');
      return;
    }
    logger.info('Stopping PageTranslateManager');

    logger.debug('reportPageTranslateState', { enabled: false });
    void sendMessage('reportPageTranslateState', {
      enabled: false
    });

    this.active = false;
    this.walkId = null;
    this.dontWalkCache = new WeakSet();
    this.stopTitleTracking();

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
      if (e.touches.length === 4) {
        startTime = performance.now();
        startTouches = e.touches;
      } else {
        reset();
      }
    };

    const onMove = (e: TouchEvent) => {
      if (!startTouches) return;
      if (e.touches.length !== 4) return reset();

      for (let i = 0; i < 4; i++) {
        const dx = e.touches[i].clientX - startTouches[i].clientX;
        const dy = e.touches[i].clientY - startTouches[i].clientY;
        if (dx * dx + dy * dy > this.MOVE_THRESHOLD) return reset();
      }
    };

    const onEnd = () => {
      if (!startTouches) return;
      if (performance.now() - startTime < this.MAX_DURATION) {
        if (this.active) {
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

  private isTopFrame(): boolean {
    return window === window.top;
  }

  private async primeTitle(): Promise<void> {
    if (!this.isTopFrame()) {
      return;
    }

    try {
      const {
        adaptiveTranslate: {
          translate: { pageRange }
        }
      } = configStore.get();
      await webpage.context.get(pageRange);
    } catch (error) {
      logger.warn('Failed to prime webpage context before translating document title', { error });
    }
  }

  private startTitleTracking(): void {
    if (!this.isTopFrame()) {
      return;
    }

    this.lastSourceTitle = document.title || '';
    this.lastAppliedTranslatedTitle = null;
    this.titleRequestVersion = 0;

    this.observeTitle();
    void this.syncTitle(this.lastSourceTitle);
  }

  private stopTitleTracking(): void {
    if (!this.isTopFrame()) {
      return;
    }

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

  private observeTitle(): void {
    if (!document.head) {
      return;
    }

    if (this.titleObserver) {
      this.titleObserver.disconnect();
    }

    this.titleObserver = new MutationObserver(() => {
      this.onTitleMutation();
    });

    this.titleObserver.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  private onTitleMutation(): void {
    if (!this.active || !this.isTopFrame()) {
      return;
    }

    const currentTitle = document.title || '';

    if (currentTitle === this.lastSourceTitle) {
      return;
    }

    if (currentTitle === this.lastAppliedTranslatedTitle) {
      return;
    }

    this.lastSourceTitle = currentTitle;
    void this.syncTitle(currentTitle);
  }

  private async syncTitle(sourceTitle: string): Promise<void> {
    if (!sourceTitle.trim() || !this.active || !this.isTopFrame()) {
      return;
    }

    const requestVersion = ++this.titleRequestVersion;

    try {
      logger.info('Would translate title:', { sourceTitle });
      if (!this.active || requestVersion !== this.titleRequestVersion) {
        return;
      }
    } catch (error) {
      if (requestVersion === this.titleRequestVersion) {
        logger.warn('Failed to translate document title:', { error });
      }
    }
  }

  private async observeParagraphs(container: HTMLElement): Promise<void> {
    const observer = this.intersectionObserver;
    if (!this.walkId || !observer) return;

    const {
      adaptiveTranslate: {
        translate: { pageRange }
      }
    } = configStore.get();
    if (domFilter.hasNoWalkAncestor(container, pageRange)) return;

    domTraversal.walkAndLabelElement(container, this.walkId, pageRange);

    const containerWalked = container.getAttribute('data-walked');
    if (container.hasAttribute('data-paragraph') && containerWalked === this.walkId) {
      observer.observe(container);
      return;
    }

    const paragraphs = this.collectParagraphsDeep(container, this.walkId);
    const topLevelParagraphs = paragraphs.filter((el) => {
      const ancestor = el.parentElement?.closest('[data-paragraph]');
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
        root.querySelectorAll<HTMLElement>(`[data-paragraph][data-walked="${CSS.escape(walkId)}"]`)
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
    const wasDontWalkInto = this.dontWalkCache.has(element);
    const isDontWalkIntoNow = domFilter.isDontWalkIntoButTranslateAsChildElement(element);

    if (isDontWalkIntoNow) {
      this.dontWalkCache.add(element);
    } else {
      this.dontWalkCache.delete(element);
    }

    return wasDontWalkInto === true && isDontWalkIntoNow === false;
  }

  /**
   * Initialize walkability state for an element and its descendants
   */
  private addDontWalkIntoElements(element: HTMLElement): void {
    const dontWalkIntoElements = domFinder.deepQueryTopLevelSelector(
      element,
      domFilter.isDontWalkIntoButTranslateAsChildElement.bind(this)
    );
    dontWalkIntoElements.forEach((el) => this.dontWalkCache.add(el));
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
              void this.observeParagraphs(node);
              this.observeShadows(node);
            }
          });
        } else if (
          rec.type === 'attributes' &&
          (rec.attributeName === 'style' || rec.attributeName === 'class')
        ) {
          const el = rec.target;
          if (domFilter.isHTMLElement(el) && this.didChangeToWalkable(el)) {
            void this.observeParagraphs(el);
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
    this.observeShadows(container);
  }

  private observeShadows(element: HTMLElement): void {
    if (element.shadowRoot) {
      for (const child of Array.from(element.shadowRoot.children)) {
        if (domFilter.isHTMLElement(child)) {
          this.observeMutations(child);
        }
      }
    }

    for (const child of Array.from(element.children)) {
      if (domFilter.isHTMLElement(child)) {
        this.observeShadows(child);
      }
    }
  }
}

/**
 * Binds page translation shortcut key from the given config.
 * Uses sync cached config inside the hotkey callback to avoid async overhead.
 */
export function bindTranslationShortcutKey(
  pageTranslationManager: PageTranslateManager
): () => void {
  const config = configStore.get();
  const { shortcut } = config.adaptiveTranslate;
  if (!shortcut || shortcut.length === 0) {
    return () => {};
  }

  const keyCombo = shortcut.join('+');

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.target instanceof HTMLElement && domFilter.isEditable(event.target)) return;

    const keys: string[] = [];
    if (event.altKey) keys.push('Alt');
    if (event.ctrlKey) keys.push('Control');
    if (event.shiftKey) keys.push('Shift');
    if (event.metaKey) keys.push('Meta');
    keys.push(event.key);

    const pressedCombo = keys.join('+');
    if (pressedCombo === keyCombo) {
      event.preventDefault();
      event.stopPropagation();

      if (pageTranslationManager.isTranslating) {
        pageTranslationManager.stop();
      } else {
        void pageTranslationManager.start();
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown, { capture: true });

  return () => {
    document.removeEventListener('keydown', handleKeyDown, { capture: true });
  };
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
