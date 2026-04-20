import { browser } from 'wxt/browser';

import { config } from '@/lib/config';
import { languages } from '@/lib/languages';
import type { TranslationCache } from './cache';

type TranslationStatus = 'complete' | 'translating' | 'error';

interface CacheLike {
  get(
    translationService: string,
    sourceLanguage: string,
    targetLanguage: string,
    originalText: string
  ): Promise<{ translatedText: string; detectedLanguage: string } | undefined>;
  set(
    translationService: string,
    sourceLanguage: string,
    targetLanguage: string,
    originalText: string,
    translatedText: string,
    detectedLanguage: string
  ): Promise<boolean>;
}

interface TranslationInfo {
  originalText: string;
  translatedText: string | null;
  detectedLanguage: string | null;
  status: TranslationStatus;
  waitTranslate: Promise<void>;
  resolveWait: () => void;
}

interface ServiceSingleResult {
  text: string;
  detectedLanguage: string | null;
}

type RequestTransformer = (sourceArray: string[]) => string;
type ResponseParser = (response: unknown) => ServiceSingleResult[];
type ResponseTransformer = (result: string, dontSortResults: boolean) => string[];
type ExtraParameters = (
  sourceLanguage: string,
  targetLanguage: string,
  requests: TranslationInfo[]
) => string;
type RequestBody = (
  sourceLanguage: string,
  targetLanguage: string,
  requests: TranslationInfo[]
) => string | undefined;
type ExtraHeaders = () => Array<{ name: string; value: string }>;

class Utils {
  /**
   * 将 `& < > " '` 转义为 `&amp; &lt; &gt; &quot; &#39;`。
   *
   * 注意：必应翻译会利用特定 HTML 标记实现自定义词典，
   * 因此这里需要暂时保留这些标记，避免被统一转义。
   * 这些占位符本身没有语义，只用于保证不会和原文冲突。
   */
  static escapeHTML(text: string): string {
    const bingMarkFrontPart = '<mstrans:dictionary translation="';
    const bingMarkSecondPart = '"></mstrans:dictionary>';
    let value = text
      .replaceAll(bingMarkFrontPart, '@-/629^*')
      .replaceAll(bingMarkSecondPart, '^$537+*');

    value = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    return value
      .replaceAll('@-/629^*', bingMarkFrontPart)
      .replaceAll('^$537+*', bingMarkSecondPart);
  }

  /**
   * 将 `&amp; &lt; &gt; &quot; &#39;` 还原为 `& < > " '`。
   */
  static unescapeHTML(text: string): string {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
}

class GoogleAuthHelper {
  private static lastRequestAuthTime: number | null = null;
  private static translateAuth: string | null = null;
  private static authNotFound = false;
  private static authPromise: Promise<void> | null = null;

  static get auth(): string | null {
    return GoogleAuthHelper.translateAuth;
  }

  /**
   * 获取 Google 翻译请求所需的 Auth 参数。
   */
  static async findAuth() {
    if (GoogleAuthHelper.authPromise) return GoogleAuthHelper.authPromise;

    GoogleAuthHelper.authPromise = new Promise((resolve) => {
      let update = false;
      if (GoogleAuthHelper.lastRequestAuthTime) {
        const date = new Date();
        if (GoogleAuthHelper.translateAuth) date.setMinutes(date.getMinutes() - 20);
        else if (GoogleAuthHelper.authNotFound) date.setMinutes(date.getMinutes() - 5);
        else date.setMinutes(date.getMinutes() - 1);
        update = date.getTime() > GoogleAuthHelper.lastRequestAuthTime;
      } else {
        update = true;
      }

      if (!update) {
        resolve();
        return;
      }

      GoogleAuthHelper.lastRequestAuthTime = Date.now();

      const fallbackKey = new TextDecoder().decode(
        new Uint8Array([
          65, 73, 122, 97, 83, 121, 65, 84, 66, 88, 97, 106, 118, 122, 81, 76, 84, 68, 72, 69, 81,
          98, 99, 112, 113, 48, 73, 104, 101, 48, 118, 87, 68, 72, 109, 79, 53, 50, 48
        ])
      );

      const xhr = new XMLHttpRequest();
      xhr.open(
        'GET',
        'https://translate.googleapis.com/_/translate_http/_/js/k=translate_http.tr.en_US.YusFYy3P_ro.O/am=AAg/d=1/exm=el_conf/ed=1/rs=AN8SPfq1Hb8iJRleQqQc8zhdzXmF9E56eQ/m=el_main'
      );
      xhr.send();
      xhr.onload = () => {
        const result = xhr.responseText.match(/['"]x-goog-api-key['"]\s*:\s*['"](\w{39})['"]/i);
        if (result && result[1]) {
          GoogleAuthHelper.translateAuth = result[1];
          GoogleAuthHelper.authNotFound = false;
        } else {
          GoogleAuthHelper.translateAuth = fallbackKey;
          GoogleAuthHelper.authNotFound = true;
        }
        resolve();
      };
      xhr.onerror =
        xhr.onabort =
        xhr.ontimeout =
          () => {
            GoogleAuthHelper.translateAuth = fallbackKey;
            resolve();
          };
    });

    await GoogleAuthHelper.authPromise;
    GoogleAuthHelper.authPromise = null;
  }
}

class BingAuthHelper {
  private static lastRequestAuthTime: number | null = null;
  private static translateAuth: string | null = null;
  private static authNotFound = false;
  private static promise: Promise<void> | null = null;

  static get auth(): string | null {
    return BingAuthHelper.translateAuth;
  }

  /**
   * 获取必应翻译请求所需的 Auth 参数。
   */
  static async findAuth() {
    if (BingAuthHelper.promise) return BingAuthHelper.promise;

    BingAuthHelper.promise = new Promise((resolve) => {
      let update = false;
      if (BingAuthHelper.lastRequestAuthTime) {
        const date = new Date();
        if (BingAuthHelper.translateAuth) date.setMinutes(date.getMinutes() - 8);
        else if (BingAuthHelper.authNotFound) date.setMinutes(date.getMinutes() - 5);
        else date.setMinutes(date.getMinutes() - 1);
        update = date.getTime() > BingAuthHelper.lastRequestAuthTime;
      } else {
        update = true;
      }
      if (!update) {
        resolve();
        return;
      }
      BingAuthHelper.lastRequestAuthTime = Date.now();

      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://edge.microsoft.com/translate/auth');
      xhr.send();
      xhr.onload = () => {
        if (xhr.responseText && xhr.responseText.length > 1) {
          BingAuthHelper.translateAuth = xhr.responseText;
          BingAuthHelper.authNotFound = false;
        } else {
          BingAuthHelper.authNotFound = true;
        }
        resolve();
      };
      xhr.onerror = xhr.onabort = xhr.ontimeout = () => resolve();
    });

    await BingAuthHelper.promise;
    BingAuthHelper.promise = null;
  }
}

/**
 * 翻译服务基类，统一处理请求构造、缓存命中和结果回填。
 */
class Service {
  /**
   * 用作进行中的内存翻译缓存，确保相同请求复用同一次 `XMLHttpRequest`。
   * */
  private readonly translationsInProgress = new Map<string, TranslationInfo>();

  /**
   * 使用具体服务的信息初始化当前 `Service` 实例。
   */
  constructor(
    public readonly serviceName: string,
    public baseURL: string,
    private readonly cache: CacheLike,
    private readonly transformRequest: RequestTransformer,
    private readonly parseResponse: ResponseParser,
    private readonly transformResponse: ResponseTransformer,
    private readonly getExtraParameters: ExtraParameters | null = null,
    private readonly getRequestBody: RequestBody | null = null,
    private readonly getExtraHeaders: ExtraHeaders | null = null,
    private readonly method: 'GET' | 'POST' = 'GET'
  ) {}

  /**
   * 清理 `translationsInProgress` 中状态为 **error** 的任务。
   *
   * 网络异常时，同一请求可能卡在失败状态；移除后才能在下次请求时重新翻译。
   */
  removeTranslationsWithError() {
    this.translationsInProgress.forEach((value, key) => {
      if (value.status === 'error') this.translationsInProgress.delete(key);
    });
  }

  /**
   * 根据 `sourceArray2d` 预先整理请求批次。
   * 已在进行中或已命中缓存的内容会直接复用，只有真正缺失的部分才会生成新的 HTTP 请求。
   *
   * 单批文本超过 **800 个字符** 时会继续拆分，以避免触发服务端长度限制。
   */
  private async getRequests(
    sourceLanguage: string,
    targetLanguage: string,
    sourceArray2d: string[][]
  ): Promise<[TranslationInfo[][], TranslationInfo[]]> {
    const requests: TranslationInfo[][] = [];
    const currentTranslations: TranslationInfo[] = [];
    let currentRequest: TranslationInfo[] = [];
    let currentSize = 0;

    for (const sourceArray of sourceArray2d) {
      const requestString = this.fixString(this.transformRequest(sourceArray));
      const requestHash = [sourceLanguage, targetLanguage, requestString].join(', ');

      const running = this.translationsInProgress.get(requestHash);
      if (running) {
        currentTranslations.push(running);
        continue;
      }

      let resolveWait: () => void = () => undefined;
      const info: TranslationInfo = {
        originalText: requestString,
        translatedText: null,
        detectedLanguage: null,
        status: 'translating',
        waitTranslate: new Promise<void>((resolve) => {
          resolveWait = resolve;
        }),
        resolveWait
      };

      this.translationsInProgress.set(requestHash, info);
      currentTranslations.push(info);

      const cached = await this.cache.get(
        this.serviceName,
        sourceLanguage,
        targetLanguage,
        requestString
      );
      if (cached) {
        info.translatedText = cached.translatedText;
        info.detectedLanguage = cached.detectedLanguage;
        info.status = 'complete';
        info.resolveWait();
      } else {
        currentRequest.push(info);
        currentSize += requestString.length;
        if (currentSize > 800) {
          requests.push(currentRequest);
          currentRequest = [];
          currentSize = 0;
        }
      }
    }

    if (currentRequest.length > 0) requests.push(currentRequest);

    return [requests, currentTranslations];
  }

  /**
   * 使用 `XMLHttpRequest` 发起底层翻译请求；成功时返回响应，失败时抛出错误。
   */
  protected async makeRequest(
    sourceLanguage: string,
    targetLanguage: string,
    requests: TranslationInfo[]
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        this.method,
        this.baseURL +
          (this.getExtraParameters
            ? this.getExtraParameters(sourceLanguage, targetLanguage, requests)
            : '')
      );

      if (this.getExtraHeaders) {
        this.getExtraHeaders().forEach((header) => {
          xhr.setRequestHeader(header.name, header.value);
        });
      }

      xhr.responseType = 'json';
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = xhr.onabort = xhr.ontimeout = () => reject(new Error('request failed'));
      xhr.send(
        this.getRequestBody
          ? this.getRequestBody(sourceLanguage, targetLanguage, requests)
          : undefined
      );
    });
  }

  /**
   * 翻译 `sourceArray2d` 中的文本块。
   *
   * 当 `dontSaveInPersistentCache` 为 **true** 时，结果只保存在内存中，不写入磁盘缓存。
   * `dontSortResults` 仅对 ***google*** 服务有效，用于保留服务端返回的原始顺序。
   */
  async translate(
    sourceLanguage: string,
    targetLanguage: string,
    sourceArray2d: string[][],
    dontSaveInPersistentCache = false,
    dontSortResults = false
  ): Promise<string[][]> {
    const [requests, current] = await this.getRequests(
      sourceLanguage,
      targetLanguage,
      sourceArray2d
    );

    const requestPromises = requests.map((requestGroup) =>
      this.makeRequest(sourceLanguage, targetLanguage, requestGroup)
        .then((response) => {
          const results = this.parseResponse(response);
          requestGroup.forEach((info, index) => {
            const parsed = results[index];
            info.translatedText = parsed?.text ?? '';
            info.detectedLanguage = parsed?.detectedLanguage ?? 'und';
            info.status = 'complete';
            info.resolveWait();

            if (!dontSaveInPersistentCache && info.translatedText) {
              void this.cache.set(
                this.serviceName,
                sourceLanguage,
                targetLanguage,
                info.originalText,
                info.translatedText,
                info.detectedLanguage ?? 'und'
              );
            }
          });
        })
        .catch(() => {
          requestGroup.forEach((info) => {
            info.status = 'error';
            info.resolveWait();
          });
        })
    );

    await Promise.all(requestPromises);
    await Promise.all(current.map((info) => info.waitTranslate));

    return current.map((info) =>
      this.transformResponse(info.translatedText ?? '', dontSortResults)
    );
  }

  /**
   * 修复零宽空格导致的异常分段。参考 issue #484。
   */
  private fixString(value: string): string {
    return value.replace(/\u200b/g, ' ');
  }
}

export class TranslationService {
  private readonly serviceList = new Map<string, Service>();

  constructor(private readonly cache: TranslationCache) {
    const googleService = new Service(
      'google',
      'https://translate-pa.googleapis.com/v1/translateHtml',
      this.cache,
      (sourceArray) => {
        const escaped = sourceArray.map((text) => Utils.escapeHTML(text));
        const inline =
          escaped.length > 1 ? escaped.map((text, index) => `<a i=${index}>${text}</a>`) : escaped;
        return `<pre>${inline.join('')}</pre>`;
      },
      (response) => {
        const list = response as [string[], string[] | undefined] | null;
        if (!list || !Array.isArray(list[0])) return [{ text: '', detectedLanguage: null }];
        return list[0].map((value, index) => ({
          text: value,
          detectedLanguage: Array.isArray(list[1]) ? (list[1][index] ?? null) : null
        }));
      },
      (result, dontSortResults) => {
        let value = result;
        if (value.indexOf('<pre') !== -1) {
          value = value.replace('</pre>', '');
          value = value.slice(value.indexOf('>') + 1);
        }

        const sentenceMatches = [...value.matchAll(/(<a\si=[0-9]+>)([^<>]*(?=<\/a>))*/g)];
        if (sentenceMatches.length === 0) {
          return [Utils.unescapeHTML(value.replace(/<\/b>/g, ''))];
        }

        const indexes = sentenceMatches.map((entry) => {
          const idx = entry[0].match(/[0-9]+(?=>)/g);
          return idx ? Number(idx[0]) : 0;
        });
        const words = sentenceMatches.map((entry) => {
          const i = entry[0].indexOf('>');
          return Utils.unescapeHTML(entry[0].slice(i + 1));
        });

        if (dontSortResults) {
          return words;
        }

        const sorted: string[] = [];
        indexes.forEach((idx, i) => {
          if (sorted[idx]) sorted[idx] += ` ${words[i]}`;
          else sorted[idx] = words[i];
        });
        return sorted;
      },
      () => '',
      (sourceLanguage, targetLanguage, requests) =>
        JSON.stringify([
          [requests.map((info) => info.originalText), sourceLanguage, targetLanguage],
          'te'
        ]),
      () => [
        { name: 'Content-Type', value: 'application/application/json+protobuf' },
        { name: 'X-goog-api-key', value: GoogleAuthHelper.auth ?? '' }
      ],
      'POST'
    );

    const bingService = new Service(
      'bing',
      'https://api-edge.cognitive.microsofttranslator.com/translate?api-version=3.0&includeSentenceLength=true',
      this.cache,
      (sourceArray) => {
        let id = 10;
        return sourceArray
          .map((value) => {
            const tag = `<b${id}>${Utils.escapeHTML(value)}</b${id}>`;
            id += 1;
            return tag;
          })
          .join('');
      },
      (response) => {
        const arr = response as Array<{
          translations?: Array<{ text: string }>;
          detectedLanguage?: { language?: string };
        }>;
        if (!Array.isArray(arr)) return [{ text: '', detectedLanguage: null }];
        return arr.map((item) => ({
          text: item.translations?.[0]?.text ?? '',
          detectedLanguage: item.detectedLanguage?.language ?? null
        }));
      },
      (result, dontSortResults) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(result, 'text/html');
        const array: string[] = [];
        let currentText = '';
        doc.body.childNodes.forEach((node) => {
          if (node.nodeName === '#text') {
            currentText += node.textContent ?? '';
            return;
          }
          if (dontSortResults) {
            array.push(currentText + (node.textContent ?? ''));
          } else {
            const id = Number(node.nodeName.slice(1)) - 10;
            array[id] = currentText + (node.textContent ?? '');
          }
          currentText = '';
        });
        return array;
      },
      (sourceLanguage, targetLanguage) =>
        `${sourceLanguage !== 'auto-detect' ? `&from=${sourceLanguage}` : ''}&to=${targetLanguage}`,
      (_sourceLanguage, _targetLanguage, requests) =>
        JSON.stringify(requests.map((info) => ({ text: info.originalText }))),
      () => [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'authorization', value: `Bearer ${BingAuthHelper.auth ?? ''}` }
      ],
      'POST'
    );

    this.serviceList.set('google', googleService);
    this.serviceList.set('bing', bingService);
  }

  private createLibreService(url: string, apiKey: string): Service {
    return new Service(
      'libre',
      url,
      this.cache,
      (sourceArray) => sourceArray[0] ?? '',
      (response) => {
        const data = response as {
          translatedText?: string;
          detectedLanguage?: { language?: string };
        };
        return [
          {
            text: data?.translatedText ?? '',
            detectedLanguage: data?.detectedLanguage?.language ?? null
          }
        ];
      },
      (result) => [result],
      null,
      (sourceLanguage, targetLanguage, requests) => {
        const params = new URLSearchParams();
        params.append('q', requests[0]?.originalText ?? '');
        params.append('source', sourceLanguage);
        params.append('target', targetLanguage);
        params.append('format', 'text');
        params.append('api_key', apiKey);
        return params.toString();
      },
      () => [{ name: 'Content-Type', value: 'application/x-www-form-urlencoded' }],
      'POST'
    );
  }

  private getSafeServiceByName(serviceName: string): Service | null {
    if (!config) return this.serviceList.get(serviceName) ?? null;
    const enabledProviders = config.get('enabledProviders');
    const customProviders = config.get('customProviders');
    if (
      enabledProviders.find((item) => item.name === serviceName) ||
      customProviders.find((item) => item.name === serviceName)
    ) {
      return this.serviceList.get(serviceName) ?? null;
    }
    return null;
  }

  bindRuntimeMessageListener(config: {
    get<T>(name: string): T;
    onReady(callback?: () => void): Promise<void>;
    onChanged(callback: (name: string, value: unknown) => void): void;
  }): void {
    // 翻译服务核心 - 处理翻译请求和自定义服务管理
    // 接收content script发来的翻译请求，调用翻译服务进行翻译
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      const action = (request as { action?: string }).action;
      if (!action) return;

      // 如果翻译请求来自隐身窗口，不应缓存到磁盘
      let dontSaveInPersistentCache = true;
      if (config.get('enableDiskCache') === 'yes') {
        dontSaveInPersistentCache = sender.tab ? sender.tab.incognito : false;
      }

      // 翻译HTML内容（包含标签结构）
      if (action === 'translateHTML') {
        void this.translateHTML(
          String((request as { translationService: string }).translationService),
          String((request as { sourceLanguage: string }).sourceLanguage),
          String((request as { targetLanguage: string }).targetLanguage),
          (request as { sourceArray2d: string[][] }).sourceArray2d,
          dontSaveInPersistentCache,
          Boolean((request as { dontSortResults?: boolean }).dontSortResults)
        )
          .then((result) => sendResponse(result))
          .catch(() => sendResponse());
        return true;
      }

      // 翻译纯文本数组
      if (action === 'translateText') {
        void this.translateText(
          String((request as { translationService: string }).translationService),
          String((request as { sourceLanguage: string }).sourceLanguage),
          String((request as { targetLanguage: string }).targetLanguage),
          (request as { sourceArray: string[] }).sourceArray,
          dontSaveInPersistentCache
        )
          .then((result) => sendResponse(result))
          .catch(() => sendResponse());
        return true;
      }

      // 翻译单个文本
      if (action === 'translateSingleText') {
        void this.translateSingleText(
          String((request as { translationService: string }).translationService),
          String((request as { sourceLanguage: string }).sourceLanguage),
          String((request as { targetLanguage: string }).targetLanguage),
          String((request as { source: string }).source),
          dontSaveInPersistentCache
        )
          .then((result) => sendResponse(result))
          .catch(() => sendResponse());
        return true;
      }

      // 清除所有包含错误的翻译缓存
      if (action === 'removeTranslationsWithError') {
        this.serviceList.forEach((service) => {
          if ('removeTranslationsWithError' in service) {
            service.removeTranslationsWithError();
          }
        });
        return;
      }

      // 创建自定义LibreTranslate服务
      if (action === 'createLibreService') {
        const libre = request as { libre: { url: string; apiKey: string } };
        this.serviceList.set('libre', this.createLibreService(libre.libre.url, libre.libre.apiKey));
        return;
      }

      // 移除自定义LibreTranslate服务
      if (action === 'removeLibreService') {
        this.serviceList.delete('libre');
        return;
      }

      return;
    });

    config.onReady(() => {
      const proxyServers = config.get('proxyServers');
      const google = this.serviceList.get('google');
      if (google && 'baseURL' in google) {
        if (proxyServers?.google?.translateServer) {
          const url = new URL(google.baseURL);
          url.host = proxyServers.google.translateServer;
          google.baseURL = url.toString();
        }
      }
    });

    config.onChanged((name, newValue) => {
      if (name !== 'proxyServers') return;
      const proxyServers = newValue as Record<string, { translateServer?: string }>;
      const google = this.serviceList.get('google');
      if (!google || !('baseURL' in google)) return;
      const url = new URL(google.baseURL);
      if (proxyServers?.google?.translateServer) {
        url.host = proxyServers.google.translateServer;
      } else {
        url.host = 'translate-pa.googleapis.com';
      }
      google.baseURL = url.toString();
    });
  }

  async translateHTML(
    serviceName: string,
    sourceLanguage: string,
    targetLanguage: string,
    sourceArray2d: string[][],
    dontSaveInPersistentCache = false,
    dontSortResults = false
  ): Promise<string[][]> {
    let selectedServiceName =
      languages.getAlternativeService(targetLanguage, serviceName, true) ?? serviceName;
    const service = this.getSafeServiceByName(selectedServiceName);
    if (!service) return sourceArray2d;

    if (selectedServiceName === 'google') {
      await GoogleAuthHelper.findAuth();
      if (!GoogleAuthHelper.auth) {
        selectedServiceName = 'google';
      }
    } else if (selectedServiceName === 'bing') {
      await BingAuthHelper.findAuth();
      if (!BingAuthHelper.auth) return sourceArray2d;
    }

    return service.translate(
      sourceLanguage,
      targetLanguage,
      sourceArray2d,
      dontSaveInPersistentCache,
      dontSortResults
    );
  }

  async translateText(
    serviceName: string,
    sourceLanguage: string,
    targetLanguage: string,
    sourceArray: string[],
    dontSaveInPersistentCache = false
  ): Promise<string[]> {
    let selectedServiceName =
      languages.getAlternativeService(targetLanguage, serviceName, false) ?? serviceName;
    const results = await this.translateHTML(
      selectedServiceName,
      sourceLanguage,
      targetLanguage,
      sourceArray.map((text) => [text]),
      dontSaveInPersistentCache,
      false
    );
    return results.map((result) => result[0] ?? '');
  }

  async translateSingleText(
    serviceName: string,
    sourceLanguage: string,
    targetLanguage: string,
    originalText: string,
    dontSaveInPersistentCache = false
  ): Promise<string> {
    const result = await this.translateText(
      serviceName,
      sourceLanguage,
      targetLanguage,
      [originalText],
      dontSaveInPersistentCache
    );
    return result[0] ?? '';
  }
}
