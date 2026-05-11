import { writable, type Subscriber } from 'svelte/store';

import logger from './logger';
import { onMessage, sendMessage } from './protocol';
import { translateStateSchema, type TranslateState } from './session';

export function createTranslateStateStore(defaultValue: TranslateState = { enabled: false }) {
  const store = writable<TranslateState>(defaultValue);

  // Load initial value from background
  sendMessage('getPageTranslationActive', undefined)
    .then((enabled) => {
      const parsed = translateStateSchema.safeParse({ enabled });
      if (parsed.success) store.set(parsed.data);
    })
    .catch((error) => {
      logger.error('Error getting initial translation state:', { error });
    });

  // Watch for changes broadcast from background
  const cleanup = onMessage('notifyTranslationStateChanged', (msg) => {
    const parsed = translateStateSchema.safeParse(msg.data);
    if (parsed.success) store.set(parsed.data);
  });

  return {
    subscribe(run: Subscriber<TranslateState>) {
      const unsub = store.subscribe(run);
      return () => {
        unsub();
        cleanup();
      };
    }
  };
}
