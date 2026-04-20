import { browser } from 'wxt/browser';

import { checkedLastError } from '@/lib/error';
import { config } from '@/lib/config';
import { platformInfo } from '@/lib/platform-info';
import { languages } from '@/lib/languages';

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
  'sup',
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

/**
 * 负责“悬停即译”功能：监听鼠标目标、请求单句翻译并展示浮层结果。
 */
export class ShowTranslated {
  private pageLanguageState = 'original';
  private currentTargetLanguage = 'en';
  private currentTranslateProvider = 'google';
  private showBySite = false;
  private showByLang = false;
  private showByDoubleCtrl = false;
  private originalTabLanguage = 'und';
  private tabHostName = '';

  private readonly htmlTagsInlineIgnore = [...htmlTagsInlineIgnoreBase];
  private isPlayingAudio = false;
  private fooCount = 0;
  private lastCtrlPress: number | null = null;

  private divElement: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private currentNodeOverMouse: EventTarget | null = null;
  private timeoutHandler: number | null = null;
  private mousePos = { x: 0, y: 0 };
  private previousNode: Node | null = null;

  private i18n: {
    translateDocument(root: Document | HTMLElement | ShadowRoot): void;
    getMessage(name: string, substitutions?: string | string[]): string;
  } | null = null;

  /**
   * 初始化悬停翻译功能，并根据配置决定何时启用。
   */
  public initialize(
    pageTranslator: {
      onGetOriginalTabLanguage(cb: (language: string) => void): void;
      onPageLanguageStateChange(cb: (state: string) => void): void;
    },
    i18n: {
      translateDocument(root: Document | HTMLElement | ShadowRoot): void;
      getMessage(name: string, substitutions?: string | string[]): string;
    }
  ): void {
    this.i18n = i18n;

    config.onReady(async () => {
      if (platformInfo.isMobile.any) return;

      this.tabHostName = await this.getTabHostName();
      this.currentTargetLanguage = config.get('targetLanguage');
      const service = config.get('translateProvider');
      this.currentTranslateProvider = service;

      this.showBySite = config.get('sitesToTranslateWhenHovering').indexOf(this.tabHostName) !== -1;
      this.showByDoubleCtrl = config.get('translateTextOverMouseWhenPressTwice') === 'yes';

      this.updatePreTagRule(config.get('translateTag_pre'));

      pageTranslator.onGetOriginalTabLanguage((tabLanguage) => {
        this.originalTabLanguage = tabLanguage;
        this.showByLang = config.get('langsToTranslateWhenHovering').indexOf(tabLanguage) !== -1;
        this.updateEventListener();
      });

      pageTranslator.onPageLanguageStateChange((state) => {
        this.pageLanguageState = state;
        this.updateEventListener();
      });

      config.onChanged((name, value) => {
        if (name === 'translateProvider') {
          const next = String(value);
          this.currentTranslateProvider = next;
        } else if (name === 'targetLanguage') {
          this.currentTargetLanguage = String(value);
          this.refreshPanelState();
        } else if (name === 'sitesToTranslateWhenHovering') {
          this.showBySite =
            Array.isArray(value) &&
            value.map((item) => String(item)).indexOf(this.tabHostName) !== -1;
          this.updateEventListener();
        } else if (name === 'langsToTranslateWhenHovering') {
          this.showByLang =
            Array.isArray(value) &&
            value.map((item) => String(item)).indexOf(this.originalTabLanguage) !== -1;
          this.updateEventListener();
        } else if (name === 'translateTextOverMouseWhenPressTwice') {
          this.showByDoubleCtrl = String(value) === 'yes';
          this.updateEventListener();
        } else if (name === 'translateTag_pre') {
          this.updatePreTagRule(String(value));
        }
      });

      window.addEventListener('beforeunload', this.onBeforeUnload);
      this.updateEventListener();
    });
  }

  /**
   * 根据配置决定 `<pre>` 是否应被视为可翻译内容。
   */
  private updatePreTagRule(value: string): void {
    const preIndex = this.htmlTagsInlineIgnore.indexOf('pre');
    if (preIndex !== -1) {
      this.htmlTagsInlineIgnore.splice(preIndex, 1);
    }
    if (value !== 'yes') {
      this.htmlTagsInlineIgnore.push('pre');
    }
  }

  /**
   * 按页面状态和用户设置启用或关闭悬停翻译监听器。
   */
  private updateEventListener(): void {
    const shouldEnable =
      !platformInfo.isMobile.any &&
      this.pageLanguageState !== 'translated' &&
      (this.showBySite || this.showByLang || this.showByDoubleCtrl);

    if (!shouldEnable) {
      window.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('mousemove', this.onMouseMove);
      window.removeEventListener('mousedown', this.onMouseDown);
      document.removeEventListener('keyup', this.onKeyUp);
      document.removeEventListener('blur', this.onDocumentBlurOrHide);
      document.removeEventListener('visibilitychange', this.onDocumentBlurOrHide);
      this.destroy();
      return;
    }

    window.addEventListener('scroll', this.onScroll);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('blur', this.onDocumentBlurOrHide);
    document.addEventListener('visibilitychange', this.onDocumentBlurOrHide);
  }

  private onBeforeUnload = (): void => {
    this.destroy();
  };

  private onScroll = (): void => {
    if (this.timeoutHandler !== null) {
      clearTimeout(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  };

  private onDocumentBlurOrHide = (): void => {
    this.destroy();
  };

  /**
   * 记录鼠标位置，并在命中可翻译节点时延迟触发翻译。
   */
  private onMouseMove = (event: MouseEvent): void => {
    this.mousePos.x = event.clientX;
    this.mousePos.y = event.clientY;

    if (event.target === this.divElement || event.target === this.currentNodeOverMouse) {
      return;
    }

    this.currentNodeOverMouse = event.target;

    if (this.showBySite || this.showByLang) {
      this.destroy();
      if (event.buttons === 0) {
        if (this.timeoutHandler !== null) {
          clearTimeout(this.timeoutHandler);
        }
        this.timeoutHandler = window.setTimeout(() => {
          void this.translateNode(event.target as Node);
        }, 1250);
      }
    }
  };

  private onMouseDown = (event: MouseEvent): void => {
    if (event.target === this.divElement) return;
    if (this.divElement && this.divElement.contains(event.target as Node)) return;
    this.destroy();
  };

  /**
   * 支持双击 Ctrl 直接翻译当前悬停节点。
   */
  private onKeyUp = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.destroy();
      return;
    }

    if (!this.showByDoubleCtrl || event.key !== 'Control') {
      return;
    }

    const now = performance.now();
    if (this.lastCtrlPress && now - this.lastCtrlPress < 280 && !this.isSelectingText()) {
      const hovered = document.querySelectorAll(':hover');
      if (hovered.length > 0) {
        this.destroy();
        void this.translateNode(hovered[hovered.length - 1]);
      }
    }
    this.lastCtrlPress = now;
  };

  private isSelectingText(): boolean {
    const activeEl = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;
    if (
      activeEl &&
      (activeEl.tagName.toLowerCase() === 'textarea' ||
        (activeEl.tagName.toLowerCase() === 'input' && /^(?:text|search)$/i.test(activeEl.type))) &&
      typeof activeEl.selectionStart === 'number'
    ) {
      const selected = activeEl.value.slice(
        activeEl.selectionStart ?? 0,
        activeEl.selectionEnd ?? 0
      );
      return selected.length > 0;
    }

    const selection = window.getSelection();
    return !!selection && selection.type === 'Range' && selection.toString().length > 0;
  }

  /**
   * 排除脚本、样式、公式容器等不应参与翻译的节点。
   */
  private isNoTranslateNode(node: Node): boolean {
    if (!(node instanceof HTMLElement)) {
      return false;
    }
    const nodeName = node.nodeName.toLowerCase();
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

  /**
   * 检查目标节点内部是否包含块级结构，避免整块复杂内容被当成一句话翻译。
   */
  private hasChildBlockNode(node: Node): boolean {
    const walk = (current: Node): boolean => {
      const nodeName = current.nodeName.toLowerCase();
      if (
        htmlTagsInlineText.indexOf(nodeName) === -1 &&
        this.htmlTagsInlineIgnore.indexOf(nodeName) === -1
      ) {
        return true;
      }
      for (const child of Array.from(current.childNodes)) {
        if (walk(child)) {
          return true;
        }
      }
      return false;
    };

    for (const child of Array.from(node.childNodes)) {
      if (walk(child)) {
        return true;
      }
    }
    return false;
  }

  private isValidText(text: string): boolean {
    if (text.length < 2) return false;
    if (/^[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?\s]*$/.test(text)) return false;
    return true;
  }

  /**
   * 翻译当前节点文本，并把结果显示到悬浮面板中。
   */
  private async translateNode(node: Node, usePreviousNode = false): Promise<void> {
    this.fooCount += 1;
    const currentFooCount = this.fooCount;
    this.stopAudio();

    let targetNode: Node | null = node;
    if (usePreviousNode && this.previousNode) {
      targetNode = this.previousNode;
    }
    this.previousNode = targetNode;

    if (!targetNode) return;

    let text = '';
    if (targetNode instanceof HTMLInputElement || targetNode instanceof HTMLTextAreaElement) {
      if (
        targetNode instanceof HTMLInputElement &&
        !/^(?:text|search|button|submit)$/i.test(targetNode.type)
      ) {
        return;
      }
      if (
        targetNode instanceof HTMLInputElement &&
        (targetNode.type === 'button' || targetNode.type === 'submit')
      ) {
        text = targetNode.value || (targetNode.type === 'submit' ? 'Submit Query' : '');
      } else {
        text = targetNode.value || targetNode.placeholder || '';
      }
    } else {
      let current: Node | null = targetNode;
      while (current && current !== document.body) {
        if (current instanceof HTMLElement) {
          if (this.isNoTranslateNode(current)) return;
          const name = current.nodeName.toLowerCase();
          if (
            htmlTagsInlineText.indexOf(name) === -1 &&
            this.htmlTagsInlineIgnore.indexOf(name) === -1
          ) {
            break;
          }
        }
        current = current.parentNode;
      }

      if (!current || !(current instanceof HTMLElement)) return;
      const nodeName = current.nodeName.toLowerCase();
      if (
        htmlTagsInlineText.indexOf(nodeName) === -1 &&
        this.htmlTagsInlineIgnore.indexOf(nodeName) === -1
      ) {
        if (this.hasChildBlockNode(current)) {
          return;
        }
      }

      text = current.innerText;
    }

    if (!text || text.length < 1 || text.length > 1000 || !this.isValidText(text)) {
      return;
    }

    const translated = await this.backgroundTranslateSingleText(
      this.currentTranslateProvider,
      'auto',
      this.currentTargetLanguage,
      text
    ).catch(() => '');

    if (!translated || currentFooCount !== this.fooCount) {
      return;
    }

    if (!usePreviousNode) {
      this.init();
    }

    const translatedNode = this.shadowRoot?.getElementById('eTextTranslated');
    const panel = this.shadowRoot?.getElementById('eDivResult') as HTMLDivElement | null;
    if (!translatedNode || !panel) return;

    if (languages.isRtlLanguage(this.currentTargetLanguage)) {
      translatedNode.setAttribute('dir', 'rtl');
    } else {
      translatedNode.setAttribute('dir', 'ltr');
    }
    translatedNode.textContent = translated;

    if (!usePreviousNode) {
      const top = Math.min(
        window.innerHeight - panel.offsetHeight,
        Math.max(0, this.mousePos.y + 10)
      );
      const left = Math.min(window.innerWidth - panel.offsetWidth, Math.max(0, this.mousePos.x));
      panel.style.top = `${top}px`;
      panel.style.left = `${left}px`;
    }
  }

  /**
   * 创建悬停翻译结果面板。
   */
  private init(): void {
    this.destroy();
    if (window.isTranslatingSelected) return;

    this.divElement = document.createElement('div');
    this.divElement.style.cssText = 'all: initial';
    this.divElement.classList.add('notranslate');
    this.shadowRoot = this.divElement.attachShadow({ mode: 'closed' });
    this.shadowRoot.innerHTML = `
      <style>
        #eDivResult{position:fixed;z-index:2147483647;max-width:380px;min-width:220px;background:#1b1b1b;color:#fff;border-radius:8px;padding:8px;box-shadow:0 8px 24px rgba(0,0,0,.35);font:13px/1.35 sans-serif}
        #eTextTranslated{white-space:pre-wrap;max-height:180px;overflow:auto}
        hr{border:0;border-top:1px solid rgba(255,255,255,.2);margin:6px 0}
        ul{display:flex;gap:6px;padding:0;margin:0;list-style:none;flex-wrap:wrap}
        li{cursor:pointer;padding:2px 6px;border-radius:4px;background:rgba(255,255,255,.14);user-select:none}
        li.selected{background:#4f84ff}
      </style>
      <div id="eDivResult">
        <div id="eTextTranslated" dir="auto"></div>
        <hr>
        <ul id="setTargetLanguage"></ul>
        <ul id="serviceRow">
          <li id="sGoogle" title="Google">g</li>
          <li id="sBing" title="Bing">b</li>
          <li id="listen" data-i18n-title="btnListen">🔊</li>
        </ul>
      </div>
    `;

    this.bindPanelActions();
    document.body.appendChild(this.divElement);
    this.i18n?.translateDocument(this.shadowRoot);
    this.refreshPanelState();
  }

  /**
   * 绑定面板上的语言切换、服务切换和朗读操作。
   */
  private bindPanelActions(): void {
    if (!this.shadowRoot || !this.config) return;

    const serviceButtons: Array<{ id: string; service: string }> = [
      { id: 'sGoogle', service: 'google' },
      { id: 'sBing', service: 'bing' }
    ];

    for (const buttonInfo of serviceButtons) {
      const element = this.shadowRoot.getElementById(buttonInfo.id);
      if (!element) continue;
      element.addEventListener('click', () => {
        this.currentTranslateProvider = buttonInfo.service;
        this.config?.set('translateProvider', buttonInfo.service);
        this.refreshPanelState();
        void this.translateNode(this.previousNode ?? document.body, true);
      });
    }

    const listen = this.shadowRoot.getElementById('listen');
    listen?.addEventListener('click', () => {
      const translated = this.shadowRoot?.getElementById('eTextTranslated')?.textContent ?? '';
      if (!translated.trim()) return;

      const msgListen = this.i18n?.getMessage('btnListen') ?? 'Listen';
      const msgStop = this.i18n?.getMessage('btnStopListening') ?? 'Stop';
      if (this.isPlayingAudio) {
        this.stopAudio();
        listen.classList.remove('selected');
        listen.setAttribute('title', msgListen);
      } else {
        listen.classList.add('selected');
        listen.setAttribute('title', msgStop);
        this.playAudio(translated, this.currentTargetLanguage, () => {
          listen.classList.remove('selected');
          listen.setAttribute('title', msgListen);
        });
      }
    });

    const targetList = this.shadowRoot.getElementById('setTargetLanguage');
    targetList?.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const value = target.getAttribute('data-value');
      if (!value) return;
      const fixed = languages.fixTLanguageCode(value);
      if (!fixed) return;

      this.currentTargetLanguage = fixed;
      config.set('targetLanguage', fixed);
      this.refreshPanelState();
      void this.translateNode(this.previousNode ?? document.body, true);
    });
  }

  /**
   * 根据当前目标语言和翻译服务刷新面板选中态。
   */
  private refreshPanelState(): void {
    if (!this.shadowRoot) return;

    const targetList = this.shadowRoot.getElementById('setTargetLanguage');
    if (targetList) {
      targetList.innerHTML = '';
      const targets = this.currentTargetLanguage.slice(0, 3);
      for (const langCode of targets) {
        const li = document.createElement('li');
        li.setAttribute('data-value', langCode);
        li.setAttribute('title', languages.codeToLanguage(langCode));
        li.textContent = langCode;
        if (langCode === this.currentTargetLanguage) {
          li.classList.add('selected');
        }
        targetList.appendChild(li);
      }
    }

    const map: Record<string, string> = {
      google: 'sGoogle',
      bing: 'sBing'
    };
    Object.values(map).forEach((id) =>
      this.shadowRoot?.getElementById(id)?.classList.remove('selected')
    );
    const selectedId = map[this.currentTranslateProvider];
    if (selectedId) {
      this.shadowRoot.getElementById(selectedId)?.classList.add('selected');
    }
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
   * 销毁悬浮面板，并停止可能仍在播放的语音。
   */
  private destroy(): void {
    this.fooCount += 1;
    this.stopAudio();
    if (this.timeoutHandler !== null) {
      clearTimeout(this.timeoutHandler);
      this.timeoutHandler = null;
    }

    this.divElement?.remove();
    this.divElement = null;
    this.shadowRoot = null;
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
