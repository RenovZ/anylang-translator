import { storage } from 'wxt/utils/storage';
import { writable, get, type Subscriber } from 'svelte/store';
import {
  bingTranslatorProvider,
  examplePrompts,
  googleTranslatorProvider,
  goProviders,
  translationDisplayStyles,
  zenProviders
} from './preset';
import type {
  Provider,
  SelectionTriggerValue,
  TranslationMode,
  TranslationDisplayStyle,
  AIPrompt,
  FeatureConfig
} from './types';

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
    autoAppliedEnabled: false,
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
    // autoAppliedEnabled: undefined,
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

const configStorage = storage.defineItem<Config>('local:config_v1', {
  fallback: defaultConfig
});

function createConfigStore() {
  const store = writable<Config>(defaultConfig);
  let initialized = false;

  const initStore = async () => {
    if (initialized) return;
    initialized = true;
    const initialValue = await configStorage.getValue();
    store.set(initialValue);
    configStorage.watch((newValue) => {
      store.set(newValue);
    });
  };

  return {
    subscribe(run: Subscriber<Config>) {
      initStore();
      return store.subscribe(run);
    },
    get() {
      return get(store);
    },
    set: async (value: Config) => {
      await initStore();
      store.set(value);
      await configStorage.setValue(value);
    },
    update: async (fn: (value: Config) => Config) => {
      await initStore();
      store.update((current) => {
        const newValue = fn(current);
        configStorage.setValue(newValue);
        return newValue;
      });
    },
    reset: async () => {
      await initStore();
      store.set(defaultConfig);
      await configStorage.removeValue();
    }
  };
}

const config = createConfigStore();

export default config;
