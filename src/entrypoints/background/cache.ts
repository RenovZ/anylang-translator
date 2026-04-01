import { browser } from "wxt/browser";

export interface CacheEntry {
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  key: string;
}

class Utils {
  /**
   * Returns the size of a ObjectStorage
   */
  static async stringToSHA1String(message: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Converts a size in bytes to a human-readable string.
   */
  static humanReadableSize(bytes: number): string {
    const thresh = 1024;
    if (Math.abs(bytes) < thresh) return `${bytes} B`;
    const units = ["KB", "MB", "GB", "TB"];
    let u = -1;
    do {
      bytes /= thresh;
      u += 1;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return `${bytes.toFixed(1)} ${units[u]}`;
  }

  /**
   * Returns the size of a database
   */
  static async getDatabaseSize(dbName: string): Promise<number> {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName);
      request.onsuccess = () => resolve(request.result);
      request.onerror = request.onblocked = () => reject(new Error("open failed"));
    });

    const tableNames = Array.from(db.objectStoreNames);
    const sizes = await Promise.all(
      tableNames.map(
        (name) =>
          new Promise<number>((resolve) => {
            let size = 0;
            const cursorReq = db.transaction([name], "readonly").objectStore(name).openCursor();
            cursorReq.onsuccess = () => {
              const cursor = cursorReq.result;
              if (!cursor) {
                resolve(size);
                return;
              }
              size += JSON.stringify(cursor.value).length;
              cursor.continue();
            };
            cursorReq.onerror = () => resolve(size);
          })
      )
    );
    db.close();
    return sizes.reduce((acc, value) => acc + value, 0);
  }
}

class Cache {
  private cache = new Map<string, CacheEntry>();
  private db: IDBDatabase | null = null;
  promiseStartingCache: Promise<boolean> | null = null;

  /**
   * Base class to create a translation cache for different services.
   */
  constructor(
    private readonly translationService: string,
    private readonly sourceLanguage: string,
    private readonly targetLanguage: string
  ) {}

  /**
   * Start the translation cache
   */
  async start(): Promise<boolean> {
    if (this.promiseStartingCache) return this.promiseStartingCache;

    this.promiseStartingCache = Cache.openDataBaseCache(
      this.translationService,
      this.sourceLanguage,
      this.targetLanguage
    )
      .then((db) => {
        this.db = db;
        return true;
      })
      .catch(async () => {
        await Cache.deleteDatabase(this.translationService, this.sourceLanguage, this.targetLanguage);
        return false;
      });

    return this.promiseStartingCache;
  }

  /**
   * Closes the database.
   */
  close(): void {
    this.db?.close();
    this.db = null;
  }

  /**
   * Query translation cache data
   */
  async query(originalText: string): Promise<CacheEntry | undefined> {
    const hash = await Utils.stringToSHA1String(originalText);
    const memoryValue = this.cache.get(hash);
    if (memoryValue) return memoryValue;
    const dbValue = await this.queryInDB(hash);
    if (dbValue) this.cache.set(hash, dbValue);
    return dbValue;
  }

  /**
   * Add to translation cache
   */
  async add(
    originalText: string,
    translatedText: string,
    detectedLanguage = "und"
  ): Promise<boolean> {
    const hash = await Utils.stringToSHA1String(originalText);
    const data: CacheEntry = { originalText, translatedText, detectedLanguage, key: hash };
    return this.addInDb(data);
  }

  /**
   * Queries an entry in the translation cache, through the hash of the source text.
   */
  private async queryInDB(origTextHash: string): Promise<CacheEntry | undefined> {
    if (!this.db) return undefined;
    const db = this.db;
    return new Promise<CacheEntry | undefined>((resolve) => {
      const store = db
        .transaction([Cache.getCacheStorageName()], "readonly")
        .objectStore(Cache.getCacheStorageName());
      const request = store.get(origTextHash);
      request.onsuccess = () => resolve(request.result as CacheEntry | undefined);
      request.onerror = () => resolve(undefined);
    });
  }

  /**
   * Store the data in the database
   */
  private async addInDb(data: CacheEntry): Promise<boolean> {
    if (!this.db) return false;
    const db = this.db;
    return new Promise<boolean>((resolve) => {
      const store = db
        .transaction([Cache.getCacheStorageName()], "readwrite")
        .objectStore(Cache.getCacheStorageName());
      const request = store.put(data);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  /**
   * Returns the name of the database using the given data.
   */
  static getDataBaseName(translationService: string, sourceLanguage: string, targetLanguage: string): string {
    return `${translationService}@${sourceLanguage}.${targetLanguage}`;
  }

  /**
   * Returns the storageName
   */
  static getCacheStorageName(): string {
    return "cache";
  }

  /**
   * Start/create a database with the given data.
   */
  static async openIndexeddb(
    name: string,
    version: number,
    objectStorageNames: string[]
  ): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name, version);
      request.onsuccess = () => resolve(request.result);
      request.onerror = request.onblocked = () => reject(new Error("open failed"));
      request.onupgradeneeded = () => {
        const db = request.result;
        objectStorageNames.forEach((storageName) => {
          if (!db.objectStoreNames.contains(storageName)) {
            db.createObjectStore(storageName, { keyPath: "key" });
          }
        });
      };
    });
  }

  /**
   * Start/create a database for the translation cache with the given data.
   */
  static async openDataBaseCache(
    translationService: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<IDBDatabase> {
    return Cache.openIndexeddb(
      Cache.getDataBaseName(translationService, sourceLanguage, targetLanguage),
      1,
      [Cache.getCacheStorageName()]
    );
  }

  /**
   * Delete a database.
   */
  static async deleteDatabase(
    translationService: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const request = indexedDB.deleteDatabase(
        Cache.getDataBaseName(translationService, sourceLanguage, targetLanguage)
      );
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }
}

class CacheList {
  private list = new Map<string, Cache>();
  private dbCacheList: IDBDatabase | null = null;

  /**
   * Defines a translation cache manager.
   */
  constructor() {
    this.openCacheList();
  }

  /**
   * Get a translation cache from the given data.
   * If the translation cache does not exist, create a new one.
   */
  async getCache(
    translationService: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<Cache> {
    const dbName = Cache.getDataBaseName(translationService, sourceLanguage, targetLanguage);
    const existing = this.list.get(dbName);
    if (existing) {
      await existing.promiseStartingCache;
      return existing;
    }

    const cache = new Cache(translationService, sourceLanguage, targetLanguage);
    this.list.set(dbName, cache);
    this.addCacheList(dbName);
    await cache.start();
    return cache;
  }

  /**
   * Delete all translation caches.
   * And clear the cache list.
   */
  async deleteAll(): Promise<boolean> {
    try {
      const dbNames = await this.getAllDBNames();
      const deletes = dbNames.map((dbName) => CacheList.deleteDatabase(dbName));
      this.list.forEach((cache) => cache.close());
      this.list.clear();
      await Promise.all(deletes);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets the sum of the size of all translation caches.
   */
  async calculateSize(): Promise<string> {
    try {
      const dbNames = await this.getAllDBNames();
      const sizes = await Promise.all(dbNames.map((name) => Utils.getDatabaseSize(name)));
      return Utils.humanReadableSize(sizes.reduce((acc, value) => acc + value, 0));
    } catch {
      return Utils.humanReadableSize(0);
    }
  }

  /**
   * Delete a database by its name.
   */
  static async deleteDatabase(dbName: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const request = indexedDB.deleteDatabase(dbName);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  /**
   * Starts the connection to the database cacheList.
   */
  private openCacheList(): void {
    const request = indexedDB.open("cacheList", 1);
    request.onsuccess = () => {
      this.dbCacheList = request.result;
      this.list.forEach((_, key) => this.addCacheList(key));
    };
    request.onerror = request.onblocked = () => {
      this.dbCacheList = null;
    };
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("cache_list")) {
        request.result.createObjectStore("cache_list", { keyPath: "dbName" });
      }
    };
  }

  /**
   * Stores a new translation cache name to cacheList.
   */
  private addCacheList(dbName: string): void {
    if (!this.dbCacheList) return;
    const store = this.dbCacheList.transaction(["cache_list"], "readwrite").objectStore("cache_list");
    store.put({ dbName });
  }

  /**
   * Get the name of all translation caches.
   */
  private async getAllDBNames(): Promise<string[]> {
    if (!this.dbCacheList) return [];
    const dbCacheList = this.dbCacheList;
    return new Promise<string[]>((resolve) => {
      const store = dbCacheList.transaction(["cache_list"], "readonly").objectStore("cache_list");
      const request = store.getAllKeys();
      request.onsuccess = () => resolve((request.result as string[]) ?? []);
      request.onerror = () => resolve([]);
    });
  }
}

export class TranslationCache {
  private readonly cacheList = new CacheList();
  private promiseCalculatingStorage: Promise<string> | null = null;

  bindRuntimeMessageListener(): void {
    browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      if (!request || typeof request !== "object") return;
      const action = (request as { action?: string }).action;

      if (action === "getCacheSize") {
        if (!this.promiseCalculatingStorage) {
          this.promiseCalculatingStorage = this.cacheList.calculateSize();
        }

        this.promiseCalculatingStorage
          .then((size) => {
            this.promiseCalculatingStorage = null;
            sendResponse(size);
          })
          .catch(() => {
            this.promiseCalculatingStorage = null;
            sendResponse("0B");
          });
        return true;
      }

      if (action === "deleteTranslationCache") {
        void this.deleteTranslationCache(Boolean((request as { reload?: boolean }).reload));
      }

      return;
    });
  }

  /**
   * Get a new translation cache entry.
   */
  async get(
    translationService: string,
    sourceLanguage: string,
    targetLanguage: string,
    originalText: string
  ): Promise<CacheEntry | undefined> {
    const cache = await this.cacheList.getCache(translationService, sourceLanguage, targetLanguage);
    return cache.query(originalText);
  }

  /**
   * Defines a new entry in the translation cache.
   */
  async set(
    translationService: string,
    sourceLanguage: string,
    targetLanguage: string,
    originalText: string,
    translatedText: string,
    detectedLanguage: string
  ): Promise<boolean> {
    const cache = await this.cacheList.getCache(translationService, sourceLanguage, targetLanguage);
    return cache.add(originalText, translatedText, detectedLanguage);
  }

  /**
   * Delete all translation caches.
   * If `reload` is `true` reloads the extension after deleting caches.
   */
  async deleteTranslationCache(reload = false): Promise<void> {
    if (indexedDB?.deleteDatabase) {
      indexedDB.deleteDatabase("googleCache");
      indexedDB.deleteDatabase("yandexCache");
      indexedDB.deleteDatabase("bingCache");
    }
    await this.cacheList.deleteAll();
    if (reload) browser.runtime.reload();
  }
}
