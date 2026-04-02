import { browser } from 'wxt/browser';

import { checkedLastError } from '@/lib/error';
import { ShowOriginal } from './show-original';
import { PlatformInfo } from '@/lib/platform-info';

type PageLanguageState = 'original' | 'translated';

interface PieceInfo {
  isTranslated: boolean;
  parentElement: Element | null;
  topElement: Element | null;
  bottomElement: Element | null;
  nodes: Text[];
}

interface AttributeInfo {
  node: HTMLElement;
  original: string;
  attrName: 'placeholder' | 'alt' | 'value' | 'title';
  isTranslated: boolean;
}

interface NodeRestoreInfo {
  node: Text | HTMLElement;
  original: Text;
  originalText: string;
  translatedText: string;
  parentNode: Node | null;
  originalScale?: number;
}

interface ImproveTranslationInfo {
  pageTranslatorService: string;
  dontSortResults: string;
  sourceLanguage: string;
  targetLanguage: string;
}

interface RuntimeRequest {
  action?: string;
  targetLanguage?: string;
  newServiceName?: string;
  serviceNames?: string[];
  pageTranslatorService?: string;
  dontSortResults?: string;
  sourceLanguage?: string;
}

const htmlTagsInlineText = [
  '#text',
  'a',
  'abbr',
  'acronym',
  'b',
  'bdo',
  'big',
  'cite',
  'dfn',
  'em',
  'i',
  'label',
  'q',
  's',
  'small',
  'span',
  'strong',
  'sub',
  'u',
  'tt',
  'var'
];

const htmlTagsInlineIgnoreBase = ['br', 'code', 'kbd', 'wbr'];

const htmlTagsNoTranslate = [
  'title',
  'script',
  'style',
  'textarea',
  'svg',
  'template',
  'math',
  'mjx-container',
  'tex-math'
];

function isElement(node: Node | null): node is Element {
  return !!node && node.nodeType === Node.ELEMENT_NODE;
}

function removeExtraDelimiter(textContext: string): string {
  return textContext.replaceAll('\n', ' ').replace(/  +/g, ' ');
}

export class PageTranslator {
  private pageLanguageState: PageLanguageState = 'original';
  private originalTabLanguage = 'und';
  private currentPageLanguage = 'und';
  private currentSourceLanguage = 'auto';
  private currentTargetLanguage = 'en';
  private currentPageTranslatorService = 'google';
  private dontSortResults = false;
  private tabHostName = '';
  private originalPageTitle: string | null = null;

  private observers: Array<(lang: string) => void> = [];
  private stateObservers: Array<(state: PageLanguageState) => void> = [];
  private alreadyGotTheLanguage = false;

  private piecesToTranslate: PieceInfo[] = [];
  private attributesToTranslate: AttributeInfo[] = [];
  private nodesToRestore: NodeRestoreInfo[] = [];

  private fooCount = 0;
  private pageIsVisible = document.visibilityState === 'visible';

  private translationRoutineHandler: number | null = null;
  private translateNewNodesTimerHandler: number | null = null;
  private newNodes: Node[] = [];
  private removedNodes: Node[] = [];

  private textContentLanguageDetectionPromise: Promise<string> | null = null;
  private readonly htmlTagsInlineIgnore = [...htmlTagsInlineIgnoreBase];

  private readonly mutationObserver = new MutationObserver((mutations) => {
    const candidates: Node[] = [];
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((addedNode) => {
        if (this.isNoTranslateNode(addedNode)) {
          return;
        }
        const nodeName = addedNode.nodeName.toLowerCase();
        if (
          htmlTagsInlineText.indexOf(nodeName) === -1 &&
          this.htmlTagsInlineIgnore.indexOf(nodeName) === -1
        ) {
          candidates.push(addedNode);
        }
      });
      mutation.removedNodes.forEach((removedNode) => {
        this.removedNodes.push(removedNode);
      });
    }

    for (const node of candidates) {
      if (this.newNodes.indexOf(node) === -1) {
        this.newNodes.push(node);
      }
    }
  });

  constructor(
    private showOriginal: ShowOriginal,
    private platformInfo: PlatformInfo,
    private readonly config: {
      get<T>(name: string): T;
      onReady(callback?: () => void): Promise<void>;
      onChanged(callback: (name: string, value: unknown) => void): void;
      set<T>(name: string, value: T): void;
      setTargetLanguage?(lang: string): void;
    },
    private readonly lang: { fixTLanguageCode(code: string): string | null }
  ) {}

  initialize(): void {
    this.applyStaticTagRules();
    this.bindConfigChanges();
    this.bindRuntimeMessageListener();
    this.bindVisibilityListener();

    this.currentTargetLanguage = this.config.get<string>('targetLanguage');
    this.currentPageTranslatorService = this.config.get<string>('pageTranslatorService');
    this.dontSortResults = this.config.get<string>('dontSortResults') === 'yes';

    if (
      this.config.get<string>('useOldPopup') === 'yes' ||
      this.config.get<number>('popupPanelSection') <= 1
    ) {
      const firstTarget = this.config.get<string[]>('targetLanguages')[0];
      if (firstTarget) {
        this.config.setTargetLanguage?.(firstTarget);
      }
    }

    void this.getTabHostName().then((host) => {
      this.tabHostName = host;
    });

    this.detectTabLanguage();
  }

  onPageLanguageStateChange(callback: (state: PageLanguageState) => void): void {
    this.stateObservers.push(callback);
  }

  onGetOriginalTabLanguage(callback: (language: string) => void): void {
    if (this.alreadyGotTheLanguage) {
      callback(this.originalTabLanguage);
    } else {
      this.observers.push(callback);
    }
  }

  translatePage(targetLanguage?: string): void {
    this.fooCount += 1;
    this.restorePage();

    this.showOriginal.enable();
    browser.runtime.sendMessage({ action: 'removeTranslationsWithError' }, checkedLastError);

    if (targetLanguage) {
      this.currentTargetLanguage = targetLanguage;
      this.config.set('targetLanguage', targetLanguage);
    } else {
      this.currentTargetLanguage = this.config.get<string>('targetLanguage');
    }

    if (location.hostname === 'sberbank.com' || location.hostname === 'www.sberbank.com') {
      document.body.classList.remove('notranslate');
    }

    if (location.hostname === 'pdf.translatewebpages.org') {
      const scaleSelect = document.getElementById('scaleSelect') as HTMLSelectElement | null;
      if (scaleSelect) {
        scaleSelect.value = '1.5';
        scaleSelect.dispatchEvent(new Event('change'));
      }
    }

    this.piecesToTranslate = this.getPiecesToTranslate();
    this.attributesToTranslate = this.getAttributesToTranslate();

    this.pageLanguageState = 'translated';
    this.currentPageLanguage = this.currentTargetLanguage;
    this.notifyPageState();

    this.translatePageTitle();
    this.enableMutationObserver();
    this.translationRoutine();
  }

  restorePage(): void {
    this.fooCount += 1;
    this.piecesToTranslate = [];

    this.showOriginal.disable();
    this.disableMutationObserver();

    this.pageLanguageState = 'original';
    this.currentPageLanguage = this.originalTabLanguage;
    this.notifyPageState();

    if (this.originalPageTitle !== null) {
      document.title = this.originalPageTitle;
      this.originalPageTitle = null;
    }

    for (const item of this.nodesToRestore) {
      if (item.node === item.original) {
        if (item.node.textContent === item.translatedText) {
          item.node.textContent = item.originalText;
        }
      } else {
        item.node.replaceWith(item.original);
      }

      if (typeof item.originalScale === 'number' && isElement(item.parentNode)) {
        (item.parentNode as HTMLElement).style.transform = `scaleX(${item.originalScale})`;
      }
    }
    this.nodesToRestore = [];

    for (const attribute of this.attributesToTranslate) {
      if (attribute.isTranslated) {
        attribute.node.setAttribute(attribute.attrName, attribute.original);
      }
    }
    this.attributesToTranslate = [];
  }

  swapTranslationService(newServiceName: string): void {
    this.currentPageTranslatorService = newServiceName;
    this.config.set('pageTranslatorService', newServiceName);
    if (this.pageLanguageState === 'translated') {
      this.translatePage();
    }
  }

  improveTranslation(info: ImproveTranslationInfo): void {
    this.currentPageTranslatorService = info.pageTranslatorService;
    this.dontSortResults = info.dontSortResults === 'yes';
    this.currentSourceLanguage = info.sourceLanguage;
    if (this.pageLanguageState === 'translated') {
      this.translatePage(info.targetLanguage);
    }
  }

  private applyStaticTagRules(): void {
    if (location.hostname === 'pdf.translatewebpages.org') {
      const spanIndex = htmlTagsInlineText.indexOf('span');
      if (spanIndex !== -1) {
        htmlTagsInlineText.splice(spanIndex, 1);
      }
    }

    this.updatePreTagRule(this.config.get<string>('translateTag_pre'));
  }

  private bindConfigChanges(): void {
    this.config.onChanged((name, value) => {
      if (name === 'translateTag_pre') {
        this.updatePreTagRule(String(value));
      } else if (name === 'dontSortResults') {
        this.dontSortResults = String(value) === 'yes';
      } else if (name === 'targetLanguage') {
        this.currentTargetLanguage = String(value);
      } else if (name === 'pageTranslatorService') {
        this.currentPageTranslatorService = String(value);
      }
    });
  }

  private updatePreTagRule(value: string): void {
    const preIndex = this.htmlTagsInlineIgnore.indexOf('pre');
    if (preIndex !== -1) {
      this.htmlTagsInlineIgnore.splice(preIndex, 1);
    }

    const bodyHasSinglePre =
      !!document.body &&
      document.body.childElementCount === 1 &&
      document.body.firstElementChild?.nodeName.toLowerCase() === 'pre';

    if (value !== 'yes' && !bodyHasSinglePre) {
      this.htmlTagsInlineIgnore.push('pre');
    }
  }

  private bindRuntimeMessageListener(): void {
    browser.runtime.onMessage.addListener((request: RuntimeRequest, _sender, sendResponse) => {
      const action = request.action;
      if (!action) return;

      if (action === 'translatePage') {
        if (request.targetLanguage === 'original') {
          this.restorePage();
        } else {
          this.translatePage(request.targetLanguage);
        }
      } else if (action === 'restorePage') {
        this.restorePage();
      } else if (action === 'getOriginalTabLanguage') {
        this.onGetOriginalTabLanguage((language) => sendResponse(language));
        return true;
      } else if (action === 'getCurrentPageLanguage') {
        sendResponse(this.currentPageLanguage);
      } else if (action === 'getCurrentPageLanguageState') {
        sendResponse(this.pageLanguageState);
      } else if (action === 'getCurrentPageTranslatorService') {
        sendResponse(this.currentPageTranslatorService);
      } else if (action === 'swapTranslationService') {
        if (request.newServiceName) {
          this.swapTranslationService(request.newServiceName);
        }
      } else if (action === 'toggle-translation') {
        if (this.pageLanguageState === 'translated') {
          this.restorePage();
        } else {
          this.translatePage();
        }
      } else if (action === 'autoTranslateBecauseClickedALink') {
        this.handleAutoTranslateBecauseClickedALink();
      } else if (action === 'restorePagesWithServiceNames') {
        const serviceNames = request.serviceNames ?? [];
        if (serviceNames.indexOf(this.currentPageTranslatorService) !== -1) {
          this.restorePage();
          if (request.newServiceName) {
            this.currentPageTranslatorService = request.newServiceName;
          }
        }
      } else if (action === 'improveTranslation') {
        if (
          request.pageTranslatorService &&
          request.dontSortResults &&
          request.sourceLanguage &&
          request.targetLanguage
        ) {
          this.improveTranslation({
            pageTranslatorService: request.pageTranslatorService,
            dontSortResults: request.dontSortResults,
            sourceLanguage: request.sourceLanguage,
            targetLanguage: request.targetLanguage
          });
        }
      } else if (action === 'getCurrentSourceLanguage') {
        sendResponse(this.currentSourceLanguage);
      } else if (action === 'getDontSortResults') {
        sendResponse(this.dontSortResults);
      } else if (action === 'cleanUp') {
        this.restorePage();
      } else if (action === 'currentTargetLanguage') {
        sendResponse(this.currentTargetLanguage);
      } else if (action === 'detectLanguageUsingTextContent') {
        this.detectLanguageUsingTextContent().then((language) => sendResponse(language));
        return true;
      }

      return;
    });
  }

  private bindVisibilityListener(): void {
    document.addEventListener('visibilitychange', () => {
      this.pageIsVisible = document.visibilityState === 'visible';
      if (this.pageIsVisible && this.pageLanguageState === 'translated') {
        this.enableMutationObserver();
      } else {
        this.disableMutationObserver();
      }
    });
  }

  private notifyPageState(): void {
    browser.runtime.sendMessage(
      { action: 'setPageLanguageState', pageLanguageState: this.pageLanguageState },
      checkedLastError
    );
    this.stateObservers.forEach((callback) => callback(this.pageLanguageState));
  }

  private async detectLanguageUsingTextContent(): Promise<string> {
    if (this.textContentLanguageDetectionPromise) {
      return this.textContentLanguageDetectionPromise;
    }

    this.textContentLanguageDetectionPromise = new Promise((resolve) => {
      const sample = document.body?.innerText?.trim().slice(0, 1000) ?? '';
      browser.i18n.detectLanguage(sample, (result) => {
        const detected = result?.languages?.[0]?.language ?? 'und';
        resolve(detected);
      });
    });

    return this.textContentLanguageDetectionPromise;
  }

  private handleAutoTranslateBecauseClickedALink(): void {
    if (this.config.get<string>('autoTranslateWhenClickingALink') !== 'yes') {
      return;
    }

    this.onGetOriginalTabLanguage(() => {
      if (
        this.pageLanguageState === 'original' &&
        this.originalTabLanguage !== this.currentTargetLanguage &&
        this.config.get<string[]>('neverTranslateLangs').indexOf(this.originalTabLanguage) === -1 &&
        this.config.get<string[]>('neverTranslateSites').indexOf(this.tabHostName) === -1
      ) {
        this.translatePage();
      }
    });
  }

  private async getTabHostName(): Promise<string> {
    return new Promise((resolve) => {
      browser.runtime.sendMessage({ action: 'getTabHostName' }, (result) => {
        checkedLastError();
        resolve(String(result ?? ''));
      });
    });
  }

  private detectTabLanguage(): void {
    if (window.self === window.top) {
      const onTabVisible = (): void => {
        browser.runtime.sendMessage({ action: 'detectTabLanguage' }, (result) => {
          checkedLastError();
          const detected = String(result ?? 'und');
          this.handleDetectedMainFrameLanguage(detected);
          this.finishLanguageInitialization();
        });
      };

      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          onTabVisible();
        } else {
          const onVisibility = (): void => {
            if (document.visibilityState === 'visible') {
              document.removeEventListener('visibilitychange', onVisibility);
              onTabVisible();
            }
          };
          document.addEventListener('visibilitychange', onVisibility, false);
        }
      }, 150);
      return;
    }

    browser.runtime.sendMessage({ action: 'getMainFrameTabLanguage' }, (result) => {
      checkedLastError();
      this.originalTabLanguage = String(result ?? 'und');
      this.finishLanguageInitialization();
    });

    browser.runtime.sendMessage({ action: 'getMainFramePageLanguageState' }, (result) => {
      checkedLastError();
      if (
        String(result) === 'translated' &&
        this.pageLanguageState === 'original' &&
        this.config.get<string>('enableIframePageTranslation') === 'yes'
      ) {
        this.translatePage();
      }
    });
  }

  private handleDetectedMainFrameLanguage(detectedLanguage: string): void {
    if (detectedLanguage === 'und') {
      this.originalTabLanguage = 'und';
      if (
        (this.config.get<string[]>('alwaysTranslateSites').indexOf(this.tabHostName) !== -1 ||
          (location.hostname === 'pdf.translatewebpages.org' &&
            this.config.get<string[]>('neverTranslateSites').indexOf(this.tabHostName) === -1)) &&
        !this.platformInfo.isMobile.any
      ) {
        this.translatePage();
      }
      return;
    }

    const langCode = this.lang.fixTLanguageCode(detectedLanguage);
    if (langCode) {
      this.originalTabLanguage = langCode;
    } else {
      this.originalTabLanguage = 'und';
    }

    if (
      (location.hostname === 'pdftohtml.translatewebpages.org' &&
        location.href.indexOf('?autotranslate') !== -1 &&
        this.config.get<string[]>('neverTranslateSites').indexOf(this.tabHostName) === -1) ||
      (location.hostname === 'pdf.translatewebpages.org' &&
        this.config.get<string[]>('neverTranslateSites').indexOf(this.tabHostName) === -1)
    ) {
      this.translatePage();
      return;
    }

    const blockedHost =
      location.hostname === 'translate.googleusercontent.com' ||
      location.hostname === 'translate.google.com' ||
      location.hostname === 'translate.yandex.com' ||
      location.hostname === 'www.deepl.com' ||
      location.hostname === 'translated.turbopages.org' ||
      location.hostname.endsWith('translate.goog') ||
      location.hostname === 'sberbank.com' ||
      location.hostname === 'www.sberbank.com';

    if (blockedHost) {
      return;
    }

    if (this.pageLanguageState !== 'original' || browser.extension.inIncognitoContext) {
      return;
    }

    if (this.config.get<string[]>('neverTranslateSites').indexOf(this.tabHostName) !== -1) {
      return;
    }

    if (
      langCode &&
      langCode !== this.currentTargetLanguage &&
      this.config.get<string[]>('alwaysTranslateLangs').indexOf(langCode) !== -1
    ) {
      this.translatePage();
      return;
    }

    if (
      this.config.get<string[]>('alwaysTranslateSites').indexOf(this.tabHostName) !== -1 &&
      !this.platformInfo.isMobile.any
    ) {
      this.translatePage();
    }
  }

  private finishLanguageInitialization(): void {
    this.currentPageLanguage = this.originalTabLanguage;
    this.alreadyGotTheLanguage = true;
    this.observers.forEach((callback) => callback(this.originalTabLanguage));
    this.observers = [];
  }

  private isNoTranslateNode(node: Node): boolean {
    if (!isElement(node)) {
      return false;
    }

    const nodeName = node.nodeName.toLowerCase();

    if (nodeName === 'span' && node.classList.contains('mjx-chtml')) {
      return true;
    }

    if (htmlTagsNoTranslate.indexOf(nodeName) === -1) {
      return false;
    }

    if (
      nodeName === 'script' &&
      node.getAttribute('data-spotim-module') === 'spotim-launcher' &&
      Array.from(node.childNodes).some((child) => child.nodeType === Node.ELEMENT_NODE)
    ) {
      return false;
    }

    return true;
  }

  private getPiecesToTranslate(root: Node = document.documentElement): PieceInfo[] {
    const result: PieceInfo[] = [
      {
        isTranslated: false,
        parentElement: null,
        topElement: null,
        bottomElement: null,
        nodes: []
      }
    ];

    let index = 0;
    let currentParagraphSize = 0;

    const pushBoundary = (lastElement: Element | null): void => {
      const current = result[index];
      if (current.nodes.length === 0) {
        return;
      }
      currentParagraphSize = 0;
      current.bottomElement = lastElement;
      result.push({
        isTranslated: false,
        parentElement: null,
        topElement: null,
        bottomElement: null,
        nodes: []
      });
      index += 1;
    };

    const visit = (
      node: Node,
      lastHTMLElement: Element | null,
      lastSelectOrDataListElement: Element | null
    ): void => {
      if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        let currentLastElement = lastHTMLElement;
        let currentSelectOrDataList = lastSelectOrDataListElement;

        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          currentLastElement = element;
          const nodeName = element.nodeName.toLowerCase();

          if (nodeName === 'select' || nodeName === 'datalist') {
            currentSelectOrDataList = element;
          }

          if (
            this.htmlTagsInlineIgnore.indexOf(nodeName) !== -1 ||
            this.isNoTranslateNode(element) ||
            element.classList.contains('notranslate') ||
            element.getAttribute('translate') === 'no' ||
            (element as HTMLElement).isContentEditable ||
            element.classList.contains('CodeMirror') ||
            element.classList.contains('material-icons') ||
            element.classList.contains('material-symbols-outlined') ||
            nodeName.startsWith('br-') ||
            element.getAttribute('id') === 'branch-select-menu' ||
            (location.hostname === 'twitter.com' &&
              nodeName === 'a' &&
              (typeof element.matches !== 'function' || element.matches('article a')))
          ) {
            pushBoundary(currentLastElement);
            return;
          }
        } else if (node instanceof ShadowRoot) {
          currentLastElement = node.host;
          currentSelectOrDataList = null;
        }

        const visitChildren = (childNodes: NodeListOf<ChildNode> | NodeList): void => {
          Array.from(childNodes).forEach((child) => {
            const nodeName = child.nodeName.toLowerCase();
            if (child.nodeType === Node.ELEMENT_NODE) {
              currentLastElement = child as Element;
              if (nodeName === 'select' || nodeName === 'datalist') {
                currentSelectOrDataList = child as Element;
              }
            }

            if (htmlTagsInlineText.indexOf(nodeName) === -1) {
              pushBoundary(currentLastElement);
              visit(child, currentLastElement, currentSelectOrDataList);
              pushBoundary(currentLastElement);
            } else {
              visit(child, currentLastElement, currentSelectOrDataList);
            }
          });
        };

        visitChildren(node.childNodes);

        if (!result[index].bottomElement) {
          result[index].bottomElement = currentLastElement;
        }

        if (isElement(node) && node.shadowRoot) {
          visitChildren(node.shadowRoot.childNodes);
          if (!result[index].bottomElement) {
            result[index].bottomElement = node;
          }
        }

        return;
      }

      if (node.nodeType !== Node.TEXT_NODE) {
        return;
      }

      const textNode = node as Text;
      const textContent = textNode.textContent ?? '';
      if (textContent.trim().length === 0) {
        return;
      }

      const currentPiece = result[index];
      if (!currentPiece.parentElement) {
        const parentNode = textNode.parentNode;
        if (
          parentNode &&
          parentNode.nodeName.toLowerCase() === 'option' &&
          lastSelectOrDataListElement
        ) {
          currentPiece.parentElement = lastSelectOrDataListElement;
          currentPiece.topElement = lastSelectOrDataListElement;
          currentPiece.bottomElement = lastSelectOrDataListElement;
        } else {
          let temp: Node | null = parentNode;
          while (temp && temp !== root) {
            if (!isElement(temp)) {
              if (temp instanceof ShadowRoot) {
                temp = temp.host;
                continue;
              }
              break;
            }
            const nodeName = temp.nodeName.toLowerCase();
            if (
              htmlTagsInlineText.indexOf(nodeName) === -1 &&
              this.htmlTagsInlineIgnore.indexOf(nodeName) === -1
            ) {
              break;
            }
            temp = temp.parentNode;
          }
          currentPiece.parentElement = isElement(temp) ? temp : document.body;
        }
      }

      if (!currentPiece.topElement && lastHTMLElement) {
        currentPiece.topElement = lastHTMLElement;
      }

      if (currentParagraphSize > 1000) {
        currentParagraphSize = 0;
        currentPiece.bottomElement = lastHTMLElement;
        result.push({
          isTranslated: false,
          parentElement: currentPiece.parentElement,
          topElement: lastHTMLElement,
          bottomElement: null,
          nodes: []
        });
        index += 1;
      }

      currentParagraphSize += textContent.length;
      result[index].nodes.push(textNode);
      result[index].bottomElement = null;
    };

    visit(root, null, null);

    if (result.length > 0 && result[result.length - 1].nodes.length === 0) {
      result.pop();
    }

    return result;
  }

  private getAttributesToTranslate(root: ParentNode = document.body): AttributeInfo[] {
    const result: AttributeInfo[] = [];
    if (!root) {
      return result;
    }

    const hasNoTranslate = (elem: Element): boolean => {
      return elem.classList.contains('notranslate') || elem.getAttribute('translate') === 'no';
    };

    const placeholdersElements = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'input[placeholder], textarea[placeholder]'
    );
    placeholdersElements.forEach((element) => {
      if (hasNoTranslate(element)) return;
      const text = element.getAttribute('placeholder');
      if (text && text.trim()) {
        result.push({
          node: element,
          original: text,
          attrName: 'placeholder',
          isTranslated: false
        });
      }
    });

    const altElements = root.querySelectorAll<HTMLElement>(
      'area[alt], img[alt], input[type="image"][alt]'
    );
    altElements.forEach((element) => {
      if (hasNoTranslate(element)) return;
      const text = element.getAttribute('alt');
      if (text && text.trim()) {
        result.push({ node: element, original: text, attrName: 'alt', isTranslated: false });
      }
    });

    const valueElements = root.querySelectorAll<HTMLInputElement>(
      'input[type="button"], input[type="submit"], input[type="reset"]'
    );
    valueElements.forEach((element) => {
      if (hasNoTranslate(element)) return;
      const value = element.getAttribute('value');
      if (element.type === 'submit' && !value) {
        result.push({
          node: element,
          original: 'Submit Query',
          attrName: 'value',
          isTranslated: false
        });
      } else if (element.type === 'reset' && !value) {
        result.push({ node: element, original: 'Reset', attrName: 'value', isTranslated: false });
      } else if (value && value.trim()) {
        result.push({ node: element, original: value, attrName: 'value', isTranslated: false });
      }
    });

    const titleElements = root.querySelectorAll<HTMLElement>('body [title]');
    titleElements.forEach((element) => {
      if (hasNoTranslate(element)) return;
      const title = element.getAttribute('title');
      if (title && title.trim()) {
        result.push({ node: element, original: title, attrName: 'title', isTranslated: false });
      }
    });

    return result;
  }

  private enableMutationObserver(): void {
    this.disableMutationObserver();
    if (this.config.get<string>('translateDynamicallyCreatedContent') !== 'yes') {
      return;
    }

    if (!document.body) {
      return;
    }

    this.translateNewNodesTimerHandler = window.setInterval(() => this.translateNewNodes(), 2000);
    this.mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  private disableMutationObserver(): void {
    if (this.translateNewNodesTimerHandler !== null) {
      clearInterval(this.translateNewNodesTimerHandler);
      this.translateNewNodesTimerHandler = null;
    }
    this.newNodes = [];
    this.removedNodes = [];
    this.mutationObserver.disconnect();
    this.mutationObserver.takeRecords();
  }

  private translateNewNodes(): void {
    try {
      this.newNodes.forEach((candidate) => {
        if (this.removedNodes.indexOf(candidate) !== -1) return;
        const newPieces = this.getPiecesToTranslate(candidate);
        for (const newPiece of newPieces) {
          const exists = this.piecesToTranslate.some((existingPiece) =>
            existingPiece.nodes.some((n1) => newPiece.nodes.some((n2) => n1 === n2))
          );
          if (!exists) {
            this.piecesToTranslate.push(newPiece);
          }
        }
      });
    } finally {
      this.newNodes = [];
      this.removedNodes = [];
    }
  }

  private encapsulateTextNode(node: Text): HTMLElement {
    const fontNode = document.createElement('font');
    fontNode.setAttribute('style', 'vertical-align: inherit;');
    fontNode.textContent = node.textContent;
    node.replaceWith(fontNode);
    return fontNode;
  }

  private translateTextContent(
    node: Text | HTMLElement,
    parentNode: Node | null,
    text: string,
    toRestore: NodeRestoreInfo
  ): void {
    toRestore.translatedText = text;

    if (
      location.hostname === 'pdf.translatewebpages.org' &&
      isElement(parentNode) &&
      parentNode.nodeName.toLowerCase() === 'span' &&
      parentNode.getAttribute('role') === 'presentation'
    ) {
      const oldClientWidth = (node.parentNode as HTMLElement | null)?.clientWidth ?? 0;
      node.textContent = text;
      const newClientWidth = (node.parentNode as HTMLElement | null)?.clientWidth ?? oldClientWidth;
      const transformMatch = (parentNode as HTMLElement).style.transform.match(/[0-9]+[\.]?[0-9]*/);
      const currentScaleX = transformMatch ? parseFloat(transformMatch[0]) : 1;
      toRestore.originalScale = currentScaleX;
      const ratio = newClientWidth > 0 ? oldClientWidth / newClientWidth : 1;
      (parentNode as HTMLElement).style.transform =
        `scaleX(${currentScaleX * Math.min(currentScaleX, ratio)})`;
      return;
    }

    node.textContent = text;
  }

  private translateResults(piecesToTranslateNow: PieceInfo[], results: string[][]): void {
    for (let i = 0; i < piecesToTranslateNow.length; i += 1) {
      const piece = piecesToTranslateNow[i];
      const row = results[i] ?? [];
      for (let j = 0; j < piece.nodes.length; j += 1) {
        const originalTextNode = piece.nodes[j];
        if (!originalTextNode) continue;

        let translated = row[j] ?? '';
        if (!translated) continue;

        if (this.dontSortResults && j === piece.nodes.length - 1 && row.length > j + 1) {
          translated += ` ${row.slice(j + 1).join(' ')}`;
        }
        translated = `${translated} `;

        const parentNode = originalTextNode.parentNode;
        let translatedNode: Text | HTMLElement = originalTextNode;

        if (this.showOriginal.isEnabled) {
          translatedNode = this.encapsulateTextNode(originalTextNode);
          this.showOriginal.add(translatedNode);
        }

        const toRestore: NodeRestoreInfo = {
          node: translatedNode,
          original: originalTextNode,
          originalText: originalTextNode.textContent ?? '',
          translatedText: translated,
          parentNode
        };
        this.nodesToRestore.push(toRestore);

        this.translateTextContent(
          translatedNode,
          parentNode,
          removeExtraDelimiter(translated),
          toRestore
        );
      }
    }

    this.mutationObserver.takeRecords();
  }

  private translateAttributes(attributesToTranslateNow: AttributeInfo[], results: string[]): void {
    for (let i = 0; i < attributesToTranslateNow.length; i += 1) {
      const attribute = attributesToTranslateNow[i];
      const translated = results[i];
      if (!attribute || typeof translated !== 'string') {
        continue;
      }
      attribute.node.setAttribute(attribute.attrName, translated);
      attribute.isTranslated = true;
    }
  }

  private isInScreen(element: Element | null): boolean {
    if (!element) {
      return false;
    }
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    return (
      (rect.top > 0 && rect.top <= viewportHeight) ||
      (rect.bottom > 0 && rect.bottom <= viewportHeight)
    );
  }

  private topIsInScreen(element: Element | null): boolean {
    if (!element) {
      return false;
    }
    const rect = element.getBoundingClientRect();
    return rect.top > 0 && rect.top <= window.innerHeight;
  }

  private bottomIsInScreen(element: Element | null): boolean {
    if (!element) {
      return false;
    }
    const rect = element.getBoundingClientRect();
    return rect.bottom > 0 && rect.bottom <= window.innerHeight;
  }

  private translationRoutine(): void {
    try {
      if (this.piecesToTranslate.length > 0 && this.pageIsVisible) {
        const currentFooCount = this.fooCount;

        const piecesToTranslateNow: PieceInfo[] = [];
        this.piecesToTranslate.forEach((piece) => {
          if (piece.isTranslated) return;
          if (this.bottomIsInScreen(piece.topElement) || this.topIsInScreen(piece.bottomElement)) {
            piece.isTranslated = true;
            piecesToTranslateNow.push(piece);
          }
        });

        const attributesToTranslateNow: AttributeInfo[] = [];
        this.attributesToTranslate.forEach((attribute) => {
          if (attribute.isTranslated) return;
          if (this.isInScreen(attribute.node)) {
            attribute.isTranslated = true;
            attributesToTranslateNow.push(attribute);
          }
        });

        if (piecesToTranslateNow.length > 0) {
          const payload = piecesToTranslateNow.map((piece) =>
            piece.nodes.map((node) => removeExtraDelimiter(node.textContent ?? ''))
          );

          void this.backgroundTranslateHTML(
            this.currentPageTranslatorService,
            this.currentSourceLanguage,
            this.currentTargetLanguage,
            payload,
            this.dontSortResults
          ).then((results) => {
            if (this.pageLanguageState === 'translated' && currentFooCount === this.fooCount) {
              this.translateResults(piecesToTranslateNow, results);
            }
          });
        }

        if (attributesToTranslateNow.length > 0) {
          void this.backgroundTranslateText(
            this.currentPageTranslatorService,
            this.currentSourceLanguage,
            this.currentTargetLanguage,
            attributesToTranslateNow.map((attribute) => attribute.original)
          ).then((results) => {
            if (this.pageLanguageState === 'translated' && currentFooCount === this.fooCount) {
              this.translateAttributes(attributesToTranslateNow, results);
            }
          });
        }
      }
    } catch {}

    if (this.translationRoutineHandler !== null) {
      clearTimeout(this.translationRoutineHandler);
    }
    this.translationRoutineHandler = window.setTimeout(() => this.translationRoutine(), 300);
  }

  private translatePageTitle(): void {
    const titleElement = document.querySelector('title');
    if (
      titleElement &&
      (titleElement.classList.contains('notranslate') ||
        titleElement.getAttribute('translate') === 'no')
    ) {
      return;
    }

    if (document.title.trim().length < 1) {
      return;
    }

    this.originalPageTitle = document.title;

    void this.backgroundTranslateSingleText(
      this.currentPageTranslatorService,
      this.currentSourceLanguage,
      this.currentTargetLanguage,
      this.originalPageTitle
    ).then((translated) => {
      if (translated) {
        document.title = translated;
      }
    });
  }

  private async backgroundTranslateHTML(
    translationService: string,
    sourceLanguage: string,
    targetLanguage: string,
    sourceArray2d: string[][],
    dontSortResults: boolean
  ): Promise<string[][]> {
    return new Promise((resolve) => {
      browser.runtime.sendMessage(
        {
          action: 'translateHTML',
          translationService,
          sourceLanguage,
          targetLanguage,
          sourceArray2d,
          dontSortResults
        },
        (response) => {
          checkedLastError();
          if (Array.isArray(response)) {
            resolve(
              response.map((row) =>
                Array.isArray(row) ? row.map((item) => String(item ?? '')) : []
              )
            );
          } else {
            resolve([]);
          }
        }
      );
    });
  }

  private async backgroundTranslateText(
    translationService: string,
    sourceLanguage: string,
    targetLanguage: string,
    sourceArray: string[]
  ): Promise<string[]> {
    return new Promise((resolve) => {
      browser.runtime.sendMessage(
        {
          action: 'translateText',
          translationService,
          sourceLanguage,
          targetLanguage,
          sourceArray
        },
        (response) => {
          checkedLastError();
          if (Array.isArray(response)) {
            resolve(response.map((item) => String(item ?? '')));
          } else {
            resolve([]);
          }
        }
      );
    });
  }

  private async backgroundTranslateSingleText(
    translationService: string,
    sourceLanguage: string,
    targetLanguage: string,
    source: string
  ): Promise<string> {
    return new Promise((resolve) => {
      browser.runtime.sendMessage(
        {
          action: 'translateSingleText',
          translationService,
          sourceLanguage,
          targetLanguage,
          source
        },
        (response) => {
          checkedLastError();
          resolve(String(response ?? ''));
        }
      );
    });
  }
}
