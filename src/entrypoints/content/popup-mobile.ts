import { browser } from 'wxt/browser';

import { checkedLastError } from '@/lib/error';

interface ConfigLike {
  onReady(callback?: () => void): Promise<void>;
  get<T>(name: string): T;
  set<T>(name: string, value: T): void;
  onChanged(callback: (name: string, value: unknown) => void): void;
  setTargetLanguage(lang: string, forTextToo?: boolean): void;
  addLangToAlwaysTranslate(lang: string): void;
  addLangToNeverTranslate(lang: string): void;
  addSiteToNeverTranslate(hostname: string): void;
  removeSiteFromNeverTranslate(hostname: string): void;
  removeLangFromAlwaysTranslate(lang: string): void;
  removeLangFromNeverTranslate(lang: string): void;
}

interface RuntimeRequest {
  action?: string;
}

/**
 * 移动端翻译浮层，负责在触屏设备上展示翻译控制面板。
 */
export class PopupMobile {
  private lastInteraction = Date.now();
  private serviceSelectorIsOpen = false;
  private inactivityTimer: number | null = null;
  private paddingTimer: number | null = null;

  private rootElement: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;

  private config: ConfigLike | null = null;
  private i18n: {
    updateUiMessages(lang?: string | null): Promise<void>;
    translateDocument(root: Document | HTMLElement | ShadowRoot): void;
    getMessage(name: string, substitutions?: string | string[]): string;
  } | null = null;
  private lang: {
    isRtlLanguage(code: string): boolean;
    fixUILanguageCode(code: string): string;
    fixTLanguageCode(code: string): string | null;
    codeToLanguage(code: string): string;
    getLanguageList(): Record<string, string>;
  } | null = null;
  private pageTranslator: {
    translatePage(targetLanguage?: string): void;
    restorePage(): void;
    swapTranslationService(newServiceName: string): void;
    onPageLanguageStateChange(cb: (state: string) => void): void;
    onGetOriginalTabLanguage(cb: (lang: string) => void): void;
  } | null = null;

  private tabHostName = '';
  private tabLanguage = 'und';
  private pageLanguageState = 'original';

  /**
   * 初始化移动端面板，并在配置允许时挂载到页面中。
   */
  public async initialize(
    config: ConfigLike,
    i18n: {
      updateUiMessages(lang?: string | null): Promise<void>;
      translateDocument(root: Document | HTMLElement | ShadowRoot): void;
      getMessage(name: string, substitutions?: string | string[]): string;
    },
    lang: {
      isRtlLanguage(code: string): boolean;
      fixUILanguageCode(code: string): string;
      fixTLanguageCode(code: string): string | null;
      codeToLanguage(code: string): string;
      getLanguageList(): Record<string, string>;
    },
    platformInfo: { isMobile: { any: unknown } },
    pageTranslator: {
      translatePage(targetLanguage?: string): void;
      restorePage(): void;
      swapTranslationService(newServiceName: string): void;
      onPageLanguageStateChange(cb: (state: string) => void): void;
      onGetOriginalTabLanguage(cb: (lang: string) => void): void;
    }
  ): Promise<void> {
    await config.onReady();
    if (!platformInfo.isMobile.any && config.get<string>('showMobilePopupOnDesktop') !== 'yes') {
      return;
    }

    this.config = config;
    this.i18n = i18n;
    this.lang = lang;
    this.pageTranslator = pageTranslator;
    this.tabHostName = await this.getTabHostName();

    await i18n.updateUiMessages();
    this.createPopupRoot();
    this.applyDirection();
    this.fillLanguageSelector();
    this.bindUiEvents();
    this.bindExternalEvents();
    this.updateTheme();
    this.updateInterface();

    pageTranslator.onPageLanguageStateChange((state) => {
      this.pageLanguageState = state;
      this.updateInterface();
    });

    pageTranslator.onGetOriginalTabLanguage((languageCode) => {
      const fixed = lang.fixTLanguageCode(languageCode || 'und');
      this.tabLanguage = fixed ?? 'und';
      if (
        config.get<string>('whenShowMobilePopup') !== 'only-when-i-touch' &&
        this.tabLanguage !== 'und' &&
        config.get<string[]>('neverTranslateLangs').indexOf(this.tabLanguage) === -1 &&
        config.get<string[]>('neverTranslateSites').indexOf(this.tabHostName) === -1 &&
        config.get<string>('targetLanguage') !== this.tabLanguage
      ) {
        this.showPopup();
      } else if (config.get<string>('whenShowMobilePopup') === 'always-show') {
        this.showPopup();
      }
      this.updateInterface();
    });
  }

  /**
   * 创建移动端面板的根节点和 Shadow DOM。
   */
  private createPopupRoot(): void {
    this.rootElement = document.createElement('div');
    this.rootElement.style.cssText = 'all: initial';
    this.rootElement.classList.add('notranslate');
    this.shadowRoot = this.rootElement.attachShadow({ mode: 'closed' });

    this.shadowRoot.innerHTML = `
      <style>
        :host,*{box-sizing:border-box;font:13px/1.35 sans-serif}
        main{position:fixed;top:0;left:0;right:0;z-index:2147483647;padding:6px;animation:popup .2s ease-out}
        #popup{background:var(--background-color,#121315);color:var(--primary-text-color,#f4f4f4);border-radius:10px;padding:8px 10px;box-shadow:0 4px 12px var(--shadow-color,rgba(0,0,0,.35));display:flex;align-items:center;gap:8px}
        #question{flex:1}
        button,select{border:0;border-radius:6px;padding:4px 8px;background:#4f84ff;color:#fff}
        #btnTranslate{white-space:nowrap}
        #gear{cursor:pointer;padding:2px 6px;border-radius:6px;background:rgba(255,255,255,.15)}
        #menu-container{display:none;position:relative}
        #menu-bg{position:fixed;inset:0;background:transparent}
        #menu-options{position:absolute;right:0;top:6px;min-width:220px;max-height:62vh;overflow:auto;background:var(--background-color,#121315);color:var(--primary-text-color,#f4f4f4);border-radius:8px;box-shadow:0 4px 14px var(--shadow-color,rgba(0,0,0,.35));padding:6px;display:flex;flex-direction:column;gap:4px}
        .option{display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-radius:6px;cursor:pointer}
        .option:hover{background:var(--hover-color,#3b4350)}
        #from-to{padding:6px 8px;color:var(--secondary-text-color,#b5bac2)}
        #toolbar{display:flex;align-items:center;gap:6px}
        #serviceSelector{max-width:95px}
        #language-selector{width:100%;background:#2a2f38}
        #serviceIcon{font-size:12px;opacity:.85;padding:0 4px}
        #menuLang{padding:4px 8px}
        @keyframes popup {from{opacity:0;transform:translateY(-40px)}to{opacity:1;transform:translateY(0)}}
      </style>
      <main>
        <div id="popup">
          <div id="question"></div>
          <div id="toolbar">
            <span id="serviceIcon">◉</span>
            <select id="serviceSelector">
              <option value="google">Google</option>
              <option value="bing">Bing</option>
              <option value="yandex">Yandex</option>
            </select>
            <button id="btnTranslate"></button>
            <span id="gear">⚙</span>
          </div>
        </div>
        <div id="menu-container">
          <div id="menu-bg"></div>
          <div id="menu-options">
            <div id="from-to"></div>
            <div id="menuLang">
              <select id="language-selector"><optgroup name="targets" label="Recent"></optgroup><optgroup name="all" label="All"></optgroup></select>
            </div>
            <div class="option" data-value="always-translate-from"><span data-role="label"></span><span checkicon></span></div>
            <div class="option" data-value="never-translate-from"><span data-role="label" data-i18n="lblNeverTranslate"></span><span checkicon></span></div>
            <div class="option" data-value="never-translate-this-site"><span data-i18n="lblNeverTranslateThisSite"></span><span checkicon></span></div>
            <div class="option" data-value="show-translate-selected-button"><span data-i18n="lblShowTranslateSelectedButton"></span><span checkicon></span></div>
            <div class="option" data-value="keep-on-screen"><span data-i18n="lblKeepOnScreen"></span><span checkicon></span></div>
            <div class="option" data-value="change-position"><span data-i18n="lblChangePosition"></span><span checkicon></span></div>
            <div class="option" data-value="more-options"><span data-i18n="lblMoreOptions"></span><span>›</span></div>
          </div>
        </div>
      </main>
    `;

    this.i18n?.translateDocument(this.shadowRoot);
  }

  /**
   * 根据界面语言决定面板采用 LTR 还是 RTL 布局。
   */
  private applyDirection(): void {
    if (!this.shadowRoot || !this.config || !this.lang) return;
    const dirIsRtl = this.lang.isRtlLanguage(
      this.config.get<string>('uiLanguage') ||
        this.lang.fixUILanguageCode(browser.i18n.getUILanguage())
    );
    if (dirIsRtl) {
      this.shadowRoot.querySelector('main')?.setAttribute('dir', 'rtl');
    }
  }

  /**
   * 绑定触摸拖动、菜单开关和各类按钮事件。
   */
  private bindUiEvents(): void {
    if (!this.shadowRoot || !this.config || !this.pageTranslator) return;

    const popupElement = this.shadowRoot.getElementById('popup');
    const btnTranslate = this.shadowRoot.getElementById('btnTranslate');
    const serviceSelector = this.shadowRoot.getElementById(
      'serviceSelector'
    ) as HTMLSelectElement | null;
    const gear = this.shadowRoot.getElementById('gear');
    const menuBg = this.shadowRoot.getElementById('menu-bg');
    const menuOptions = this.shadowRoot.getElementById('menu-options');
    const languageSelector = this.shadowRoot.getElementById(
      'language-selector'
    ) as HTMLSelectElement | null;

    popupElement?.addEventListener('touchstart', (event) => {
      if (event.target !== popupElement) return;
      this.lastInteraction = Date.now();
      event.stopImmediatePropagation();
      const start = event.touches[0];
      if (!start) return;

      const startPoint = { x: start.clientX, y: start.clientY };

      const onMove = (moveEvent: TouchEvent): void => {
        this.lastInteraction = Date.now();
        moveEvent.stopImmediatePropagation();
        const offset = moveEvent.touches[0]?.clientX ?? startPoint.x;
        const delta = offset - startPoint.x;
        popupElement.style.transform = `translateX(${delta}px)`;
        if (Math.abs(delta) > window.innerWidth * 0.2) {
          popupElement.removeEventListener('touchmove', onMove);
          popupElement.removeEventListener('touchend', onEnd);
          popupElement.removeEventListener('touchcancel', onEnd);
          popupElement.style.transition = 'transform .3s ease-in-out';
          popupElement.style.transform = delta > 0 ? 'translateX(100%)' : 'translateX(-100%)';
          setTimeout(() => {
            this.hidePopup(true);
            popupElement.style.cssText = '';
          }, 320);
        }
      };

      const onEnd = (endEvent: TouchEvent): void => {
        this.lastInteraction = Date.now();
        endEvent.stopImmediatePropagation();
        popupElement.style.transform = 'translateX(0px)';
      };

      popupElement.addEventListener('touchmove', onMove);
      popupElement.addEventListener('touchend', onEnd);
      popupElement.addEventListener('touchcancel', onEnd);
    });

    btnTranslate?.addEventListener('click', () => {
      this.lastInteraction = Date.now();
      if (this.pageLanguageState === 'original') {
        this.pageTranslator?.translatePage();
      } else {
        this.pageTranslator?.restorePage();
      }
    });

    serviceSelector?.addEventListener('click', () => {
      this.serviceSelectorIsOpen = true;
      this.lastInteraction = Date.now();
      const icon = this.shadowRoot?.getElementById('serviceIcon') as HTMLElement | null;
      if (icon) {
        icon.style.scale = '1.25';
        icon.style.rotate = '180deg';
      }
    });
    serviceSelector?.addEventListener('change', () => {
      this.serviceSelectorIsOpen = false;
      this.lastInteraction = Date.now();
      const service = serviceSelector.value;
      this.config?.set('pageTranslatorService', service);
      this.pageTranslator?.swapTranslationService(service);
      this.updateServiceIcon();
      const icon = this.shadowRoot?.getElementById('serviceIcon') as HTMLElement | null;
      if (icon) {
        icon.style.scale = '';
        icon.style.rotate = '';
      }
    });
    serviceSelector?.addEventListener('blur', () => {
      this.serviceSelectorIsOpen = false;
      this.lastInteraction = Date.now();
      const icon = this.shadowRoot?.getElementById('serviceIcon') as HTMLElement | null;
      if (icon) {
        icon.style.scale = '';
        icon.style.rotate = '';
      }
    });

    gear?.addEventListener('click', () => {
      this.lastInteraction = Date.now();
      this.openMenu();
    });

    menuBg?.addEventListener('click', (event) => {
      this.lastInteraction = Date.now();
      event.stopImmediatePropagation();
      this.closeMenu();
    });

    menuOptions?.addEventListener('click', (event) => {
      this.lastInteraction = Date.now();
      const target = event.target as HTMLElement;
      const option = target.closest('[data-value]') as HTMLElement | null;
      if (!option) return;
      event.stopImmediatePropagation();
      this.onMenuOptionClick(option.dataset.value ?? '');
    });

    languageSelector?.addEventListener('input', () => {
      const target = languageSelector.value;
      if (!target) return;
      this.config?.setTargetLanguage(target, true);
      this.pageTranslator?.translatePage(target);
      this.fillRecentLanguages();
      this.updateInterface();
      this.closeMenu();
    });

    window.addEventListener('touchstart', (event) => {
      if (event.touches.length === 3) {
        if (this.rootElement?.isConnected) {
          this.hidePopup();
        } else {
          setTimeout(() => this.showPopup(), 800);
        }
      }
    });
  }

  private bindExternalEvents(): void {
    this.config?.onChanged((name) => {
      if (name === 'darkMode') {
        this.updateTheme();
      } else if (name === 'pageTranslatorService') {
        this.updateServiceIcon();
      } else if (
        name === 'targetLanguage' ||
        name === 'targetLanguages' ||
        name === 'neverTranslateSites' ||
        name === 'neverTranslateLangs' ||
        name === 'alwaysTranslateLangs' ||
        name === 'showTranslateSelectedButton' ||
        name === 'popupMobileKeepOnScren' ||
        name === 'popupMobilePosition'
      ) {
        this.fillRecentLanguages();
        this.updateInterface();
      }
    });

    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      this.updateTheme();
    });

    browser.runtime.onMessage.addListener((request: RuntimeRequest) => {
      if (request.action === 'showPopupMobile') {
        this.showPopup();
      }
    });
  }

  private openMenu(): void {
    const menuContainer = this.shadowRoot?.getElementById('menu-container') as HTMLElement | null;
    const gear = this.shadowRoot?.getElementById('gear') as HTMLElement | null;
    if (!menuContainer || !gear) return;
    menuContainer.style.display = 'block';
    gear.classList.add('rotate');
  }

  private closeMenu(): void {
    const menuContainer = this.shadowRoot?.getElementById('menu-container') as HTMLElement | null;
    const gear = this.shadowRoot?.getElementById('gear') as HTMLElement | null;
    if (!menuContainer || !gear) return;
    menuContainer.style.display = 'none';
    gear.classList.remove('rotate');
  }

  private updateInterface(): void {
    if (!this.shadowRoot || !this.config || !this.i18n || !this.lang) return;

    const question = this.shadowRoot.getElementById('question');
    const button = this.shadowRoot.getElementById('btnTranslate');
    if (question && button) {
      if (this.pageLanguageState === 'original') {
        question.textContent = this.i18n.getMessage('msgTranslatePage');
        button.textContent = this.i18n.getMessage('btnTranslate');
      } else {
        question.textContent = this.i18n.getMessage('msgPageTranslated');
        button.textContent = this.i18n.getMessage('btnUndoTranslation');
      }
    }

    const targetLanguage = this.config.get<string>('targetLanguage');
    const fixedTab = this.lang.fixTLanguageCode(this.tabLanguage) ?? 'und';
    this.tabLanguage = fixedTab;

    const fromTo = this.shadowRoot.getElementById('from-to');
    if (fromTo) {
      fromTo.textContent = this.i18n.getMessage('msgTranslateFromTo', [
        this.lang.codeToLanguage(this.tabLanguage),
        this.lang.codeToLanguage(targetLanguage)
      ]);
    }

    this.setOptionCheck(
      'show-translate-selected-button',
      this.config.get<string>('showTranslateSelectedButton') === 'yes'
    );
    this.setOptionCheck(
      'never-translate-this-site',
      this.config.get<string[]>('neverTranslateSites').indexOf(this.tabHostName) !== -1
    );
    this.setOptionCheck(
      'always-translate-from',
      this.config.get<string[]>('alwaysTranslateLangs').indexOf(this.tabLanguage) !== -1
    );
    this.setOptionCheck(
      'never-translate-from',
      this.config.get<string[]>('neverTranslateLangs').indexOf(this.tabLanguage) !== -1
    );
    this.setOptionCheck(
      'keep-on-screen',
      this.config.get<string>('popupMobileKeepOnScren') === 'yes'
    );

    const alwaysLabel = this.shadowRoot.querySelector(
      `#menu-options [data-value="always-translate-from"] [data-role="label"]`
    ) as HTMLElement | null;
    if (alwaysLabel) {
      alwaysLabel.textContent = this.i18n.getMessage('lblAlwaysTranslate', [
        this.lang.codeToLanguage(this.tabLanguage)
      ]);
    }

    const alwaysOption = this.shadowRoot.querySelector(
      `.option[data-value="always-translate-from"]`
    ) as HTMLElement | null;
    const neverOption = this.shadowRoot.querySelector(
      `.option[data-value="never-translate-from"]`
    ) as HTMLElement | null;
    if (alwaysOption && neverOption) {
      const visible = this.tabLanguage !== 'und' && this.tabLanguage !== targetLanguage;
      alwaysOption.style.display = visible ? 'flex' : 'none';
      neverOption.style.display = visible ? 'flex' : 'none';
    }

    const serviceSelector = this.shadowRoot.getElementById(
      'serviceSelector'
    ) as HTMLSelectElement | null;
    if (serviceSelector) {
      serviceSelector.value = this.config.get<string>('pageTranslatorService');
    }
    this.updateServiceIcon();
    this.applyPositionStyle();
  }

  private setOptionCheck(dataValue: string, checked: boolean): void {
    const check = this.shadowRoot?.querySelector(
      `#menu-options [data-value="${dataValue}"] [checkicon]`
    ) as HTMLElement | null;
    if (check) {
      check.textContent = checked ? '✔' : '';
    }
  }

  private applyPositionStyle(): void {
    if (!this.shadowRoot || !this.config) return;
    const main = this.shadowRoot.querySelector('main') as HTMLElement | null;
    if (!main) return;

    if (this.config.get<string>('popupMobilePosition') === 'top') {
      main.style.top = '0';
      main.style.bottom = '';
      main.style.display = 'block';
      return;
    }

    main.style.top = '';
    main.style.bottom = '0';
    main.style.display = 'flex';
    main.style.flexDirection = 'column-reverse';
  }

  private updateServiceIcon(): void {
    const service = this.config?.get<string>('pageTranslatorService') ?? 'google';
    const icon = this.shadowRoot?.getElementById('serviceIcon');
    if (!icon) return;
    if (service === 'google') {
      icon.textContent = 'G';
    } else if (service === 'yandex') {
      icon.textContent = 'Y';
    } else if (service === 'bing') {
      icon.textContent = 'B';
    } else {
      icon.textContent = '◉';
    }
  }

  private fillLanguageSelector(): void {
    if (!this.shadowRoot || !this.lang) return;

    const selector = this.shadowRoot.getElementById(
      'language-selector'
    ) as HTMLSelectElement | null;
    if (!selector) return;
    const allGroup = selector.querySelector('optgroup[name="all"]');
    if (!allGroup) return;

    allGroup.innerHTML = '';
    const langs = this.lang.getLanguageList();
    const entries = Object.entries(langs).sort((a, b) => a[1].localeCompare(b[1]));
    entries.forEach(([code, label]) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = label;
      allGroup.appendChild(option);
    });

    this.fillRecentLanguages();
  }

  private fillRecentLanguages(): void {
    if (!this.shadowRoot || !this.config || !this.lang) return;

    const selector = this.shadowRoot.getElementById(
      'language-selector'
    ) as HTMLSelectElement | null;
    if (!selector) return;

    const targetsGroup = selector.querySelector('optgroup[name="targets"]');
    if (!targetsGroup) return;
    targetsGroup.innerHTML = '';

    const langs = this.lang.getLanguageList();
    const targets = this.config.get<string[]>('targetLanguages');
    targets.forEach((code) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = langs[code] ?? code;
      targetsGroup.appendChild(option);
    });
    selector.value = targets[0] ?? selector.value;
  }

  private onMenuOptionClick(action: string): void {
    if (!this.config || !this.pageTranslator || !this.lang) return;
    if (!action || action === 'choose-another-language') {
      return;
    }

    if (action === 'always-translate-from') {
      const tabLang = this.lang.fixTLanguageCode(this.tabLanguage) ?? 'und';
      if (this.config.get<string[]>('alwaysTranslateLangs').indexOf(tabLang) === -1) {
        this.config.addLangToAlwaysTranslate(tabLang);
        this.pageTranslator.translatePage();
      } else {
        this.config.removeLangFromAlwaysTranslate(tabLang);
      }
    } else if (action === 'never-translate-from') {
      const tabLang = this.lang.fixTLanguageCode(this.tabLanguage) ?? 'und';
      if (this.config.get<string[]>('neverTranslateLangs').indexOf(tabLang) === -1) {
        this.config.addLangToNeverTranslate(tabLang);
        this.pageTranslator.restorePage();
      } else {
        this.config.removeLangFromNeverTranslate(tabLang);
      }
    } else if (action === 'never-translate-this-site') {
      if (this.config.get<string[]>('neverTranslateSites').indexOf(this.tabHostName) === -1) {
        this.config.addSiteToNeverTranslate(this.tabHostName);
        this.pageTranslator.restorePage();
      } else {
        this.config.removeSiteFromNeverTranslate(this.tabHostName);
      }
    } else if (action === 'show-translate-selected-button') {
      this.config.set(
        'showTranslateSelectedButton',
        this.config.get<string>('showTranslateSelectedButton') === 'yes' ? 'no' : 'yes'
      );
    } else if (action === 'more-options') {
      const auth = this.generateRandomHash(32);
      browser.runtime.sendMessage({
        action: 'authorizationToOpenOptions',
        authorizationToOpenOptions: auth
      });
      window.open(
        `${browser.runtime.getURL('/options.html')}#!authorizationToOpenOptions=${auth}`,
        'blank'
      );
    } else if (action === 'keep-on-screen') {
      this.config.set(
        'popupMobileKeepOnScren',
        this.config.get<string>('popupMobileKeepOnScren') === 'yes' ? 'no' : 'yes'
      );
    } else if (action === 'change-position') {
      this.config.set(
        'popupMobilePosition',
        this.config.get<string>('popupMobilePosition') === 'top' ? 'bottom' : 'top'
      );
    }

    this.closeMenu();
    this.updateInterface();
  }

  private generateRandomHash(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let out = '';
    for (let i = 0; i < length; i += 1) {
      out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return out;
  }

  private updatePaddingForPopup(): void {
    if (!this.config || !this.shadowRoot || !this.rootElement?.isConnected) return;
    if (this.config.get<string>('addPaddingToPage') !== 'yes') return;

    const popup = this.shadowRoot.getElementById('popup') as HTMLElement | null;
    if (!popup) return;

    const padding = `${popup.clientHeight}px`;
    const scrollTop = document.documentElement.scrollTop;

    document.documentElement.style.height = '';
    document.documentElement.style.paddingTop = '';
    document.documentElement.style.paddingBottom = '';
    document.documentElement.style.height = `${document.documentElement.scrollHeight}px`;

    if (this.config.get<string>('popupMobilePosition') === 'top') {
      document.documentElement.style.paddingTop = padding;
      document.documentElement.style.paddingBottom = '';
    } else {
      document.documentElement.style.paddingTop = '';
      document.documentElement.style.paddingBottom = padding;
    }

    document.documentElement.scrollTop = scrollTop;
  }

  private showPopup(): void {
    if (!this.rootElement || !this.shadowRoot || !this.config) return;

    this.lastInteraction = Date.now();
    if (!this.rootElement.isConnected) {
      document.documentElement.appendChild(this.rootElement);
      this.updatePaddingForPopup();
      this.updateInterface();
    }

    if (this.paddingTimer !== null) {
      clearInterval(this.paddingTimer);
    }
    this.paddingTimer = window.setInterval(() => {
      this.updatePaddingForPopup();
    }, 1000);

    if (this.inactivityTimer !== null) {
      clearInterval(this.inactivityTimer);
    }
    this.inactivityTimer = window.setInterval(() => {
      const menuVisible =
        (this.shadowRoot?.getElementById('menu-container') as HTMLElement | null)?.style.display ===
        'block';
      if (
        Date.now() - this.lastInteraction > 8000 &&
        !menuVisible &&
        !this.serviceSelectorIsOpen &&
        this.config?.get<string>('popupMobileKeepOnScren') === 'no'
      ) {
        this.hidePopup();
      }
    }, 1000);
  }

  private hidePopup(withoutAnimation = false): void {
    if (!this.rootElement || !this.shadowRoot || !this.config) return;

    if (this.inactivityTimer !== null) {
      clearInterval(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    if (this.paddingTimer !== null) {
      clearInterval(this.paddingTimer);
      this.paddingTimer = null;
    }

    if (withoutAnimation) {
      this.rootElement.remove();
    } else if (this.rootElement.isConnected) {
      const main = this.shadowRoot.querySelector('main');
      const animation = main?.animate(
        [
          { transform: 'translateY(0px)', opacity: '1' },
          {
            transform:
              this.config.get<string>('popupMobilePosition') === 'top'
                ? 'translateY(-50px)'
                : 'translateY(50px)',
            opacity: '0'
          }
        ],
        { duration: 200, iterations: 1 }
      );

      animation?.addEventListener('finish', () => {
        this.rootElement?.remove();
      });

      setTimeout(() => {
        this.rootElement?.remove();
      }, 300);

      const menuContainer = this.shadowRoot.getElementById('menu-container') as HTMLElement | null;
      if (menuContainer) {
        menuContainer.style.display = 'none';
      }
    }

    if (this.config.get<string>('addPaddingToPage') === 'yes') {
      document.documentElement.style.height = '';
      document.documentElement.style.paddingTop = '';
      document.documentElement.style.paddingBottom = '';
    }
  }

  private updateTheme(): void {
    if (!this.shadowRoot || !this.config) return;

    let darkMode = false;
    if (this.config.get<string>('darkMode') === 'auto') {
      darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      darkMode = this.config.get<string>('darkMode') === 'yes';
    }

    let lightMode = this.shadowRoot.getElementById('light-mode');
    if (darkMode) {
      if (lightMode) {
        lightMode.remove();
      }
      return;
    }

    if (!lightMode) {
      lightMode = document.createElement('style');
      lightMode.id = 'light-mode';
      lightMode.textContent = `
        * {
          --primary-text-color: rgb(36, 34, 34);
          --secondary-text-color: rgb(68, 67, 67);
          --background-color: rgb(238, 236, 236);
          --shadow-color: rgba(115, 148, 211, .7);
          --hover-color: rgb(67, 78, 95);
        }
      `;
      this.shadowRoot.appendChild(lightMode);
    }
  }

  private async getTabHostName(): Promise<string> {
    return new Promise((resolve) => {
      browser.runtime.sendMessage({ action: 'getTabHostName' }, (result) => {
        checkedLastError();
        resolve(String(result ?? ''));
      });
    });
  }
}
