import { storage } from 'wxt/utils/storage';
import { writable, get, type Subscriber } from 'svelte/store';

export type ApiProvider = {
  type: 'api';
  name: string;
};

export type AiProvider = {
  type: 'ai';
  name: string;
  models: string[];
  model?: string;
  prompt?: string;
};

export type Provider = ApiProvider | AiProvider;

export type SelectionTriggerValue = 'directly' | 'show icons' | null;

const defaultConfig = {
  installDateTime: null as number | null,
  lastTimeShowingReleaseNotes: null as number | null,
  originalUserAgent: null as string | null,
  uiLanguage: 'default',
  translateProvider: { type: 'api', name: 'Google Translator' } as Provider,
  enabledProviders: [
    { type: 'api', name: 'Google Translator' },
    { type: 'api', name: 'Bing Translator' },
    { type: 'ai', name: 'Ollama Local', models: ['qwen3.5-2b', 'llama3.2', 'deepseek-r1:7b'] }
  ] as Provider[],
  customProviders: [] as Provider[],
  sourceLanguage: null as string | null,
  targetLanguage: null as string | null,
  alwaysTranslatedSites: [] as string[],
  dontAutoTranslatedSites: [] as string[],
  autoTranslateEnabled: false,

  selectionTriggerTranslate: 'directly' as SelectionTriggerValue,
  selectionTranslateEnabled: false
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
