import { storage } from 'wxt/utils/storage';

import {
  bingTranslatorProvider,
  googleTranslatorProvider,
  goProviders,
  translationDisplayStyles,
  zenProviders
} from '../src/lib/preset';
import type {
  AIPrompt,
  Provider,
  SelectionTriggerValue,
  TranslationDisplayStyle,
  TranslationMode
} from '../src/lib/types';

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
    { ...bingTranslatorProvider },
    { ...googleTranslatorProvider },
    ...goProviders,
    ...zenProviders
  ] as Provider[],
  pageTranslationProvider: bingTranslatorProvider as Provider,
  videoSubtitlesTranslationProvider: bingTranslatorProvider as Provider,
  selectionTranslationProvider: bingTranslatorProvider as Provider,
  inputTranslationProvider: bingTranslatorProvider as Provider,
  improveWritingProvider: bingTranslatorProvider as Provider,
  imageTranslationProvider: null as Provider | null,
  textToSpeechProvider: null as Provider | null,

  customAIActions: [] as AIPrompt[]
};

export type Config = typeof defaultConfig;

const configStorage = storage.defineItem<Config>('local:config_v1', {
  fallback: defaultConfig
});

// Global state - use wrapper object to avoid reassignment
const store = $state({
  value: defaultConfig,
  initialized: false
});

// Initialize from storage
async function initConfig() {
  if (store.initialized) return;
  const initialValue = await configStorage.getValue();
  store.value = initialValue;
  store.initialized = true;
}

// Auto-save when state changes (but not during initial load)
$effect(() => {
  const current = store.value; // Track all changes
  if (store.initialized) {
    // Debounce save to avoid excessive writes
    const timeout = setTimeout(() => {
      configStorage.setValue(current);
    }, 100);
    return () => clearTimeout(timeout);
  }
});

// Listen to external changes
configStorage.watch((newValue) => {
  // Only update if different to avoid loops
  if (JSON.stringify(newValue) !== JSON.stringify(store.value)) {
    store.value = newValue;
  }
});

// Initialize immediately
initConfig();

// Store object with methods for convenience
const config = {
  get state() {
    initConfig();
    return store.value;
  },
  get value() {
    initConfig();
    return store.value;
  },
  get() {
    return store.value;
  },
  get initialized() {
    return store.initialized;
  },
  set: async (value: Config) => {
    await initConfig();
    store.value = value;
  },
  update: async (fn: (value: Config) => Config) => {
    await initConfig();
    store.value = fn(store.value);
  },
  reset: async () => {
    await initConfig();
    store.value = defaultConfig;
    await configStorage.removeValue();
  }
};

export default config;
