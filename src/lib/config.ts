import { get, writable, type Subscriber } from 'svelte/store';
import { storage } from 'wxt/utils/storage';

import type { AIPrompt } from '@/types/ai';
import type { FeatureConfig, Provider } from '@/types/provider';
import type {
  SelectionTriggerValue,
  TranslationDisplayStyle,
  TranslationMode
} from '@/types/translate';

import { examplePrompts } from './preset/ai-prompts';
import { translationDisplayStyles } from './preset/general';
import {
  bingTranslatorProvider,
  googleTranslatorProvider,
  goProviders,
  zenProviders
} from './preset/providers';

const defaultConfig = {
  installDateTime: null as number | null,
  lastTimeShowingReleaseNotes: null as number | null,
  originalUserAgent: null as string | null,
  uiLanguage: 'default',
  sourceLanguage: undefined as string | undefined,
  targetLanguage: undefined as string | undefined,

  selectionTriggerTranslate: 'directly' as SelectionTriggerValue,
  selectionTranslateEnabled: false,

  translationMode: 'bilingual' as TranslationMode,

  translationDisplayStyle: translationDisplayStyles[0] as TranslationDisplayStyle,

  customProviders: [
    structuredClone(bingTranslatorProvider),
    structuredClone(googleTranslatorProvider),
    ...structuredClone(goProviders),
    ...structuredClone(zenProviders)
  ] as Provider[],

  quickTranslate: {
    icon: 'ri:translate',
    provider: structuredClone(bingTranslatorProvider),
    shortcut: ['Alt', 'Q'], // Win/Linux: ['Alt', 'Q'], macOS: ['⌥', 'Q']
    autoAppliedSites: [
      'twitter.com',
      'x.com',
      'www.reddit.com',
      'www.kadaza.com',
      'en.wikipedia.org',
      '*.medium.com',
      'news.ycombinator.com'
    ],
    autoAppliedLang: undefined
  } as FeatureConfig,

  contextTranslate: {
    icon: 'ri:translate-ai',
    provider: null as Provider | null,
    shortcut: ['Alt', 'C'] // Win/Linux: ['Alt', 'C'], macOS: ['⌥', 'C']
    // 使用quickTranslate配置的信息
    // autoAppliedSites: undefined,
    // autoAppliedLang: undefined
  } as FeatureConfig,

  instantLookup: {
    icon: 'lucide:book-open-text',
    provider: null as Provider | null,
    shortcut: ['Alt', 'L'] // Win/Linux: ['Alt', 'L'], macOS: ['⌥', 'L']
  } as FeatureConfig,

  intelligentInput: {
    icon: 'tabler:keyboard',
    provider: null as Provider | null,
    shortcut: ['Alt', 'I'] // Win/Linux: ['Alt', 'I'], macOS: ['⌥', 'I']
  } as FeatureConfig,

  bilingualSubtitles: {
    icon: 'tabler:subtitles',
    provider: structuredClone(bingTranslatorProvider) as Provider | null,
    shortcut: [] // Win/Linux: ['Alt', 'S'], macOS: ['⌥', 'S']
  } as FeatureConfig,

  panoramaReading: {
    icon: 'tabler:scan-traces',
    provider: null as Provider | null,
    shortcut: [] // Win/Linux: ['Alt', 'P'], macOS: ['⌥', 'P']
  } as FeatureConfig,

  writingCopilot: {
    icon: 'tabler:feather-filled',
    provider: null as Provider | null,
    shortcut: [] // Win/Linux: ['Alt', 'W'], macOS: ['⌥', 'W']
  } as FeatureConfig,

  customAIPrompts: structuredClone(examplePrompts) as AIPrompt[]
};

export type Config = typeof defaultConfig;

class ConfigStore {
  private store = writable<Config>(defaultConfig);
  private initialized = false;
  private storage = storage.defineItem<Config>('local:config_v1', {
    fallback: defaultConfig
  });

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    const initialValue = await this.storage.getValue();
    this.store.set(initialValue);
    this.storage.watch((newValue) => {
      this.store.set(newValue);
    });
  }

  subscribe(run: Subscriber<Config>): () => void {
    this.init();
    return this.store.subscribe(run);
  }

  get(): Config {
    return get(this.store);
  }

  async set(value: Config): Promise<void> {
    await this.init();
    this.store.set(value);
    await this.storage.setValue(value);
  }

  async update(fn: (value: Config) => Config): Promise<void> {
    await this.init();
    this.store.update((current) => {
      const newValue = fn(current);
      this.storage.setValue(newValue);
      return newValue;
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
   * @param hostname 当前域名，如 "www.medium.com"
   * @param pattern 匹配规则，如 "*.medium.com"
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
