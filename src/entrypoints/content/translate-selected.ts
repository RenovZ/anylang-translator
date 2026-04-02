import { browser } from 'wxt/browser';

import { checkedLastError } from '@/lib/error';

interface SelectionInfo {
  isInputElement: boolean;
  isContentEditable: boolean;
  element: Node & { focus?: () => void; parentNode: ParentNode | null };
  selStart: number;
  selEnd: number;
  text: string;
  top: number;
  left: number;
  bottom: number;
  right: number;
  range?: Range;
  readOnly?: boolean;
}

interface ConfigLike {
  onReady(callback?: () => void): Promise<void>;
  get<T>(name: string): T;
  onChanged(callback: (name: string, value: unknown) => void): void;
  set<T>(name: string, value: T): void;
  setTargetLanguageTextTranslation(lang: string): void;
}

/**
 * 划词翻译控制器：负责读取选区、展示翻译按钮和维护结果面板。
 */
export class TranslateSelected {
  private gSelectionInfo: SelectionInfo | null = null;
  private prevSelectionInfo: SelectionInfo | null = null;

  private divElement: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private buttonElement: HTMLElement | null = null;
  private panelElement: HTMLElement | null = null;
  private originalElement: HTMLElement | null = null;
  private translatedElement: HTMLElement | null = null;
  private moreLessElement: HTMLElement | null = null;
  private originalContainer: HTMLElement | null = null;

  private originalTabLanguage = 'und';
  private tabHostName = '';
  private currentTargetLanguages: string[] = ['en', 'es', 'de'];
  private currentTargetLanguage = 'en';
  private currentTextTranslatorService = 'google';

  private alwaysTranslateThisSite = false;
  private translateThisSite = true;
  private translateThisLanguage = true;
  private showTranslateSelectedButton = 'yes';
  private dontShowIfIsNotValidText = 'no';
  private dontShowIfPageLangIsTargetLang = 'no';
  private dontShowIfPageLangIsUnknown = 'no';
  private dontShowIfSelectedTextIsTargetLang = 'no';
  private dontShowIfSelectedTextIsUnknown = 'no';
  private expandPanel = 'no';

  private showButtonTimerHandler: number | null = null;
  private translateNewInputTimerHandler: number | null = null;
  private fooCount = 0;
  private isPlayingAudio = false;
  private isTouchSelection = false;
  private lastCtrlPress: number | null = null;
  private panelLastCtrlPress: number | null = null;
  private windowIsInFocus = true;

  private config: ConfigLike | null = null;
  private lang: {
    fixTLanguageCode(code: string): string | null;
    codeToLanguage(code: string): string;
    isRtlLanguage(code: string): boolean;
  } | null = null;
  private platformInfo: { isMobile: { any: unknown } } | null = null;
  private i18n: {
    translateDocument(root: Document | HTMLElement | ShadowRoot): void;
    getMessage(name: string, substitutions?: string | string[]): string;
  } | null = null;

  /**
   * 初始化划词翻译功能，并根据配置决定是否监听选区变化。
   */
  public initialize(
    config: ConfigLike,
    pageTranslator: { onGetOriginalTabLanguage(cb: (language: string) => void): void },
    platformInfo: { isMobile: { any: unknown } },
    lang: {
      fixTLanguageCode(code: string): string | null;
      codeToLanguage(code: string): string;
      isRtlLanguage(code: string): boolean;
    },
    i18n: {
      translateDocument(root: Document | HTMLElement | ShadowRoot): void;
      getMessage(name: string, substitutions?: string | string[]): string;
    }
  ): void {
    this.config = config;
    this.platformInfo = platformInfo;
    this.lang = lang;
    this.i18n = i18n;

    void config.onReady(async () => {
      this.tabHostName = await this.getTabHostName();

      this.currentTargetLanguages = config.get<string[]>('targetLanguages');
      this.currentTargetLanguage = config.get<string>('targetLanguageTextTranslation');
      this.currentTextTranslatorService = config.get<string>('textTranslatorService');
      this.alwaysTranslateThisSite =
        config.get<string[]>('alwaysTranslateSites').indexOf(this.tabHostName) !== -1;
      this.translateThisSite =
        config.get<string[]>('neverTranslateSites').indexOf(this.tabHostName) === -1;
      this.showTranslateSelectedButton = config.get<string>('showTranslateSelectedButton');
      this.dontShowIfIsNotValidText = config.get<string>('dontShowIfIsNotValidText');
      this.dontShowIfPageLangIsTargetLang = config.get<string>('dontShowIfPageLangIsTargetLang');
      this.dontShowIfPageLangIsUnknown = config.get<string>('dontShowIfPageLangIsUnknown');
      this.dontShowIfSelectedTextIsTargetLang = config.get<string>(
        'dontShowIfSelectedTextIsTargetLang'
      );
      this.dontShowIfSelectedTextIsUnknown = config.get<string>('dontShowIfSelectedTextIsUnknown');
      this.expandPanel = config.get<string>('expandPanelTranslateSelectedText');

      pageTranslator.onGetOriginalTabLanguage((tabLanguage) => {
        this.originalTabLanguage = tabLanguage;
        this.translateThisLanguage =
          config.get<string[]>('neverTranslateLangs').indexOf(tabLanguage) === -1;
        this.updateEventListeners();
      });

      config.onChanged((name, value) => {
        if (name === 'textTranslatorService') {
          this.currentTextTranslatorService = String(value);
          this.refreshPanelSelections();
        } else if (name === 'targetLanguages') {
          this.currentTargetLanguages = Array.isArray(value)
            ? value.map((item) => String(item))
            : this.currentTargetLanguages;
          this.refreshPanelSelections();
        } else if (name === 'targetLanguageTextTranslation') {
          this.currentTargetLanguage = String(value);
          this.refreshPanelSelections();
        } else if (name === 'alwaysTranslateSites') {
          this.alwaysTranslateThisSite =
            Array.isArray(value) &&
            value.map((item) => String(item)).indexOf(this.tabHostName) !== -1;
          this.updateEventListeners();
        } else if (name === 'neverTranslateSites') {
          this.translateThisSite = !(
            Array.isArray(value) &&
            value.map((item) => String(item)).indexOf(this.tabHostName) !== -1
          );
          this.updateEventListeners();
        } else if (name === 'neverTranslateLangs') {
          this.translateThisLanguage = !(
            Array.isArray(value) &&
            value.map((item) => String(item)).indexOf(this.originalTabLanguage) !== -1
          );
          this.updateEventListeners();
        } else if (name === 'showTranslateSelectedButton') {
          this.showTranslateSelectedButton = String(value);
          this.updateEventListeners();
        } else if (name === 'dontShowIfIsNotValidText') {
          this.dontShowIfIsNotValidText = String(value);
        } else if (name === 'dontShowIfPageLangIsTargetLang') {
          this.dontShowIfPageLangIsTargetLang = String(value);
          this.updateEventListeners();
        } else if (name === 'dontShowIfPageLangIsUnknown') {
          this.dontShowIfPageLangIsUnknown = String(value);
          this.updateEventListeners();
        } else if (name === 'dontShowIfSelectedTextIsTargetLang') {
          this.dontShowIfSelectedTextIsTargetLang = String(value);
        } else if (name === 'dontShowIfSelectedTextIsUnknown') {
          this.dontShowIfSelectedTextIsUnknown = String(value);
        } else if (name === 'expandPanelTranslateSelectedText') {
          this.expandPanel = String(value);
          this.updatePanelExpandState();
        }
      });

      document.addEventListener('keyup', this.onKeyUp, true);
      window.addEventListener('focus', this.onWindowFocus);
      window.addEventListener('blur', this.onWindowBlur);
      window.addEventListener('beforeunload', this.onBeforeUnload);

      browser.runtime.onMessage.addListener((request) => {
        const action = (request as { action?: string }).action;
        if (action === 'TranslateSelectedText') {
          this.readSelection();
          this.init();
          this.translateSelectionText();
        } else if (action === 'anotherFrameIsInFocus') {
          if (!this.windowIsInFocus) {
            this.destroy();
          }
        } else if (action === 'hotTranslateSelectedText') {
          void this.replaceSelectionWithHotTranslation();
        }
      });

      this.updateEventListeners();
    });
  }

  private onWindowFocus = (): void => {
    this.windowIsInFocus = true;
    browser.runtime.sendMessage({ action: 'thisFrameIsInFocus' }, checkedLastError);
  };

  private onWindowBlur = (): void => {
    this.windowIsInFocus = false;
  };

  private onBeforeUnload = (): void => {
    this.destroy();
  };

  /**
   * 调用浏览器语言检测接口，判断当前选中文本更可能属于哪种语言。
   */
  private async detectTextLanguage(text: string): Promise<{ lang: string; isReliable: boolean }> {
    if (!browser.i18n.detectLanguage || !this.lang) {
      return { lang: 'und', isReliable: false };
    }

    return new Promise((resolve) => {
      browser.i18n.detectLanguage(text, (result) => {
        if (!result) {
          resolve({ lang: 'und', isReliable: false });
          return;
        }

        for (const langInfo of result.languages) {
          const fixed = this.lang?.fixTLanguageCode(langInfo.language);
          if (fixed) {
            resolve({ lang: fixed, isReliable: result.isReliable });
            return;
          }
        }

        resolve({ lang: 'und', isReliable: false });
      });
    });
  }

  /**
   * 按当前站点、页面语言和配置决定是否注册划词相关监听器。
   */
  private updateEventListeners(): void {
    const shouldEnable =
      this.showTranslateSelectedButton === 'yes' &&
      (this.alwaysTranslateThisSite || (this.translateThisSite && this.translateThisLanguage)) &&
      ((this.dontShowIfPageLangIsTargetLang === 'yes' &&
        this.originalTabLanguage !== this.currentTargetLanguage) ||
        this.dontShowIfPageLangIsTargetLang !== 'yes') &&
      ((this.dontShowIfPageLangIsUnknown === 'yes' && this.originalTabLanguage !== 'und') ||
        this.dontShowIfPageLangIsUnknown !== 'yes');

    if (shouldEnable) {
      document.addEventListener('mouseup', this.onMouseup);
      document.addEventListener('blur', this.destroyIfButtonIsShowing);
      document.addEventListener('visibilitychange', this.destroyIfButtonIsShowing);
      document.addEventListener('keydown', this.destroyIfButtonIsShowing);
      document.addEventListener('mousedown', this.destroyIfButtonIsShowing);
      document.addEventListener('wheel', this.destroyIfButtonIsShowing);
      if (this.platformInfo?.isMobile.any) {
        document.addEventListener('touchend', this.onTouchend);
        document.addEventListener('selectionchange', this.onSelectionchange);
      }
      return;
    }

    document.removeEventListener('mouseup', this.onMouseup);
    document.removeEventListener('blur', this.destroyIfButtonIsShowing);
    document.removeEventListener('visibilitychange', this.destroyIfButtonIsShowing);
    document.removeEventListener('keydown', this.destroyIfButtonIsShowing);
    document.removeEventListener('mousedown', this.destroyIfButtonIsShowing);
    document.removeEventListener('wheel', this.destroyIfButtonIsShowing);
    if (this.platformInfo?.isMobile.any) {
      document.removeEventListener('touchend', this.onTouchend);
      document.removeEventListener('selectionchange', this.onSelectionchange);
    }
  }

  private destroyIfButtonIsShowing = (event: Event): void => {
    if (
      this.buttonElement &&
      event.target !== this.divElement &&
      this.buttonElement.style.display === 'block'
    ) {
      this.destroy();
    }
  };

  private getSelectionText(): string {
    const activeEl = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;
    if (
      activeEl &&
      (activeEl.tagName.toLowerCase() === 'textarea' ||
        (activeEl.tagName.toLowerCase() === 'input' && /^(?:text|search)$/i.test(activeEl.type))) &&
      typeof activeEl.selectionStart === 'number'
    ) {
      return activeEl.value.slice(activeEl.selectionStart ?? 0, activeEl.selectionEnd ?? 0);
    }

    return window.getSelection()?.toString() ?? '';
  }

  /**
   * 读取当前选区的文本、位置和宿主元素信息，供后续面板定位与替换使用。
   */
  private readSelection(skipIfSameText = false): boolean {
    let newSelection: SelectionInfo | null = null;

    const activeEl = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;
    if (
      activeEl &&
      (activeEl.tagName.toLowerCase() === 'textarea' ||
        (activeEl.tagName.toLowerCase() === 'input' && /^(?:text|search)$/i.test(activeEl.type))) &&
      typeof activeEl.selectionStart === 'number'
    ) {
      const selStart = activeEl.selectionStart ?? 0;
      const selEnd = activeEl.selectionEnd ?? selStart;
      const rect = activeEl.getBoundingClientRect();
      newSelection = {
        isInputElement: true,
        isContentEditable: false,
        element: activeEl as unknown as SelectionInfo['element'],
        selStart,
        selEnd,
        text: activeEl.value.slice(selStart, selEnd),
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right,
        readOnly: activeEl.readOnly
      };
    } else {
      const selection = window.getSelection();
      if (selection && selection.type === 'Range') {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const focusNode = selection.focusNode as SelectionInfo['element'] | null;
        if (focusNode) {
          newSelection = {
            isInputElement: false,
            isContentEditable:
              focusNode.nodeType === Node.TEXT_NODE
                ? Boolean((focusNode.parentNode as HTMLElement | null)?.isContentEditable)
                : Boolean((focusNode as unknown as HTMLElement).isContentEditable),
            element: focusNode,
            selStart: range.startOffset,
            selEnd: range.endOffset,
            text: selection.toString(),
            top: rect.top,
            left: rect.left,
            bottom: rect.bottom,
            right: rect.right,
            range
          };
        }
      }
    }

    if (
      skipIfSameText &&
      this.gSelectionInfo &&
      newSelection &&
      this.gSelectionInfo.text === newSelection.text
    ) {
      this.gSelectionInfo = newSelection;
      return false;
    }

    this.gSelectionInfo = newSelection;
    return true;
  }

  private isSelectingText(): boolean {
    return this.getSelectionText().length > 0;
  }

  private isValidText(text: string): boolean {
    if (text.length < 2) return false;
    if (/^[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?\s]*$/.test(text)) return false;
    return true;
  }

  private onMouseup = (event: MouseEvent): void => {
    if (event.button !== 0) return;
    if (event.target === this.divElement) return;
    if (this.readSelection(true)) {
      if (this.showButtonTimerHandler !== null) {
        clearTimeout(this.showButtonTimerHandler);
      }
      this.showButtonTimerHandler = window.setTimeout(() => {
        void this.onSelectionReleased(event.clientX, event.clientY);
      }, 150);
    }
  };

  private onTouchend = (event: TouchEvent): void => {
    if (event.target === this.divElement) return;
    this.readSelection();
    const touch = event.changedTouches[0];
    if (!touch) return;
    if (this.showButtonTimerHandler !== null) {
      clearTimeout(this.showButtonTimerHandler);
    }
    this.showButtonTimerHandler = window.setTimeout(() => {
      void this.onSelectionReleased(touch.clientX, touch.clientY);
    }, 150);
  };

  private onSelectionchange = (): void => {
    if (this.isTouchSelection) {
      this.readSelection();
    }
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.destroy();
      return;
    }

    if (this.config?.get<string>('translateSelectedWhenPressTwice') !== 'yes') {
      return;
    }

    if (event.key === 'Control') {
      const now = performance.now();
      if (this.lastCtrlPress && now - this.lastCtrlPress < 280 && this.isSelectingText()) {
        this.readSelection();
        this.init();
        this.translateSelectionText();
      }
      this.lastCtrlPress = now;
    }
  };

  private async onSelectionReleased(clientX: number, clientY: number): Promise<void> {
    const selectedText = this.getSelectionText().trim();
    if (!selectedText) return;

    let detected = await this.detectTextLanguage(selectedText);
    if (!detected.lang) {
      detected = { lang: 'und', isReliable: false };
    }

    const passSelectedLangTarget =
      (this.dontShowIfSelectedTextIsTargetLang === 'yes' &&
        detected.lang !== this.currentTargetLanguage) ||
      this.dontShowIfSelectedTextIsTargetLang !== 'yes';
    const passSelectedLangUnknown =
      (this.dontShowIfSelectedTextIsUnknown === 'yes' && detected.lang !== 'und') ||
      this.dontShowIfSelectedTextIsUnknown !== 'yes';
    const passTextValidation =
      this.dontShowIfIsNotValidText !== 'yes' || this.isValidText(selectedText);

    if (!passSelectedLangTarget || !passSelectedLangUnknown || !passTextValidation) {
      return;
    }

    this.init();
    if (!this.buttonElement) return;

    if (this.platformInfo?.isMobile.any) {
      this.buttonElement.style.left = `${window.innerWidth - 45}px`;
      this.buttonElement.style.top = `${clientY}px`;
    } else {
      this.buttonElement.style.left = `${Math.min(window.innerWidth - 40, clientX + 25)}px`;
      this.buttonElement.style.top = `${Math.max(2, clientY - 35)}px`;
    }

    this.buttonElement.style.display = 'block';
  }

  private setCaretAtEnd(): void {
    if (!this.originalElement) return;
    const range = document.createRange();
    const selection = window.getSelection();
    const childCount = this.originalElement.childNodes.length;
    const index = childCount > 0 ? childCount - 1 : 0;
    range.setStart(this.originalElement, index);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);
    this.originalElement.focus();
  }

  /**
   * 初始化划词按钮与翻译结果面板。
   */
  private init(): void {
    this.destroy();
    window.isTranslatingSelected = true;

    this.divElement = document.createElement('div');
    this.divElement.style.cssText = 'all: initial';
    this.divElement.classList.add('notranslate');
    this.shadowRoot = this.divElement.attachShadow({ mode: 'closed' });
    this.shadowRoot.innerHTML = `
      <style>
        #eButtonTransSelText{display:none;position:fixed;z-index:2147483647;background:#4f84ff;color:#fff;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;font:700 14px sans-serif;cursor:pointer}
        #eDivResult{display:none;position:fixed;z-index:2147483647;min-width:280px;max-width:480px;background:#1c1c1c;color:#fff;border-radius:8px;padding:8px;box-shadow:0 10px 24px rgba(0,0,0,.35);font:13px/1.35 sans-serif}
        #origTextContainer{display:none}
        #eOrigText{min-height:56px;white-space:pre-wrap;outline:none}
        #eSelTextTrans{min-height:56px;white-space:pre-wrap}
        #drag{display:flex;justify-content:space-between;gap:8px;margin-top:6px;align-items:center}
        ul{display:flex;gap:6px;padding:0;margin:0;list-style:none;flex-wrap:wrap}
        li{cursor:pointer;padding:2px 6px;border-radius:4px;background:rgba(255,255,255,.15);user-select:none}
        li.selected{background:#4f84ff}
        #moreOrLess{cursor:pointer;padding:2px 6px;border-radius:4px;background:rgba(255,255,255,.15)}
      </style>
      <div id="eButtonTransSelText">T</div>
      <div id="eDivResult">
        <div id="origTextContainer">
          <div id="eOrigText" contenteditable="true" spellcheck="false" dir="auto"></div>
          <hr>
        </div>
        <div id="eSelTextTrans" dir="auto"></div>
        <ul id="panelActions">
          <li id="listenOriginal" data-i18n-title="btnListen">🔊O</li>
          <li id="listenTranslated" data-i18n-title="btnListen">🔊T</li>
          <li id="copy" data-i18n-title="btncopy">⧉</li>
          <li id="replace" data-i18n-title="btnReplace" hidden>⇆</li>
        </ul>
        <div id="drag">
          <ul id="setTargetLanguage"></ul>
          <div id="moreOrLess">⇵</div>
          <ul id="serviceRow">
            <li id="sGoogle">g</li>
            <li id="sBing">b</li>
            <li id="sYandex">y</li>
            <li id="sDeepL">d</li>
            <li id="sLibre">l</li>
          </ul>
        </div>
      </div>
    `;

    this.buttonElement = this.shadowRoot.getElementById('eButtonTransSelText');
    this.panelElement = this.shadowRoot.getElementById('eDivResult');
    this.originalElement = this.shadowRoot.getElementById('eOrigText');
    this.translatedElement = this.shadowRoot.getElementById('eSelTextTrans');
    this.moreLessElement = this.shadowRoot.getElementById('moreOrLess');
    this.originalContainer = this.shadowRoot.getElementById('origTextContainer');

    const replaceButton = this.shadowRoot.getElementById('replace');
    if (replaceButton) {
      if (
        this.gSelectionInfo &&
        (this.gSelectionInfo.isInputElement || this.gSelectionInfo.isContentEditable)
      ) {
        replaceButton.removeAttribute('hidden');
      } else {
        replaceButton.setAttribute('hidden', '');
      }
    }

    this.buttonElement?.addEventListener('click', () => {
      this.translateSelectionText();
      if (this.buttonElement) {
        this.buttonElement.style.display = 'none';
      }
    });

    this.originalElement?.addEventListener('keypress', (event) => event.stopPropagation());
    this.originalElement?.addEventListener('keydown', (event) => event.stopPropagation());
    this.originalElement?.addEventListener('keyup', (event) => {
      event.stopPropagation();
      if (this.config?.get<string>('translateSelectedWhenPressTwice') !== 'yes') return;

      if (this.isSelectingText()) {
        this.onKeyUp(event);
        return;
      }

      if (event.key === 'Control') {
        const now = performance.now();
        if (this.panelLastCtrlPress && now - this.panelLastCtrlPress < 250) {
          this.replaceTextWithTranslation();
        }
        this.panelLastCtrlPress = now;
      }
    });

    this.originalElement?.addEventListener('input', () => {
      if (this.translateNewInputTimerHandler !== null) {
        clearTimeout(this.translateNewInputTimerHandler);
      }
      this.translateNewInputTimerHandler = window.setTimeout(() => {
        void this.translateNewInput();
      }, 600);
    });

    this.moreLessElement?.addEventListener('click', () => {
      if (!this.config) return;
      if (this.config.get<string>('expandPanelTranslateSelectedText') === 'no') {
        this.config.set('expandPanelTranslateSelectedText', 'yes');
      } else {
        this.config.set('expandPanelTranslateSelectedText', 'no');
      }
      this.setCaretAtEnd();
    });

    this.bindPanelServiceAndLanguageActions();
    this.bindPanelUtilityActions();

    document.body.appendChild(this.divElement);
    this.i18n?.translateDocument(this.shadowRoot);
    this.refreshPanelSelections();
    this.updatePanelExpandState();
  }

  /**
   * 绑定面板内的翻译服务和目标语言切换逻辑。
   */
  private bindPanelServiceAndLanguageActions(): void {
    if (!this.shadowRoot || !this.config) return;

    const serviceButtons: Array<{ id: string; service: string }> = [
      { id: 'sGoogle', service: 'google' },
      { id: 'sBing', service: 'bing' },
      { id: 'sYandex', service: 'yandex' },
      { id: 'sDeepL', service: 'deepl' },
      { id: 'sLibre', service: 'libre' }
    ];

    for (const serviceInfo of serviceButtons) {
      this.shadowRoot.getElementById(serviceInfo.id)?.addEventListener('click', () => {
        if (serviceInfo.service === 'deepl') {
          const confirmed = this.config?.get<string>('deepl_confirmed') === 'yes';
          if (!confirmed) {
            const approved = window.confirm(
              this.i18n?.getMessage('msgSetDeepLAlert') ?? 'Use DeepL?'
            );
            if (!approved) {
              return;
            }
            this.config?.set('deepl_confirmed', 'yes');
          }
        }

        this.currentTextTranslatorService = serviceInfo.service;
        this.config?.set('textTranslatorService', serviceInfo.service);
        this.refreshPanelSelections();
        void this.translateNewInput();
      });
    }

    const targetList = this.shadowRoot.getElementById('setTargetLanguage');
    targetList?.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const value = target.getAttribute('data-value');
      if (!value || !this.lang) return;

      const fixed = this.lang.fixTLanguageCode(value);
      if (!fixed) return;

      this.currentTargetLanguage = fixed;
      this.config?.setTargetLanguageTextTranslation(fixed);
      this.refreshPanelSelections();
      void this.translateNewInput();
    });
  }

  /**
   * 绑定面板内的复制、替换和朗读等辅助操作。
   */
  private bindPanelUtilityActions(): void {
    if (!this.shadowRoot) return;

    this.shadowRoot.getElementById('copy')?.addEventListener('click', () => {
      const text = this.translatedElement?.textContent ?? '';
      void navigator.clipboard.writeText(text).then(() => {
        const copyButton = this.shadowRoot?.getElementById('copy') as HTMLElement | null;
        if (!copyButton) return;
        const old = copyButton.style.backgroundColor;
        copyButton.style.backgroundColor = 'rgba(0,255,0,.4)';
        setTimeout(() => {
          copyButton.style.backgroundColor = old;
        }, 500);
      });
    });

    this.shadowRoot.getElementById('replace')?.addEventListener('click', () => {
      this.replaceTextWithTranslation();
    });

    this.shadowRoot.getElementById('listenOriginal')?.addEventListener('click', async () => {
      const origText = this.originalElement?.textContent ?? '';
      if (!origText.trim()) return;

      let detected = await this.detectTextLanguage(origText);
      if (!detected.isReliable && this.originalTabLanguage !== 'und') {
        detected = { lang: this.originalTabLanguage, isReliable: true };
      }

      this.handleListenClick('original', origText, detected.lang);
    });

    this.shadowRoot.getElementById('listenTranslated')?.addEventListener('click', () => {
      const text = this.translatedElement?.textContent ?? '';
      if (!text.trim()) return;
      this.handleListenClick('translated', text, this.currentTargetLanguage);
    });
  }

  private handleListenClick(type: 'original' | 'translated', text: string, language: string): void {
    if (!this.shadowRoot) return;
    const origButton = this.shadowRoot.getElementById('listenOriginal');
    const transButton = this.shadowRoot.getElementById('listenTranslated');
    const targetButton = type === 'original' ? origButton : transButton;

    const msgListen = this.i18n?.getMessage('btnListen') ?? 'Listen';
    const msgStop = this.i18n?.getMessage('btnStopListening') ?? 'Stop';

    origButton?.classList.remove('selected');
    transButton?.classList.remove('selected');
    origButton?.setAttribute('title', msgStop);
    transButton?.setAttribute('title', msgStop);

    if (this.isPlayingAudio) {
      this.stopAudio();
      targetButton?.classList.remove('selected');
      targetButton?.setAttribute('title', msgListen);
      return;
    }

    targetButton?.classList.add('selected');
    this.playAudio(text, language, () => {
      targetButton?.classList.remove('selected');
      targetButton?.setAttribute('title', msgListen);
    });
  }

  /**
   * 刷新面板内各服务与语言按钮的选中状态。
   */
  private refreshPanelSelections(): void {
    if (!this.shadowRoot || !this.lang) return;

    const targetList = this.shadowRoot.getElementById('setTargetLanguage');
    if (targetList) {
      targetList.innerHTML = '';
      for (const code of this.currentTargetLanguages.slice(0, 3)) {
        const li = document.createElement('li');
        li.setAttribute('data-value', code);
        li.setAttribute('title', this.lang.codeToLanguage(code));
        li.textContent = code;
        if (code === this.currentTargetLanguage) {
          li.classList.add('selected');
        }
        targetList.appendChild(li);
      }
    }

    const mapping: Record<string, string> = {
      google: 'sGoogle',
      bing: 'sBing',
      yandex: 'sYandex',
      deepl: 'sDeepL',
      libre: 'sLibre'
    };

    Object.values(mapping).forEach((id) =>
      this.shadowRoot?.getElementById(id)?.classList.remove('selected')
    );
    const selectedId = mapping[this.currentTextTranslatorService] ?? 'sGoogle';
    this.shadowRoot.getElementById(selectedId)?.classList.add('selected');

    const enabled = this.config?.get<string[]>('enabledServices') ?? [];
    const customServices = this.config?.get<Array<Record<string, unknown>>>('customServices') ?? [];
    this.toggleHidden('sGoogle', enabled.indexOf('google') === -1);
    this.toggleHidden('sBing', enabled.indexOf('bing') === -1);
    this.toggleHidden('sYandex', enabled.indexOf('yandex') === -1);
    this.toggleHidden('sDeepL', enabled.indexOf('deepl') === -1);
    const hasLibre = customServices.some((item) => String(item.name ?? '') === 'libre');
    this.toggleHidden('sLibre', !hasLibre);
  }

  private toggleHidden(id: string, hidden: boolean): void {
    const element = this.shadowRoot?.getElementById(id);
    if (!element) return;
    if (hidden) {
      element.setAttribute('hidden', '');
    } else {
      element.removeAttribute('hidden');
    }
  }

  /**
   * 根据配置决定原文输入区是展开还是折叠。
   */
  private updatePanelExpandState(): void {
    if (!this.originalContainer || !this.moreLessElement) return;

    if (
      this.expandPanel === 'yes' ||
      (this.prevSelectionInfo &&
        (this.prevSelectionInfo.isContentEditable || this.prevSelectionInfo.isInputElement))
    ) {
      this.originalContainer.style.display = 'block';
      this.moreLessElement.setAttribute('title', this.i18n?.getMessage('less') ?? 'Less');
    } else {
      this.originalContainer.style.display = 'none';
      this.moreLessElement.setAttribute('title', this.i18n?.getMessage('more') ?? 'More');
    }
  }

  /**
   * 同步更新面板内容，并根据选区位置重新摆放面板。
   */
  private updatePanel(result: string): void {
    if (
      !this.panelElement ||
      !this.originalElement ||
      !this.translatedElement ||
      !this.prevSelectionInfo ||
      !this.lang
    ) {
      return;
    }

    this.translatedElement.setAttribute(
      'dir',
      this.lang.isRtlLanguage(this.currentTargetLanguage) ? 'rtl' : 'ltr'
    );
    this.translatedElement.textContent = result;

    let top = parseInt(this.panelElement.style.top || '0', 10);
    let left = parseInt(this.panelElement.style.left || '0', 10);

    if (this.panelElement.style.display !== 'block') {
      this.panelElement.style.display = 'block';
      this.panelElement.style.top = '0px';
      this.panelElement.style.left = '0px';
      this.originalElement.textContent = this.prevSelectionInfo.text;
      this.setCaretAtEnd();

      const panelHeight = this.panelElement.offsetHeight;
      top = Math.min(
        window.innerHeight - panelHeight,
        Math.max(0, this.prevSelectionInfo.bottom + 5)
      );

      const panelWidth = this.panelElement.offsetWidth;
      left = Math.min(window.innerWidth - panelWidth, Math.max(0, this.prevSelectionInfo.left));
    }

    this.panelElement.style.top = `${Math.min(window.innerHeight - this.panelElement.offsetHeight, top)}px`;
    this.panelElement.style.left = `${Math.min(window.innerWidth - this.panelElement.offsetWidth, left)}px`;
  }

  private async translateNewInput(): Promise<void> {
    this.fooCount += 1;
    const currentFooCount = this.fooCount;
    this.stopAudio();

    if (!this.originalElement) return;
    const text = this.originalElement.textContent ?? '';

    const result = await this.backgroundTranslateSingleText(
      this.currentTextTranslatorService,
      'auto',
      this.currentTargetLanguage,
      text
    );

    if (currentFooCount !== this.fooCount) {
      return;
    }

    this.updatePanel(result);
  }

  /**
   * 翻译当前选中的文本，并把结果写入结果面板。
   */
  private translateSelectionText(usePreviousSelectionInfo = false): void {
    if (!usePreviousSelectionInfo && this.gSelectionInfo) {
      this.prevSelectionInfo = this.gSelectionInfo;
    } else if (!(usePreviousSelectionInfo && this.prevSelectionInfo)) {
      return;
    }

    if (!this.originalElement || !this.prevSelectionInfo) {
      return;
    }

    this.originalElement.textContent = this.prevSelectionInfo.text;
    void this.translateNewInput();

    const currentFooCount = this.fooCount;
    setTimeout(() => {
      if (currentFooCount !== this.fooCount) return;
      this.updatePanel(this.translatedElement?.textContent ?? '');
      this.fooCount = currentFooCount;
    }, 1000);
  }

  /**
   * 用翻译后的文本替换当前选区内容。
   */
  private replaceTextWithTranslation(): void {
    this.replaceCurrentSelection(this.translatedElement?.textContent ?? '');
  }

  private async replaceSelectionWithHotTranslation(): Promise<void> {
    this.readSelection();
    const selection = this.gSelectionInfo;
    if (!selection?.text) return;
    const parentWithFocus = selection.element.parentNode as
      | (ParentNode & { focus?: () => void })
      | null;
    if (!selection.element.focus && !parentWithFocus?.focus) return;
    if (selection.isInputElement && selection.readOnly) return;

    const translated = await this.backgroundTranslateSingleText(
      this.currentTextTranslatorService,
      'auto',
      this.currentTargetLanguage,
      selection.text
    );

    if (!translated) {
      return;
    }

    this.replaceCurrentSelection(translated);
  }

  /**
   * 真正执行对输入框、可编辑区域或普通选区的文本替换。
   */
  private replaceCurrentSelection(result: string): void {
    const info = this.prevSelectionInfo ?? this.gSelectionInfo;
    if (!info) return;

    this.destroy();
    if (info.element.nodeType === Node.TEXT_NODE) {
      (info.element.parentNode as Node & { focus?: () => void })?.focus?.();
    } else {
      info.element.focus?.();
    }

    document.execCommand('selectAll', false);
    if (info.isInputElement) {
      (info.element as HTMLInputElement | HTMLTextAreaElement).setSelectionRange(
        info.selStart,
        info.selEnd
      );
    } else if (info.isContentEditable && info.range) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(info.range);
    }
    document.execCommand('insertText', false, result);
  }

  private playAudio(text: string, targetLanguage: string, onEnded: () => void): void {
    this.isPlayingAudio = true;
    browser.runtime.sendMessage({ action: 'textToSpeech', text, targetLanguage }, () => {
      checkedLastError();
      this.isPlayingAudio = false;
      onEnded();
    });
  }

  private stopAudio(): void {
    if (!this.isPlayingAudio) return;
    this.isPlayingAudio = false;
    browser.runtime.sendMessage({ action: 'stopAudio' }, checkedLastError);
  }

  /**
   * 销毁划词按钮与结果面板，并恢复全局状态。
   */
  private destroy(): void {
    window.isTranslatingSelected = false;
    this.fooCount += 1;
    this.stopAudio();

    if (this.showButtonTimerHandler !== null) {
      clearTimeout(this.showButtonTimerHandler);
      this.showButtonTimerHandler = null;
    }
    if (this.translateNewInputTimerHandler !== null) {
      clearTimeout(this.translateNewInputTimerHandler);
      this.translateNewInputTimerHandler = null;
    }

    this.divElement?.remove();
    this.divElement = null;
    this.shadowRoot = null;
    this.buttonElement = null;
    this.panelElement = null;
    this.originalElement = null;
    this.translatedElement = null;
    this.moreLessElement = null;
    this.originalContainer = null;
  }

  private async getTabHostName(): Promise<string> {
    return new Promise((resolve) => {
      browser.runtime.sendMessage({ action: 'getTabHostName' }, (result) => {
        checkedLastError();
        resolve(String(result ?? ''));
      });
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
