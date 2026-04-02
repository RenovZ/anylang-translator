import { browser } from 'wxt/browser';

export interface CacheEntry {
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  key: string;
}

class Utils {
  /**
   * 计算给定文本的 SHA-1 哈希值，用作缓存键。
   */
  static async stringToSHA1String(message: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 将字节大小转换为便于展示的体积字符串。
   */
  static humanReadableSize(bytes: number): string {
    const thresh = 1024;
    if (Math.abs(bytes) < thresh) return `${bytes} B`;
    const units = ['KB', 'MB', 'GB', 'TB'];
    let u = -1;
    do {
      bytes /= thresh;
      u += 1;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return `${bytes.toFixed(1)} ${units[u]}`;
  }

  /**
   * 统计指定数据库的大致占用空间。
   */
  static async getDatabaseSize(dbName: string): Promise<number> {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName);
      request.onsuccess = () => resolve(request.result);
      request.onerror = request.onblocked = () => reject(new Error('open failed'));
    });

    const tableNames = Array.from(db.objectStoreNames);
    const sizes = await Promise.all(
      tableNames.map(
        (name) =>
          new Promise<number>((resolve) => {
            let size = 0;
            const cursorReq = db.transaction([name], 'readonly').objectStore(name).openCursor();
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
   * 单个翻译方向的缓存实例，负责内存与 IndexedDB 的读写。
   */
  constructor(
    private readonly translationService: string,
    private readonly sourceLanguage: string,
    private readonly targetLanguage: string
  ) {}

  /**
   * 初始化当前翻译缓存的数据库连接。
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
        await Cache.deleteDatabase(
          this.translationService,
          this.sourceLanguage,
          this.targetLanguage
        );
        return false;
      });

    return this.promiseStartingCache;
  }

  /**
   * 关闭数据库连接。
   */
  close(): void {
    this.db?.close();
    this.db = null;
  }

  /**
   * 查询翻译缓存。
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
   * 向翻译缓存写入一条记录。
   */
  async add(
    originalText: string,
    translatedText: string,
    detectedLanguage = 'und'
  ): Promise<boolean> {
    const hash = await Utils.stringToSHA1String(originalText);
    const data: CacheEntry = { originalText, translatedText, detectedLanguage, key: hash };
    return this.addInDb(data);
  }

  /**
   * 通过原文哈希值查询缓存条目。
   */
  private async queryInDB(origTextHash: string): Promise<CacheEntry | undefined> {
    if (!this.db) return undefined;
    const db = this.db;
    return new Promise<CacheEntry | undefined>((resolve) => {
      const store = db
        .transaction([Cache.getCacheStorageName()], 'readonly')
        .objectStore(Cache.getCacheStorageName());
      const request = store.get(origTextHash);
      request.onsuccess = () => resolve(request.result as CacheEntry | undefined);
      request.onerror = () => resolve(undefined);
    });
  }

  /**
   * 将缓存数据写入 IndexedDB。
   */
  private async addInDb(data: CacheEntry): Promise<boolean> {
    if (!this.db) return false;
    const db = this.db;
    return new Promise<boolean>((resolve) => {
      const store = db
        .transaction([Cache.getCacheStorageName()], 'readwrite')
        .objectStore(Cache.getCacheStorageName());
      const request = store.put(data);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  /**
   * 根据服务名和语言方向生成数据库名称。
   */
  static getDataBaseName(
    translationService: string,
    sourceLanguage: string,
    targetLanguage: string
  ): string {
    return `${translationService}@${sourceLanguage}.${targetLanguage}`;
  }

  /**
   * 返回缓存对象仓库名称。
   */
  static getCacheStorageName(): string {
    return 'cache';
  }

  /**
   * 打开数据库；如果不存在则按给定结构创建。
   */
  static async openIndexeddb(
    name: string,
    version: number,
    objectStorageNames: string[]
  ): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name, version);
      request.onsuccess = () => resolve(request.result);
      request.onerror = request.onblocked = () => reject(new Error('open failed'));
      request.onupgradeneeded = () => {
        const db = request.result;
        objectStorageNames.forEach((storageName) => {
          if (!db.objectStoreNames.contains(storageName)) {
            db.createObjectStore(storageName, { keyPath: 'key' });
          }
        });
      };
    });
  }

  /**
   * 为指定翻译方向打开或创建缓存数据库。
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
   * 删除指定翻译方向对应的数据库。
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
   * 翻译缓存管理器，负责维护所有方向的缓存实例。
   */
  constructor() {
    this.openCacheList();
  }

  /**
   * 获取指定方向的缓存实例；若不存在则即时创建。
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
   * 删除所有翻译缓存，并清空缓存列表。
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
   * 统计全部翻译缓存的总占用。
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
   * 按数据库名删除缓存库。
   */
  static async deleteDatabase(dbName: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const request = indexedDB.deleteDatabase(dbName);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  /**
   * 连接保存缓存库名称的 `cacheList` 数据库。
   */
  private openCacheList(): void {
    const request = indexedDB.open('cacheList', 1);
    request.onsuccess = () => {
      this.dbCacheList = request.result;
      this.list.forEach((_, key) => this.addCacheList(key));
    };
    request.onerror = request.onblocked = () => {
      this.dbCacheList = null;
    };
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('cache_list')) {
        request.result.createObjectStore('cache_list', { keyPath: 'dbName' });
      }
    };
  }

  /**
   * 将新创建的缓存库名称写入 `cacheList`。
   */
  private addCacheList(dbName: string): void {
    if (!this.dbCacheList) return;
    const store = this.dbCacheList
      .transaction(['cache_list'], 'readwrite')
      .objectStore('cache_list');
    store.put({ dbName });
  }

  /**
   * 读取所有已登记的翻译缓存库名称。
   */
  private async getAllDBNames(): Promise<string[]> {
    if (!this.dbCacheList) return [];
    const dbCacheList = this.dbCacheList;
    return new Promise<string[]>((resolve) => {
      const store = dbCacheList.transaction(['cache_list'], 'readonly').objectStore('cache_list');
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
      if (!request || typeof request !== 'object') return;
      const action = (request as { action?: string }).action;

      if (action === 'getCacheSize') {
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
            sendResponse('0B');
          });
        return true;
      }

      if (action === 'deleteTranslationCache') {
        void this.deleteTranslationCache(Boolean((request as { reload?: boolean }).reload));
      }

      return;
    });
  }

  /**
   * 获取一条翻译缓存记录。
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
   * 写入一条新的翻译缓存记录。
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
   * 删除所有翻译缓存。
   * 当 `reload` 为 `true` 时，会在清理完成后重新加载扩展。
   */
  async deleteTranslationCache(reload = false): Promise<void> {
    if (indexedDB?.deleteDatabase) {
      indexedDB.deleteDatabase('googleCache');
      indexedDB.deleteDatabase('yandexCache');
      indexedDB.deleteDatabase('bingCache');
    }
    await this.cacheList.deleteAll();
    if (reload) browser.runtime.reload();
  }
}
