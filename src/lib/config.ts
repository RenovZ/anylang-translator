import { get, writable, type Subscriber } from 'svelte/store';
import { storage } from 'wxt/utils/storage';

import { PROMPT_LIST } from '@/preset/prompt';
import { freeProviders, goProviders, zenProviders } from '@/preset/provider';
import { displayStyles } from '@/preset/translate';
import { configSchema, type Config } from '@/types/config';

import logger from './logger';

const defaultConfig: Config = configSchema.parse({
  installDateTime: null,
  lastTimeShowingReleaseNotes: null,
  originalUserAgent: null,
  uiLanguage: 'default',
  sourceLanguage: undefined,
  targetLanguage: 'en',

  languageDetection: {
    mode: 'basic',
    provider: null
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
      mode: 'bilingual',
      displayStyle: displayStyles[0],
      pageRange: 'main'
    }
  },

  contextTranslate: {
    icon: 'ri:translate-ai',
    provider: null,
    shortcut: ['Alt', 'C']
  },

  instantLookup: {
    icon: 'lucide:book-open-text',
    provider: null,
    shortcut: ['Alt', 'L'],
    selection: {
      triggerTranslate: 'directly'
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
    const parseResult = configSchema.safeParse(rawValue);

    if (parseResult.success) {
      this.store.set(parseResult.data);
    } else {
      logger.warn('Invalid config data, using default:', { error: parseResult.error });
      this.store.set(defaultConfig);
      await this.storage.setValue(defaultConfig);
    }

    this.storage.watch((newValue) => {
      const parseResult = configSchema.safeParse(newValue);
      if (parseResult.success) {
        this.store.set(parseResult.data);
      } else {
        logger.warn('Invalid config update, ignoring:', { error: parseResult.error });
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
    const parseResult = configSchema.safeParse(value);
    if (parseResult.success) {
      this.store.set(parseResult.data);
      await this.storage.setValue(parseResult.data);
    } else {
      logger.error('Invalid config value:', { error: parseResult.error });
      throw new Error('Invalid config value');
    }
  }

  async update(fn: (value: Config) => Config): Promise<void> {
    await this.init();
    this.store.update((current) => {
      const newValue = fn(current);
      const parseResult = configSchema.safeParse(newValue);
      if (parseResult.success) {
        this.storage.setValue(parseResult.data);
        return parseResult.data;
      } else {
        logger.error('Invalid config update:', { error: parseResult.error });
        return current;
      }
    });
  }

  async reset(): Promise<void> {
    await this.init();
    this.store.set(defaultConfig);
    await this.storage.removeValue();
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
