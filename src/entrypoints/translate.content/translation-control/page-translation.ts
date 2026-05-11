import analyticsManager from '@/lib/analytics';
import cryptoPolyfill from '@/lib/crypto-polyfill';
import domFilter from '@/lib/dom/filter';
import domFind from '@/lib/dom/find';
import domTraversal from '@/lib/dom/traversal';
import logger from '@/lib/logger';
import { sendMessage } from '@/lib/protocol';
import translateWalker from '@/lib/translate/core/translate-walker';
import translateVariants from '@/lib/translate/translate-variants';
import webpageContext from '@/lib/translate/webpage-context';
import { CONTENT_WRAPPER_CLASS } from '@/preset/dom';
import { FeatureUsageContext } from '@/types/analytics';

type SimpleIntersectionOptions = Omit<IntersectionObserverInit, 'threshold'> & {
  threshold?: number;
};

interface IPageTranslationManager {
  /**
   * Indicates whether the page translation is currently active
   */
  readonly isActive: boolean;

  /**
   * Starts the automatic page translation functionality
   * Registers observers, touch triggers and set storage
   */
  start: (analyticsContext?: FeatureUsageContext) => Promise<void>;

  /**
   * Stops the automatic page translation functionality
   * Cleans up all observers and removes translated content and set storage
   */
  stop: () => void;

  /**
   * Registers page translation triggers
   */
  registerTriggers: () => () => void;
}

export class PageTranslationManager implements IPageTranslationManager {
  private static readonly MAX_DURATION = 500;
  private static readonly MOVE_THRESHOLD = 30 * 30;
  private static readonly DEFAULT_INTERSECTION_OPTIONS: SimpleIntersectionOptions = {
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
      ...PageTranslationManager.DEFAULT_INTERSECTION_OPTIONS,
      ...intersectionOptions
    };
  }

  get isActive(): boolean {
    return this.active;
  }

  async start(analyticsContext?: FeatureUsageContext): Promise<void> {
    if (this.active) {
      logger.warn('PageTranslationManager is already active');
      return;
    }

    const trackedContext = window === window.top ? analyticsContext : undefined;

    if (!translateVariants.validateConfig()) {
      if (trackedContext) {
        void analyticsManager.trackFeatureUsed({
          ...trackedContext,
          outcome: 'failure'
        });
      }
      return;
    }

    try {
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
        for (const entry of entries) {
          const { target, isIntersecting } = entry;
          if (isIntersecting) {
            if (domFilter.isHTMLElement(target)) {
              logger.info('Element entered viewport', { target });
              if (!target.closest(`.${CONTENT_WRAPPER_CLASS}`)) {
                void translateWalker.run(target, walkId);
              }
            }
            observer.unobserve(entry.target);
          }
        }
      }, this.intersectionOptions);

      // Initialize walkability state for existing elements
      this.cacheOpaque(document.body);
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
  }

  stop(): void {
    if (!this.active) {
      logger.warn('PageTranslationManager is already inactive');
      return;
    }

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

    // void removeAllWrappers();
  }

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
        if (dx * dx + dy * dy > PageTranslationManager.MOVE_THRESHOLD) return reset();
      }
    };

    const onEnd = () => {
      if (!startTouches) return;
      if (performance.now() - startTime < PageTranslationManager.MAX_DURATION) {
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
      await webpageContext.getContext();
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

    if (domFilter.hasNoWalkAncestor(container)) return;

    domTraversal.walkAndLabelElement(container, this.walkId);

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
  private becameWalkable(element: HTMLElement): boolean {
    const wasDontWalkInto = this.dontWalkCache.has(element);
    const isDontWalkIntoNow = domFilter.isOpaque(element);

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
  private cacheOpaque(element: HTMLElement): void {
    const dontWalkIntoElements = domFind.deepQueryTopLevel(element, domFilter.isOpaque.bind(this));
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
              this.cacheOpaque(node);
              void this.observeParagraphs(node);
              this.observeShadows(node);
            }
          });
        } else if (
          rec.type === 'attributes' &&
          (rec.attributeName === 'style' || rec.attributeName === 'class')
        ) {
          const el = rec.target;
          if (domFilter.isHTMLElement(el) && this.becameWalkable(el)) {
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
