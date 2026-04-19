import { browser } from 'wxt/browser';

import type { Languages } from './languages';

export type DefaultConfigName =
  | 'installDateTime'
  | 'lastTimeShowingReleaseNotes'
  | 'originalUserAgent'
  | 'uiLanguage'
  | 'pageTranslatorService'
  | 'textTranslatorService'
  | 'textToSpeechService'
  | 'enabledServices'
  | 'ttsSpeed'
  | 'ttsVolume'
  | 'sourceLanguage'
  | 'targetLanguage'
  | 'alwaysTranslateSites'
  | 'neverTranslateSites'
  | 'sitesToTranslateWhenHovering'
  | 'langsToTranslateWhenHovering'
  | 'alwaysTranslateLangs'
  | 'neverTranslateLangs'
  | 'showTranslatePageContextMenu'
  | 'showTranslateSelectedContextMenu'
  | 'showButtonInTheAddressBar'
  | 'showOriginalTextWhenHovering'
  | 'showTranslateSelectedButton'
  | 'whenShowMobilePopup'
  | 'darkMode'
  | 'popupBlueWhenSiteIsTranslated'
  | 'popupPanelSection'
  | 'showReleaseNotes'
  | 'dontShowIfIsNotValidText'
  | 'dontShowIfPageLangIsTargetLang'
  | 'dontShowIfPageLangIsUnknown'
  | 'dontShowIfSelectedTextIsTargetLang'
  | 'dontShowIfSelectedTextIsUnknown'
  | 'hotkeys'
  | 'expandPanelTranslateSelectedText'
  | 'translateTag_pre'
  | 'enableIframePageTranslation'
  | 'dontSortResults'
  | 'translateDynamicallyCreatedContent'
  | 'autoTranslateWhenClickingALink'
  | 'translateSelectedWhenPressTwice'
  | 'translateTextOverMouseWhenPressTwice'
  | 'translateClickingOnce'
  | 'enableDiskCache'
  | 'useAlternativeService'
  | 'customServices'
  | 'showMobilePopupOnDesktop'
  | 'popupMobileKeepOnScren'
  | 'popupMobilePosition'
  | 'addPaddingToPage'
  | 'proxyServers';

export interface DefaultConfig {
  installDateTime: number | null;
  lastTimeShowingReleaseNotes: number | null;
  originalUserAgent: string | null;
  uiLanguage: string;
  pageTranslatorService: string;
  textTranslatorService: string;
  textToSpeechService: string;
  enabledServices: string[];
  ttsSpeed: number;
  ttsVolume: number;
  sourceLanguage: string | null;
  targetLanguage: string | null;
  alwaysTranslateSites: string[];
  neverTranslateSites: string[];
  sitesToTranslateWhenHovering: string[];
  langsToTranslateWhenHovering: string[];
  alwaysTranslateLangs: string[];
  neverTranslateLangs: string[];
  showTranslatePageContextMenu: 'yes' | 'no';
  showTranslateSelectedContextMenu: 'yes' | 'no';
  showButtonInTheAddressBar: 'yes' | 'no';
  showOriginalTextWhenHovering: 'yes' | 'no';
  showTranslateSelectedButton: 'yes' | 'no';
  whenShowMobilePopup: 'when-necessary' | 'only-when-i-touch' | 'always-show';
  darkMode: 'auto' | 'yes' | 'no';
  popupBlueWhenSiteIsTranslated: 'yes' | 'no';
  popupPanelSection: number;
  showReleaseNotes: 'yes' | 'no';
  dontShowIfIsNotValidText: 'yes' | 'no';
  dontShowIfPageLangIsTargetLang: 'yes' | 'no';
  dontShowIfPageLangIsUnknown: 'yes' | 'no';
  dontShowIfSelectedTextIsTargetLang: 'yes' | 'no';
  dontShowIfSelectedTextIsUnknown: 'yes' | 'no';
  hotkeys: Record<string, string>;
  expandPanelTranslateSelectedText: 'yes' | 'no';
  translateTag_pre: 'yes' | 'no';
  enableIframePageTranslation: 'yes' | 'no';
  dontSortResults: 'yes' | 'no';
  translateDynamicallyCreatedContent: 'yes' | 'no';
  autoTranslateWhenClickingALink: 'yes' | 'no';
  translateSelectedWhenPressTwice: 'yes' | 'no';
  translateTextOverMouseWhenPressTwice: 'yes' | 'no';
  translateClickingOnce: 'yes' | 'no';
  enableDiskCache: 'yes' | 'no';
  useAlternativeService: 'yes' | 'no';
  customServices: Array<Record<string, unknown>>;
  showMobilePopupOnDesktop: 'yes' | 'no';
  popupMobileKeepOnScren: 'yes' | 'no';
  popupMobilePosition: 'top' | 'bottom';
  addPaddingToPage: 'yes' | 'no';
  proxyServers: Record<string, unknown>;
}

type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];
type OnReadyObserver = () => void;
type OnChangeObserver = (name: string, value: unknown) => void;

export class Config {
  private readonly observers: OnChangeObserver[] = [];
  private readonly defaultConfig: DefaultConfig = {
    installDateTime: null,
    lastTimeShowingReleaseNotes: null,
    originalUserAgent: null,
    uiLanguage: 'default', // 界面语言，"default" 表示使用浏览器默认语言
    pageTranslatorService: 'google', // 页面翻译服务: google, bing
    textTranslatorService: 'google', // 文本翻译服务: google, bing
    textToSpeechService: 'google', // 文字转语音服务: google, bing
    enabledServices: ['google', 'bing'], // 启用的翻译服务列表
    ttsSpeed: 1, // 语音播放速度 (0.5-2.0)
    ttsVolume: 1, // 语音播放音量 (0-1)
    sourceLanguage: null, // 当前页面翻译的源语言
    targetLanguage: null, // 当前页面翻译的目标语言
    alwaysTranslateSites: [], // 总是翻译的网站列表
    neverTranslateSites: [], // 从不翻译的网站列表
    sitesToTranslateWhenHovering: [], // 鼠标悬停时翻译的网站列表
    langsToTranslateWhenHovering: [], // 鼠标悬停时翻译的语言列表
    alwaysTranslateLangs: [], // 总是翻译的语言列表
    neverTranslateLangs: [], // 从不翻译的语言列表
    showTranslatePageContextMenu: 'yes', // 是否在右键菜单显示"翻译页面"选项
    showTranslateSelectedContextMenu: 'yes', // 是否在右键菜单显示"翻译选中文本"选项
    showButtonInTheAddressBar: 'yes', // 是否在地址栏显示翻译按钮
    showOriginalTextWhenHovering: 'no', // 鼠标悬停时是否显示原文
    showTranslateSelectedButton: 'yes', // 是否显示选中文本翻译按钮
    whenShowMobilePopup: 'when-necessary', // 移动端弹出框显示时机: when-necessary/only-when-i-touch/always-show
    darkMode: 'auto', // 暗色模式: auto/yes/no
    popupBlueWhenSiteIsTranslated: 'yes', // 网站已翻译时弹出框是否变蓝
    popupPanelSection: 1, // 弹出框面板区域编号
    showReleaseNotes: 'yes', // 是否显示更新日志
    dontShowIfIsNotValidText: 'yes', // 无有效文本时不显示翻译
    dontShowIfPageLangIsTargetLang: 'no', // 页面语言等于目标语言时不显示翻译
    dontShowIfPageLangIsUnknown: 'no', // 页面语言未知时不显示翻译
    dontShowIfSelectedTextIsTargetLang: 'no', // 选中文本语言等于目标语言时不显示翻译
    dontShowIfSelectedTextIsUnknown: 'no', // 选中文本语言未知时不显示翻译
    hotkeys: {}, // 快捷键配置，从manifest文件获取
    expandPanelTranslateSelectedText: 'no', // 翻译选中文本时是否展开面板
    translateTag_pre: 'yes', // 是否翻译<pre>标签内容
    enableIframePageTranslation: 'yes', // 是否启用iframe页面翻译
    dontSortResults: 'no', // 是否不对翻译结果排序
    translateDynamicallyCreatedContent: 'yes', // 是否翻译动态创建的内容
    autoTranslateWhenClickingALink: 'no', // 点击链接时是否自动翻译
    translateSelectedWhenPressTwice: 'no', // 连续按两次时翻译选中文本
    translateTextOverMouseWhenPressTwice: 'no', // 连续按两次时翻译鼠标悬停文本
    translateClickingOnce: 'no', // 单击一次时翻译
    enableDiskCache: 'no', // 是否启用磁盘缓存
    useAlternativeService: 'yes', // 是否使用备用服务
    customServices: [], // 自定义服务列表
    showMobilePopupOnDesktop: 'no', // 桌面端是否显示移动端弹出框
    popupMobileKeepOnScren: 'no', // 移动端弹出框是否保持在屏幕上
    popupMobilePosition: 'top', // 移动端弹出框位置: top/bottom
    addPaddingToPage: 'no', // 是否为页面添加边距
    proxyServers: {} // 代理服务器配置
  };
  private readonly configKeys = Object.keys(this.defaultConfig) as Array<keyof DefaultConfig>;

  private config: DefaultConfig = structuredClone(this.defaultConfig);
  private onReadyObservers: OnReadyObserver[] = [];
  private configIsReady = false;
  private onReadyResolve: (() => void) | null = null;
  private readonly onReadyPromise = new Promise<void>((resolve) => {
    this.onReadyResolve = resolve;
  });
  private lang: Languages | null = null;

  /**
   * 配置完成初始化后，统一触发 onReady 队列。
   */
  private readyConfig() {
    this.configIsReady = true;
    this.onReadyObservers.forEach((callback) => callback());
    this.onReadyObservers = [];
    this.onReadyResolve?.();
  }

  private isConfigKey(key: string): key is keyof DefaultConfig {
    return Object.prototype.hasOwnProperty.call(this.defaultConfig, key);
  }

  private setConfigValue<K extends keyof DefaultConfig>(key: K, value: DefaultConfig[K]): void {
    this.config[key] = value;
  }

  constructor(lang: Languages) {
    this.lang = lang;

    // 监听本地存储变化，并同步更新内存中的配置值。
    browser.storage.onChanged.addListener((changes, areaName) => {
      this.onReady(() => {
        if (areaName !== 'local') return;
        for (const [name, change] of Object.entries(changes)) {
          if (!this.isConfigKey(name)) continue;
          const newValue = this.fixObjectType(name, change.newValue);
          if (this.config[name] !== newValue) {
            this.setConfigValue(name, newValue);
            this.observers.forEach((callback) => callback(name, newValue));
          }
        }
      });
    });

    // 从本地存储加载配置。
    browser.i18n.getAcceptLanguages((acceptedLanguages) => {
      browser.storage.local.get(null, (loaded) => {
        // 加载配置时，顺便把持久化后的对象结构还原成运行时需要的类型。
        for (const [name, value] of Object.entries(loaded)) {
          if (!this.isConfigKey(name)) {
            console.error('no such config key: ', name);
            continue;
          }
          this.setConfigValue(name, this.fixObjectType(name, value));
        }

        if (this.lang) {
          // 规范化“永不翻译语言”列表。
          this.config.neverTranslateLangs = this.config.neverTranslateLangs
            .map((lang) => this.lang!.fixTLanguageCode(lang))
            .filter((lang): lang is string => lang !== undefined);

          // 规范化“始终翻译语言”列表。
          this.config.alwaysTranslateLangs = this.config.alwaysTranslateLangs
            .map((lang) => this.lang!.fixTLanguageCode(lang))
            .filter((lang): lang is string => lang !== undefined);

          // 规范化页面翻译目标语言。
          this.config.targetLanguage =
            this.lang.fixTLanguageCode(this.config.targetLanguage ?? '') ?? '';
        }

        // 读取当前快捷键配置并同步到扩展设置中。
        if (browser.commands.getAll && this.lang) {
          browser.commands.getAll((results) => {
            try {
              results.forEach((result) => {
                if (result.name) {
                  this.config.hotkeys[result.name] = result.shortcut ?? '';
                }
              });
              this.set('hotkeys', this.config.hotkeys);
            } catch (e) {
              console.error('set hotkeys failed:', e);
            } finally {
              this.readyConfig();
            }
          });
        } else {
          this.readyConfig();
        }
      });
    });
  }

  onReady(callback: (() => void) | null = null): Promise<void> {
    if (callback) {
      if (this.configIsReady) callback();
      else this.onReadyObservers.push(callback);
    }
    return this.onReadyPromise;
  }

  /**
   * 读取指定配置项的当前值。
   */
  get<K extends keyof DefaultConfig>(name: K): DefaultConfig[K] {
    return this.config[name];
  }

  /**
   * 更新指定配置项，并立即写回本地存储。
   */
  set<K extends keyof DefaultConfig>(name: K, value: DefaultConfig[K]): void {
    this.config[name] = value;
    browser.storage.local.set({ [name]: this.toObjectOrArrayIfTypeIsMapOrSet(value) });
    this.observers.forEach((callback) => callback(name, value));
  }

  /**
   * 将当前配置导出为 JSON 字符串。
   */
  export(): string {
    const dump: Record<string, unknown> = {
      timeStamp: Date.now(),
      version: browser.runtime.getManifest().version
    };

    for (const key of this.configKeys) {
      dump[key] = this.toObjectOrArrayIfTypeIsMapOrSet(this.get(key));
    }

    return JSON.stringify(dump, null, 4);
  }

  /**
   * 导入外部配置，并在完成后重新加载扩展。
   */
  import(configJSON: string): void {
    const incoming = JSON.parse(configJSON) as Record<string, unknown>;

    for (const key of this.configKeys) {
      if (typeof incoming[key] !== 'undefined' && this.isConfigKey(key)) {
        const fixed = this.fixObjectType(key, incoming[key]);
        this.set(key, fixed);
      }
    }

    // TODO: 某些浏览器环境仍不支持 browser.commands.update。

    browser.runtime.reload();
  }

  /**
   * 恢复默认配置，并重新加载扩展。
   */
  restoreToDefault(): void {
    // TODO: 某些浏览器环境仍不支持 browser.commands.update。

    this.import(JSON.stringify(this.defaultConfig));
  }

  /**
   * 注册配置变更监听器。
   */
  onChanged(callback: OnChangeObserver): void {
    this.observers.push(callback);
  }

  addSiteToTranslateWhenHovering(hostname: string): void {
    this.addInArray('sitesToTranslateWhenHovering', hostname);
  }

  removeSiteFromTranslateWhenHovering(hostname: string): void {
    this.removeFromArray('sitesToTranslateWhenHovering', hostname);
  }

  addLangToTranslateWhenHovering(lang: string): void {
    this.addInArray('langsToTranslateWhenHovering', lang);
  }

  removeLangFromTranslateWhenHovering(lang: string): void {
    this.removeFromArray('langsToTranslateWhenHovering', lang);
  }

  addSiteToAlwaysTranslate(hostname: string): void {
    this.addInArray('alwaysTranslateSites', hostname);
    this.removeFromArray('neverTranslateSites', hostname);
  }

  removeSiteFromAlwaysTranslate(hostname: string): void {
    this.removeFromArray('alwaysTranslateSites', hostname);
  }

  addSiteToNeverTranslate(hostname: string): void {
    this.addInArray('neverTranslateSites', hostname);
    this.removeFromArray('alwaysTranslateSites', hostname);
    this.removeFromArray('sitesToTranslateWhenHovering', hostname);
  }

  removeSiteFromNeverTranslate(hostname: string): void {
    this.removeFromArray('neverTranslateSites', hostname);
  }

  addLangToAlwaysTranslate(lang: string, hostname?: string): void {
    this.addInArray('alwaysTranslateLangs', lang);
    this.removeFromArray('neverTranslateLangs', lang);
    if (hostname) this.removeFromArray('neverTranslateSites', hostname);
  }

  removeLangFromAlwaysTranslate(lang: string): void {
    this.removeFromArray('alwaysTranslateLangs', lang);
  }

  addLangToNeverTranslate(lang: string, hostname?: string): void {
    this.addInArray('neverTranslateLangs', lang);
    this.removeFromArray('alwaysTranslateLangs', lang);
    this.removeFromArray('langsToTranslateWhenHovering', lang);
    if (hostname) this.removeFromArray('alwaysTranslateSites', hostname);
  }

  removeLangFromNeverTranslate(lang: string): void {
    this.removeFromArray('neverTranslateLangs', lang);
  }

  setTargetLanguage(lang: string): void {
    const fixed = this.lang?.fixTLanguageCode(lang);
    if (!fixed) return;

    this.set('targetLanguage', fixed);
  }

  /**
   * 在当前已启用的整页翻译服务之间轮换。
   */
  swapPageTranslationService(): string {
    const pageServices = ['google', 'bing'];
    const enabled = this.get('enabledServices').filter((name) => pageServices.includes(name));
    const current = this.get('pageTranslatorService');
    const index = enabled.indexOf(current);

    if (index !== -1) {
      if (enabled[index + 1]) this.set('pageTranslatorService', enabled[index + 1]);
      else this.set('pageTranslatorService', enabled[0]);
    } else {
      this.set('pageTranslatorService', enabled[0]);
    }

    return this.get('pageTranslatorService');
  }

  private addInArray<K extends KeysOfType<DefaultConfig, string[]>>(
    configName: K,
    value: string
  ): void {
    const arr = this.get(configName);
    if (!arr.includes(value)) {
      this.set(configName, [...arr, value]);
    }
  }

  private removeFromArray<K extends KeysOfType<DefaultConfig, string[]>>(
    configName: K,
    value: string
  ): void {
    const arr = this.get(configName);
    const index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
      this.set(configName, arr);
    }
  }

  /**
   * 必要时把持久化后的对象还原成运行时所需的 `Map` / `Set` 类型；
   * 其他值则保持原样返回。
   */
  private fixObjectType<K extends keyof DefaultConfig>(key: K, value: unknown): DefaultConfig[K] {
    return value as DefaultConfig[K];
  }

  /**
   * 持久化前把 `Map` / `Set` 转成可序列化的对象或数组。
   */
  private toObjectOrArrayIfTypeIsMapOrSet(value: unknown): unknown {
    if (value instanceof Map) return Object.fromEntries(value);
    if (value instanceof Set) return Array.from(value);
    return value;
  }
}
