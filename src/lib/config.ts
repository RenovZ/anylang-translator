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
  AIPrompt
} from './types';

const defaultConfig = {
  installDateTime: null as number | null,
  lastTimeShowingReleaseNotes: null as number | null,
  originalUserAgent: null as string | null,
  uiLanguage: 'default',
  sourceLanguage: null as string | null,
  targetLanguage: null as string | null,

  autoTranslateEnabled: false,
  alwaysAutoTranslatedSites: [
    'twitter.com',
    'x.com',
    'www.reddit.com',
    'www.kadaza.com',
    'en.wikipedia.org',
    '*.medium.com',
    'news.ycombinator.com'
  ] as string[],
  alwaysAutoTranslatedLang: null as string | null,

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
  quickTranslateProvider: structuredClone(bingTranslatorProvider) as Provider,
  contextTranslateProvider: null as Provider | null,
  instantLookupProvider: null as Provider | null,
  intelligentInputProvider: null as Provider | null,
  bilingualSubtitlesProvider: null as Provider | null,
  panoramaReadingProvider: null as Provider | null,
  writingCopilotProvider: null as Provider | null,

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
