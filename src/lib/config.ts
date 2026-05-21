import { get, writable, type Subscriber } from 'svelte/store';
import { storage } from 'wxt/utils/storage';

import { PROMPT_LIST } from '@/preset/prompt';
import { freeProviders, goProviders, zenProviders } from '@/preset/provider';
import { displayStyles, TRIGGER_HOTKEYS } from '@/preset/translate';
import {
  configSchema,
  langDetectionModeSchema,
  pageRangeSchema,
  translateModeSchema,
  triggerModeOnSelectionSchema,
  triggerOnHoverSchema,
  type Config
} from '@/types/config';
import { LangCode, langCodeSchema } from '@/types/lang';
import { displayStyleSchema } from '@/types/translate';

import logger from './logger';

const env = import.meta.env ?? {};

const defaultConfig: Config = configSchema.parse({
  installDateTime: null,
  lastTimeShowingReleaseNotes: null,
  originalUserAgent: null,

  uiLangCode: 'default',
  sourceLangCode: undefined,
  targetLangCode: env.DEV ? env.VITE_TARGET_LANG_CODE : langCodeSchema.parse('en'),

  langDetection: {
    mode: langDetectionModeSchema.parse('basic'),
    provider: null,
    langCode: langCodeSchema.parse('en')
  },

  providers: [
    ...structuredClone(freeProviders),
    ...structuredClone(goProviders),
    ...structuredClone(zenProviders)
  ],

  adaptiveTranslate: {
    icon: 'ri:translate-ai',
    provider: structuredClone(freeProviders[0]),
    shortcut: ['Alt', 'A'],
    autoTranslatedSites: [
      'twitter.com',
      'x.com',
      'www.reddit.com',
      'www.kadaza.com',
      'en.wikipedia.org',
      '*.medium.com',
      'news.ycombinator.com'
    ],
    autoTranslatedLangs: [],
    translate: {
      mode: translateModeSchema.parse('bilingual'),
      displayStyle: displayStyleSchema.parse(displayStyles[0]),
      pageRange: pageRangeSchema.parse('main'),
      triggerOnHover: triggerOnHoverSchema.parse({
        hotkey: TRIGGER_HOTKEYS[0],
        enabled: true
      })
    }
  },

  instantLookup: {
    icon: 'lucide:book-open-text',
    provider: structuredClone(freeProviders[0]),
    shortcut: ['Alt', 'Q'],
    disabledSites: [],
    disabledLangs: [],
    selection: {
      triggerMode: triggerModeOnSelectionSchema.parse('directly')
    }
  },

  intelligentInput: {
    icon: 'tabler:keyboard',
    provider: null,
    shortcut: ['Alt', 'E'],
    disabledSites: [],
    disabledLangs: []
  },

  bilingualSubtitles: {
    icon: 'tabler:subtitles',
    provider: structuredClone(freeProviders[0]),
    shortcut: [],
    autoEnabledSites: [],
    autoEnabledLangs: []
  },

  panoramaReading: {
    icon: 'tabler:scan-traces',
    provider: null,
    shortcut: [],
    disabledSites: [],
    disabledLangs: []
  },

  writingCopilot: {
    icon: 'tabler:feather-filled',
    provider: null,
    shortcut: ['Alt', 'C'],
    disabledSites: [],
    disabledLangs: []
  },

  customAIPrompts: structuredClone(PROMPT_LIST)
});

class ConfigStore {
  private store = writable<Config>(defaultConfig);
  private initPromise: Promise<void> | null = null;
  private storage = storage.defineItem<unknown>('local:config_v1', {
    fallback: defaultConfig
  });

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this._init();
    return this.initPromise;
  }

  private async _init(): Promise<void> {
    const rawValue = await this.storage.getValue();
    const { success, data, error } = configSchema.safeParse(rawValue);
    if (success) {
      this.store.set(data);
    } else {
      logger.warn('Invalid config data, using default:', { error });
      this.store.set(defaultConfig);
      await this.storage.setValue(defaultConfig);
    }

    this.storage.watch((newValue) => {
      const { success, data, error } = configSchema.safeParse(newValue);
      if (success) {
        this.store.set(data);
      } else {
        logger.warn('Invalid config update, ignoring:', { error });
      }
    });
  }

  subscribe(run: Subscriber<Config>): () => void {
    this.init();
    return this.store.subscribe(run);
  }

  get(): Config {
    this.init();
    return get(this.store);
  }

  async set(value: unknown): Promise<void> {
    await this.init();
    const { success, data, error } = configSchema.safeParse(value);
    if (success) {
      this.store.set(data);
      await this.storage.setValue(data);
    } else {
      logger.error('Invalid config value:', { error });
      // throw new Error('Invalid config value');
    }
  }

  async update(fn: (value: Config) => Config): Promise<void> {
    await this.init();
    this.store.update((current) => {
      const newValue = fn(current);
      const { success, data, error } = configSchema.safeParse(newValue);
      if (success) {
        this.storage.setValue(data);
        return data;
      }

      logger.error('Invalid config update:', { error });
      return current;
    });
  }

  async reset(): Promise<void> {
    await this.init();
    this.store.set(defaultConfig);
    await this.storage.removeValue();
  }

  async setDetectedLangCode(langCode: LangCode | 'und'): Promise<void> {
    await this.init();
    try {
      await this.update((config) => {
        config.langDetection.langCode = langCode;
        return config;
      });
    } catch (error) {
      logger.error('Failed to sync detected lang code from browser', { error });
    }
  }

  isSitesAutoApplied(sites: string[], url: string | URL): boolean {
    const hostname = typeof url === 'string' ? new URL(url).hostname : url.hostname;

    if (!sites || sites.length === 0) return false;

    return sites.some((pattern) => this.matchSitePattern(hostname, pattern));
  }

  /**
   * 检查域名是否匹配规则（支持 * 通配符）
   */
  private matchSitePattern(hostname: string, pattern: string): boolean {
    // 精确匹配
    if (pattern === hostname) return true;

    // 处理通配符 *.example.com
    if (pattern.startsWith('*.')) {
      const suffix = pattern.slice(2); // 去掉 *. 得到 "medium.com"
      // 检查 hostname 是否以 suffix 结尾，且前面有内容
      if (hostname.endsWith(suffix)) {
        const prefix = hostname.slice(0, -suffix.length);
        // prefix 应该以 . 结尾（子域名）或者是空（但这样就和原域名一样了）
        return prefix.endsWith('.') && prefix.length > 1;
      }
    }

    return false;
  }
}

export default new ConfigStore();
