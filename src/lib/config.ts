import { storage } from 'wxt/utils/storage';
import { writable, get, type Subscriber } from 'svelte/store';
import { translationDisplayStyles } from './preset';

export type FeatureKey =
  | 'pageTranslation'
  | 'videoSubtitles'
  | 'selectionToolbarTranslation'
  | 'inputTranslation'
  | 'imageTranslation'
  | 'improveWriting'
  | 'dictionary'
  | 'customAiAction';

export type AiProviderType = 'go' | 'zen' | 'custom';

export type ProviderConfig = {
  name: string;
  icon?: string;
  company?: string;
  description?: string;
  features?: FeatureKey[];
};

export type FreeProvider = {
  type: 'free';
} & ProviderConfig;

export type PaidProvider = {
  type: AiProviderType;
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  models?: string[];
  prompt?: string;
  temperature?: number;
  providerOptions?: Record<string, unknown>;
} & ProviderConfig;

export type Provider = FreeProvider | PaidProvider;

export type SelectionTriggerValue = 'directly' | 'show icons' | null;
export type TranslationMode = 'bilingual' | 'translation_only';

export type TranslationDisplayStyleCustom = {
  backgroundColor: string;
  color: string;
  fontSize: string;
  fontWeight: number;
  fontFamily: string;
  borderRadius: string;
  padding: string;
};
export type TranslationDisplayStyle = {
  value: string;
  label: string;
  styles: Record<string, string> | TranslationDisplayStyleCustom;
  attributes?: Record<string, string>;
};

const defaultConfig = {
  installDateTime: null as number | null,
  lastTimeShowingReleaseNotes: null as number | null,
  originalUserAgent: null as string | null,
  uiLanguage: 'default',
  sourceLanguage: null as string | null,
  targetLanguage: null as string | null,

  freeProviders: [
    { type: 'free', name: 'Bing Translator', icon: 'bing' },
    { type: 'free', name: 'Google Translator', icon: 'google' }
  ] as Provider[],
  customProviders: [] as Provider[],

  pageTranslationProvider: { type: 'free', name: 'Bing Translator', icon: 'bing' } as Provider,
  videoSubtitlesTranslationProvider: {
    type: 'free',
    name: 'Bing Translator',
    icon: 'bing'
  } as Provider,
  selectionTranslationProvider: { type: 'free', name: 'Bing Translator', icon: 'bing' } as Provider,
  inputTranslationProvider: { type: 'free', name: 'Bing Translator', icon: 'bing' } as Provider,
  improveWritingProvider: { type: 'free', name: 'Bing Translator', icon: 'bing' } as Provider,
  imageTranslationProvider: null as Provider | null,
  textToSpeechProvider: null as Provider | null,

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

  translationDisplayStyle: translationDisplayStyles[0] as TranslationDisplayStyle
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

export const config = createConfigStore();
