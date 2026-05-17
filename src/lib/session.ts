import { get, writable, type Subscriber, type Writable } from 'svelte/store';
import { browser } from 'wxt/browser';
import { storage, type WxtStorageItem } from 'wxt/utils/storage';
import z from 'zod';

import logger from './logger';

export const translateStateSchema = z.object({
  enabled: z.boolean()
});
export type TranslateState = z.infer<typeof translateStateSchema>;

export class SessionStore<T> {
  private initialized = false;
  readonly key: string;
  private schema: z.ZodType<T>;
  private initialValue: T;
  private stores = new Map<number, Writable<T>>();
  private storages = new Map<number, WxtStorageItem<T, Record<string, unknown>>>();

  private getStorageKey(tabId: number): `session:${string}:${number}` {
    return `session:${this.key}:${tabId}` as const;
  }

  constructor(key: string, schema: z.ZodType<T>, defaultValue: T) {
    this.key = key;
    this.schema = schema;
    this.initialValue = defaultValue;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    if (browser.tabs) {
      browser.tabs.onRemoved.addListener((tabId: number) => {
        void this.remove(tabId);
      });
    } else {
      logger.warn('tabs API is not available');
    }

    if (browser.webNavigation) {
      // Clear translation state when navigating to a new page in the same tab
      browser.webNavigation.onCommitted.addListener(
        (details: { frameId: number; tabId: number }) => {
          // Only handle main frame navigations, not iframes
          if (details.frameId !== 0) return;
          void this.remove(details.tabId);
        }
      );
    } else {
      logger.warn('webNavigation API is not available');
    }
  }

  private getStore(tabId: number): Writable<T> {
    if (!this.stores.has(tabId)) {
      this.stores.set(tabId, writable(this.initialValue));
    }
    return this.stores.get(tabId)!;
  }

  private getStorage(tabId: number): WxtStorageItem<T, Record<string, unknown>> {
    if (!this.storages.has(tabId)) {
      const item = storage.defineItem<T>(this.getStorageKey(tabId), {
        fallback: this.initialValue
      });
      this.storages.set(tabId, item);

      item.watch((newValue) => {
        const { success, data, error } = this.schema.safeParse(newValue);
        if (success) {
          this.getStore(tabId).set(data);
        } else {
          logger.warn(`Invalid session update for ${this.key}`, { error });
        }
      });
    }
    return this.storages.get(tabId)!;
  }

  subscribe(tabId: number, run: Subscriber<T>): () => void {
    void this.init();
    this.getStorage(tabId)
      .getValue()
      .then((value) => {
        const { success, data } = this.schema.safeParse(value);
        if (success) this.getStore(tabId).set(data);
      });

    return this.getStore(tabId).subscribe(run);
  }

  get(tabId: number): T {
    return get(this.getStore(tabId));
  }

  async set(tabId: number, value: T): Promise<void> {
    await this.init();

    const { success, data, error } = this.schema.safeParse(value);
    if (!success) {
      logger.error(`Invalid session value for ${this.key}:`, { error });
      throw new Error(`Invalid session value for ${this.key}`);
    }

    this.getStore(tabId).set(data);
    await this.getStorage(tabId).setValue(data);
  }

  async update(tabId: number, fn: (value: T) => T): Promise<void> {
    await this.init();
    this.getStore(tabId).update((current) => {
      const newValue = fn(current);
      const { success, data, error } = this.schema.safeParse(newValue);
      if (success) {
        this.getStorage(tabId).setValue(data);
        return data;
      }

      logger.error(`Invalid session update for ${this.key}`, { tabId, error });
      return current;
    });
  }

  async remove(tabId: number): Promise<void> {
    this.stores.delete(tabId);
    await this.getStorage(tabId).removeValue();
    this.storages.delete(tabId);
  }
}

export const adaptiveTranslateSession = new SessionStore<TranslateState>(
  'adaptive-translate-state',
  translateStateSchema,
  { enabled: false }
);
