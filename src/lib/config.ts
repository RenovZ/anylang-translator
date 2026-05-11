import { get, writable, type Subscriber } from 'svelte/store';
import { storage } from 'wxt/utils/storage';

import { PROMPT_LIST } from '@/preset/prompt';
import { freeProviders, goProviders, zenProviders } from '@/preset/provider';
import { displayStyles, HOTKEYS } from '@/preset/translate';
import {
  configSchema,
  langDetectionModeSchema,
  pageRangeSchema,
  selectionTriggerSchema,
  translateModeSchema,
  type Config
} from '@/types/config';
import { LangCode, langCodeSchema } from '@/types/lang';
import { displayStyleSchema } from '@/types/translate';

import logger from './logger';

const defaultConfig: Config = configSchema.parse({
  installDateTime: null,
  lastTimeShowingReleaseNotes: null,
  originalUserAgent: null,

  uiLangCode: 'default',
  sourceLangCode: undefined,
  targetLangCode: langCodeSchema.parse('en'),

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

  quickTranslate: {
    icon: 'ri:translate',
    provider: structuredClone(freeProviders[0]),
    shortcut: ['Alt', 'Q'],
    autoAppliedSites: [
      'twitter.com',
      'x.com',
      'www.reddit.com',
      'www.kadaza.com',
      'en.wikipedia.org',
      '*.medium.com',
      'news.ycombinator.com'
    ],
    translate: {
      mode: translateModeSchema.parse('bilingual'),
      displayStyle: displayStyleSchema.parse(displayStyles[0]),
      pageRange: pageRangeSchema.parse('main'),
      triggerOnHover: HOTKEYS[0]
    }
  },

  contextTranslate: {
    icon: 'ri:translate-ai',
    provider: null,
    shortcut: ['Alt', 'C']
  },

  instantLookup: {
    icon: 'lucide:book-open-text',
    provider: structuredClone(freeProviders[0]),
    shortcut: ['Alt', 'L'],
    selection: {
      triggerTranslate: selectionTriggerSchema.parse('directly')
    }
  },

  intelligentInput: {
    icon: 'tabler:keyboard',
    provider: null,
    shortcut: ['Alt', 'I']
  },

  bilingualSubtitles: {
    icon: 'tabler:subtitles',
    provider: structuredClone(freeProviders[0]),
    shortcut: []
  },

  panoramaReading: {
    icon: 'tabler:scan-traces',
    provider: null,
    shortcut: []
  },

  writingCopilot: {
    icon: 'tabler:feather-filled',
    provider: null,
    shortcut: []
  },

  customAIPrompts: structuredClone(PROMPT_LIST)
});

class ConfigStore {
  private store = writable<Config>(defaultConfig);
  private initialized = false;
  private storage = storage.defineItem<unknown>('local:config_v1', {
    fallback: defaultConfig
  });

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

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
      throw new Error('Invalid config value');
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
      } else {
        logger.error('Invalid config update:', { error });
        return current;
      }
    });
  }

  async reset(): Promise<void> {
    await this.init();
    this.store.set(defaultConfig);
    await this.storage.removeValue();
  }

  async setDetectedLangCode(langCode: LangCode | 'und'): Promise<void> {
    const config = this.get();
    config.langDetection.langCode = langCode;
    await this.set(config);
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
