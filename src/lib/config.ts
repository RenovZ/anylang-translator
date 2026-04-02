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
  | 'targetLanguage'
  | 'targetLanguageTextTranslation'
  | 'targetLanguages'
  | 'alwaysTranslateSites'
  | 'neverTranslateSites'
  | 'sitesToTranslateWhenHovering'
  | 'langsToTranslateWhenHovering'
  | 'alwaysTranslateLangs'
  | 'neverTranslateLangs'
  | 'customDictionary'
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
  targetLanguage: string | null;
  targetLanguageTextTranslation: string | null;
  targetLanguages: string[];
  alwaysTranslateSites: string[];
  neverTranslateSites: string[];
  sitesToTranslateWhenHovering: string[];
  langsToTranslateWhenHovering: string[];
  alwaysTranslateLangs: string[];
  neverTranslateLangs: string[];
  customDictionary: Map<string, string>;
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
  private readonly defaultTargetLanguages = ['en', 'es', 'de'];
  private readonly defaultConfig: DefaultConfig = {
    installDateTime: null,
    lastTimeShowingReleaseNotes: null,
    originalUserAgent: null,
    uiLanguage: 'default',
    pageTranslatorService: 'google',
    textTranslatorService: 'google',
    textToSpeechService: 'google',
    enabledServices: ['google', 'bing', 'yandex', 'deepl'],
    ttsSpeed: 1,
    ttsVolume: 1,
    targetLanguage: null,
    targetLanguageTextTranslation: null,
    targetLanguages: [],
    alwaysTranslateSites: [],
    neverTranslateSites: [],
    sitesToTranslateWhenHovering: [],
    langsToTranslateWhenHovering: [],
    alwaysTranslateLangs: [],
    neverTranslateLangs: [],
    customDictionary: new Map<string, string>(),
    showTranslatePageContextMenu: 'yes',
    showTranslateSelectedContextMenu: 'yes',
    showButtonInTheAddressBar: 'yes',
    showOriginalTextWhenHovering: 'no',
    showTranslateSelectedButton: 'yes',
    whenShowMobilePopup: 'when-necessary',
    darkMode: 'auto',
    popupBlueWhenSiteIsTranslated: 'yes',
    popupPanelSection: 1,
    showReleaseNotes: 'yes',
    dontShowIfIsNotValidText: 'yes',
    dontShowIfPageLangIsTargetLang: 'no',
    dontShowIfPageLangIsUnknown: 'no',
    dontShowIfSelectedTextIsTargetLang: 'no',
    dontShowIfSelectedTextIsUnknown: 'no',
    hotkeys: {},
    expandPanelTranslateSelectedText: 'no',
    translateTag_pre: 'yes',
    enableIframePageTranslation: 'yes',
    dontSortResults: 'no',
    translateDynamicallyCreatedContent: 'yes',
    autoTranslateWhenClickingALink: 'no',
    translateSelectedWhenPressTwice: 'no',
    translateTextOverMouseWhenPressTwice: 'no',
    translateClickingOnce: 'no',
    enableDiskCache: 'no',
    useAlternativeService: 'yes',
    customServices: [],
    showMobilePopupOnDesktop: 'no',
    popupMobileKeepOnScren: 'no',
    popupMobilePosition: 'top',
    addPaddingToPage: 'no',
    proxyServers: {}
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
   * this function is executed when de config is ready
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

    // listen to storage changes
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

    // load config
    browser.i18n.getAcceptLanguages((acceptedLanguages) => {
      browser.storage.local.get(null, (loaded) => {
        // load config; convert object/array to map/set if necessary
        for (const [name, value] of Object.entries(loaded)) {
          if (!this.isConfigKey(name)) {
            console.error('no such config key: ', name);
            continue;
          }
          this.setConfigValue(name, this.fixObjectType(name, value));
        }

        // if there are any targetLanguage undefined, replace them
        if (this.config.targetLanguages.some((tl) => !tl)) {
          this.config.targetLanguages = [...this.defaultTargetLanguages];
          browser.storage.local.set({
            targetLanguages: this.config.targetLanguages
          });
        }

        // Probably at this point it doesn't have 3 target languages.

        // try to get the 3 target languages through the user defined languages in the browser configuration.
        for (const lang of acceptedLanguages) {
          if (this.config.targetLanguages.length >= 3 || !this.lang) break;
          const fixed = this.lang.fixTLanguageCode(lang);
          if (fixed && this.config.targetLanguages.indexOf(fixed) === -1) {
            this.config.targetLanguages.push(fixed);
          }
        }

        // then try to use de array defaultTargetLanguages ["en", "es", "de"]
        for (const lang of this.defaultTargetLanguages) {
          if (this.config.targetLanguages.length >= 3) break;
          if (this.config.targetLanguages.indexOf(lang) === -1) {
            this.config.targetLanguages.push(lang);
          }
        }

        // if targetLanguages is bigger than 3 remove the surplus
        while (this.config.targetLanguages.length > 3) this.config.targetLanguages.pop();

        /*
        // remove the duplicates languages
        config.targetLanguages = [... new Set(config.targetLanguages)]
        //*
        // then try to use de array defaultTargetLanguages ["en", "es", "de"]
        for (const lang of defaultTargetLanguages) {
          if (config.targetLanguages.length >= 3) break;
          if (config.targetLanguages.indexOf(lang) === -1) {
            config.targetLanguages.push(lang);
          }
        }
        //*/

        // if targetLanguage does not exits in targetLanguages, then set it to targetLanguages[0]
        if (
          !this.config.targetLanguage ||
          this.config.targetLanguages.indexOf(this.config.targetLanguage) === -1
        ) {
          this.config.targetLanguage = this.config.targetLanguages[0];
        }

        // if targetLanguageTextTranslation does not exits in targetLanguages, then set it to targetLanguages[0]
        if (
          !this.config.targetLanguageTextTranslation ||
          this.config.targetLanguages.indexOf(this.config.targetLanguageTextTranslation) === -1
        ) {
          this.config.targetLanguageTextTranslation = this.config.targetLanguages[0];
        }

        if (this.lang) {
          // fix targetLanguages
          this.config.targetLanguages = this.config.targetLanguages
            .map((lang) => this.lang!.fixTLanguageCode(lang))
            .filter((lang): lang is string => lang !== undefined);

          // fix neverTranslateLangs
          this.config.neverTranslateLangs = this.config.neverTranslateLangs
            .map((lang) => this.lang!.fixTLanguageCode(lang))
            .filter((lang): lang is string => lang !== undefined);

          // fix alwaysTranslateLangs
          this.config.alwaysTranslateLangs = this.config.alwaysTranslateLangs
            .map((lang) => this.lang!.fixTLanguageCode(lang))
            .filter((lang): lang is string => lang !== undefined);

          // fix targetLanguage
          this.config.targetLanguage = this.lang.fixTLanguageCode(this.config.targetLanguage) ?? '';
          // fix targetLanguageTextTranslation
          this.config.targetLanguageTextTranslation =
            this.lang.fixTLanguageCode(this.config.targetLanguageTextTranslation) ?? '';
        }

        // if targetLanguage does not exits in targetLanguages, then set it to targetLanguages[0]
        if (this.config.targetLanguages.indexOf(this.config.targetLanguage) === -1) {
          this.config.targetLanguage = this.config.targetLanguages[0];
        }
        // if targetLanguageTextTranslation does not exits in targetLanguages, then set it to targetLanguages[0]
        if (this.config.targetLanguages.indexOf(this.config.targetLanguageTextTranslation) === -1) {
          this.config.targetLanguageTextTranslation = this.config.targetLanguages[0];
        }

        // try to save de keyboard shortcuts in the config
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
   * get the value of a config
   */
  get<K extends keyof DefaultConfig>(name: K): DefaultConfig[K] {
    return this.config[name];
  }

  /**
   * set the value of a config
   */
  set<K extends keyof DefaultConfig>(name: K, value: DefaultConfig[K]): void {
    this.config[name] = value;
    browser.storage.local.set({ [name]: this.toObjectOrArrayIfTypeIsMapOrSet(value) });
    this.observers.forEach((callback) => callback(name, value));
  }

  /**
   * export config as JSON string
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
   * import config and reload the extension
   */
  import(configJSON: string): void {
    const incoming = JSON.parse(configJSON) as Record<string, unknown>;

    for (const key of this.configKeys) {
      if (typeof incoming[key] !== 'undefined' && this.isConfigKey(key)) {
        const fixed = this.fixObjectType(key, incoming[key]);
        this.set(key, fixed);
      }
    }

    // TODO: update method did not exists within browser.commands
    // if (typeof browser !== "undefined" && typeof browser.commands !== "undefined") {
    //   Object.entries(this.config.hotkeys).forEach(([name, shortcut]) => {
    //     void browser.commands.update({ name, shortcut });
    //   });
    // }

    browser.runtime.reload();
  }

  /**
   * restore the config to default and reaload the extension
   */
  restoreToDefault(): void {
    // TODO: update method did not exists within browser.commands
    // if (typeof browser !== "undefined" && typeof browser.commands !== "undefined") {
    //   const commands = browser.runtime.getManifest().commands ?? {};
    //   Object.keys(commands).forEach((name) => {
    //     const command = commands[name];
    //     const shortcut = command.suggested_key?.default ?? "";
    //     void browser.commands.update({ name, shortcut });
    //   });
    // }

    this.import(JSON.stringify(this.defaultConfig));
  }

  /**
   * create a listener to run when a config changes
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

  addKeyWordTocustomDictionary(key: string, value: string): void {
    this.addInMap('customDictionary', key, value);
  }

  removeKeyWordFromcustomDictionary(keyWord: string): void {
    this.removeFromMap('customDictionary', keyWord);
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

  setTargetLanguage(lang: string, forTextToo = false): void {
    const targetLanguages = this.get('targetLanguages');
    const fixed = this.lang?.fixTLanguageCode(lang);
    if (!fixed) return;

    if (targetLanguages.indexOf(fixed) === -1 || forTextToo) {
      this.addTargetLanguage(fixed);
    }

    this.set('targetLanguage', fixed);
    if (forTextToo) this.setTargetLanguageTextTranslation(fixed);
  }

  setTargetLanguageTextTranslation(lang: string): void {
    const fixed = this.lang?.fixTLanguageCode(lang);
    if (!fixed) return;
    this.set('targetLanguageTextTranslation', fixed);
  }

  /**
   * Switch between page translation services that are enabled
   */
  swapPageTranslationService(): string {
    const pageServices = ['google', 'bing', 'yandex'];
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

  private addTargetLanguage(lang: string): void {
    const targetLanguages = this.get('targetLanguages');
    const index = targetLanguages.indexOf(lang);
    if (index === -1) {
      targetLanguages.unshift(lang);
      targetLanguages.pop();
    } else {
      targetLanguages.splice(index, 1);
      targetLanguages.unshift(lang);
    }
    this.set('targetLanguages', targetLanguages);
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

  private addInMap<K extends KeysOfType<DefaultConfig, Map<string, string>>>(
    configName: K,
    key: string,
    value: string
  ): void {
    const map = this.get(configName);
    if (typeof map.get(key) === 'undefined') {
      map.set(key, value);
      this.set(configName, map);
    }
  }

  private removeFromMap<K extends KeysOfType<DefaultConfig, Map<string, string>>>(
    configName: K,
    key: string
  ): void {
    const map = this.get(configName);
    if (typeof map.get(key) !== 'undefined') {
      map.delete(key);
      this.set(configName, map);
    }
  }

  /**
   * convert object to map or set if necessary, otherwise return the value itself
   * @example
   * fixObjectType("customDictionary", {})
   * // returns Map
   * fixObjectType("targetLanguages", ["en", "es", "de"])
   * // return ["en", "es", "de"] -- Array
   * @param {string} key
   * @param {*} value
   * @returns {Map | Set | *}
   */
  private fixObjectType<K extends keyof DefaultConfig>(key: K, value: unknown): DefaultConfig[K] {
    if (key === 'customDictionary') {
      if (value instanceof Map) {
        return value as DefaultConfig[K];
      }
      const entries =
        value && typeof value === 'object' ? Object.entries(value as Record<string, string>) : [];
      return new Map<string, string>(entries) as DefaultConfig[K];
    }

    return value as DefaultConfig[K];
  }

  /**
   * convert map and set to object and array respectively, otherwise return the value itself
   */
  private toObjectOrArrayIfTypeIsMapOrSet(value: unknown): unknown {
    if (value instanceof Map) return Object.fromEntries(value);
    if (value instanceof Set) return Array.from(value);
    return value;
  }
}
