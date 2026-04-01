import { browser } from "wxt/browser";

import { checkedLastError } from "@/lib/error";
import { tabsCreate } from "@/lib/tabs";
import type { Languages } from "@/lib/languages";
import type { TranslationCache } from "./cache";

type TranslationStatus = "complete" | "translating" | "error";

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
    * Replace the characters `& < > " '` with `&amp; &lt; &gt; &quot; &#39;`.
    *
    * Note: For bing translation, we want to use its custom dictionary feature,
    * we have to keep certain html tags, so we need to avoid them from being escaped.
    * These symbols are nothing, just to ensure that there are no such symbols in the original text.
    */
  static escapeHTML(text: string): string {
    const bingMarkFrontPart = '<mstrans:dictionary translation="';
    const bingMarkSecondPart = '"></mstrans:dictionary>';
    let value = text
      .replaceAll(bingMarkFrontPart, "@-/629^*")
      .replaceAll(bingMarkSecondPart, "^$537+*");

    value = value
      .replace(/\&/g, "&amp;")
      .replace(/\</g, "&lt;")
      .replace(/\>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/\'/g, "&#39;");

    return value
      .replaceAll("@-/629^*", bingMarkFrontPart)
      .replaceAll("^$537+*", bingMarkSecondPart);
  }

  /**
    * Replace the characters `&amp; &lt; &gt; &quot; &#39;` with `& < > " '`.
    */
  static unescapeHTML(text: string): string {
    return text
      .replace(/\&amp;/g, "&")
      .replace(/\&lt;/g, "<")
      .replace(/\&gt;/g, ">")
      .replace(/\&quot;/g, '"')
      .replace(/\&\#39;/g, "'");
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
    * Find the Auth of Google Translator. The Auth value is used in translation requests.
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
          65, 73, 122, 97, 83, 121, 65, 84, 66, 88, 97, 106, 118, 122, 81, 76, 84, 68, 72, 69,
          81, 98, 99, 112, 113, 48, 73, 104, 101, 48, 118, 87, 68, 72, 109, 79, 53, 50, 48,
        ])
      );

      const xhr = new XMLHttpRequest();
      xhr.open(
        "GET",
        "https://translate.googleapis.com/_/translate_http/_/js/k=translate_http.tr.en_US.YusFYy3P_ro.O/am=AAg/d=1/exm=el_conf/ed=1/rs=AN8SPfq1Hb8iJRleQqQc8zhdzXmF9E56eQ/m=el_main"
      );
      xhr.send();
      xhr.onload = () => {
        const result = xhr.responseText.match(/['"]x\-goog\-api\-key['"]\s*\:\s*['"](\w{39})['"]/i);
        if (result && result[1]) {
          GoogleAuthHelper.translateAuth = result[1];
          GoogleAuthHelper.authNotFound = false;
        } else {
          GoogleAuthHelper.translateAuth = fallbackKey;
          GoogleAuthHelper.authNotFound = true;
        }
        resolve();
      };
      xhr.onerror = xhr.onabort = xhr.ontimeout = () => {
        GoogleAuthHelper.translateAuth = fallbackKey;
        resolve();
      };
    });

    await GoogleAuthHelper.authPromise;
    GoogleAuthHelper.authPromise = null;
  }
}

class YandexSIDHelper {
  private static lastRequestSidTime: number | null = null;
  private static translateSid: string | null = null;
  private static sidNotFound = false;
  private static promise: Promise<void> | null = null;

  static get sid(): string | null {
    return YandexSIDHelper.translateSid;
  }

  /**
    * Find the SID of Yandex Translator. The SID value is used in translation requests.
    */
  static async findSID() {
    if (YandexSIDHelper.promise) return YandexSIDHelper.promise;
    YandexSIDHelper.promise = new Promise((resolve) => {
      let update = false;
      if (YandexSIDHelper.lastRequestSidTime) {
        const date = new Date();
        if (YandexSIDHelper.translateSid) date.setMinutes(date.getMinutes() - 20);
        else if (YandexSIDHelper.sidNotFound) date.setMinutes(date.getMinutes() - 5);
        else date.setMinutes(date.getMinutes() - 1);
        update = date.getTime() > YandexSIDHelper.lastRequestSidTime;
      } else {
        update = true;
      }
      if (!update) {
        resolve();
        return;
      }
      YandexSIDHelper.lastRequestSidTime = Date.now();

      const xhr = new XMLHttpRequest();
      xhr.open(
        "GET",
        "https://translate.yandex.net/website-widget/v1/widget.js?widgetId=ytWidget&pageLang=es&widgetTheme=light&autoMode=false"
      );
      xhr.send();
      xhr.onload = () => {
        const result = xhr.responseText.match(/sid\:\s\'[0-9a-f\.]+/);
        if (result && result[0] && result[0].length > 7) {
          YandexSIDHelper.translateSid = result[0].substring(6);
          YandexSIDHelper.sidNotFound = false;
        } else {
          YandexSIDHelper.sidNotFound = true;
        }
        resolve();
      };
      xhr.onerror = xhr.onabort = xhr.ontimeout = () => resolve();
    });

    await YandexSIDHelper.promise;
    YandexSIDHelper.promise = null;
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
    * Find the Auth of Bing Translator. The Auth value is used in translation requests.
    * @returns {Promise<void>}
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
      xhr.open("GET", "https://edge.microsoft.com/translate/auth");
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
  * Returns a string with additional parameters to be concatenated to the request URL.
  * @callback callback_cbParameters
  * @param {string} sourceLanguage
  * @param {string} targetLanguage
  * @param {Array<TranslationInfo>} requests
  * @returns {string}
  */

/**
  * Takes `sourceArray` and returns a request string to the translation service.
  * @callback callback_cbTransformRequest
  * @param {string[]} sourceArray
  * @returns {string}
  */

/**
  * @typedef {{text: string, detectedLanguage: string}} Service_Single_Result_Response
  */

/**
  * Receives the response from the *http request* and returns `Service_Single_Result_Response[]`.
  *
  * Returns a string with the body of a request of type **POST**.
  * @callback callback_cbParseResponse
  * @param {Object} response
  * @returns {Array<Service_Single_Result_Response>}
  */

/**
  * Takes a string formatted with the translated text and returns a `resultArray`.
  * @callback callback_cbTransformResponse
  * @param {String} result
  * @param {boolean} dontSortResults
  * @returns {string[]} resultArray
  */

/**
  * Return extra headers for the request.
  * @callback callback_cbGetExtraHeaders
  * @returns {Array<{name: string, value: string}>} headers
  */

/** @typedef {"complete" | "translating" | "error"} TranslationStatus */
/**
  * @typedef {Object} TranslationInfo
  * @property {String} originalText
  * @property {String} translatedText
  * @property {String} detectedLanguage
  * @property {TranslationStatus} status
  * @property {Promise<void>} waitTranlate
  */

/**
  * Base class to create new translation services.
  */
class Service {
  /**
    * It works as an in-memory translation cache.
    * Ensures that two identical requests share the same `XMLHttpRequest`.
    * */
  private readonly translationsInProgress = new Map<string, TranslationInfo>();

  /**
    * Initializes the **Service** class with information about the new translation service.
    * @param {string} serviceName
    * @param {string} baseURL
    * @param {"GET" | "POST"} xhrMethod
    * @param {callback_cbTransformRequest} cbTransformRequest Takes `sourceArray` and returns a request string to the translation service.
    * @param {callback_cbParseResponse} cbParseResponse Receives the response from the *http request* and returns `Service_Single_Result_Response[]`.
    * @param {callback_cbTransformResponse} cbTransformResponse Takes a string formatted with the translated text and returns a `resultArray`.
    * @param {callback_cbParameters} cbGetExtraParameters Returns a string with additional parameters to be concatenated to the request URL.
    * @param {callback_cbParameters} cbGetRequestBody Returns a string with the body of a request of type **POST**.
    * @param {callback_cbGetExtraHeaders} cbGetExtraHeaders Return extra headers for the request.
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
    private readonly method: "GET" | "POST" = "GET"
  ) {}

  /**
    * Removes all translations with `status` **error** and are in `translationsInProgress`.
    *
    * Sometimes there is a device translation error due to internet connection problems.
    * Clearing translationsInProgress ensures that the translation will be retried.
    */
  removeTranslationsWithError() {
    this.translationsInProgress.forEach((value, key) => {
      if (value.status === "error") this.translationsInProgress.delete(key);
    });
  }

  /**
    * Receives the `sourceArray2d` parameter and prepares the requests.
    * Calls `cbTransformRequest` for each `sourceArray` of `sourceArray2d`.
    * The `currentTranslationsInProgress` array will be the **final result** with requests already completed or in progress. And the `requests` array will only contain the new requests that need to be made.
    *
    * Checks if there is already an identical request in progress or if it is already in the translation cache.
    * If it doesn't exist, add it to `requests` to make a new *http request*.
    *
    * Requests longer than **800 characters** will be split into new requests.
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
      const requestHash = [sourceLanguage, targetLanguage, requestString].join(", ");

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
        status: "translating",
        waitTranslate: new Promise<void>((resolve) => {
          resolveWait = resolve;
        }),
        resolveWait,
      };

      this.translationsInProgress.set(requestHash, info);
      currentTranslations.push(info);

      const cached = await this.cache.get(this.serviceName, sourceLanguage, targetLanguage, requestString);
      if (cached) {
        info.translatedText = cached.translatedText;
        info.detectedLanguage = cached.detectedLanguage;
        info.status = "complete";
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
    * Makes a request using the *XMLHttpRequest* API. Returns a promise that will be resolved with the result of the request. If the request fails, the promise will be rejected.
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
              : "")
        );

        if (this.getExtraHeaders) {
          this.getExtraHeaders().forEach((header) => {
            xhr.setRequestHeader(header.name, header.value);
          });
        }

        xhr.responseType = "json";
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = xhr.onabort = xhr.ontimeout = () => reject(new Error("request failed"));
        xhr.send(this.getRequestBody ? this.getRequestBody(sourceLanguage, targetLanguage, requests) : undefined);
      });
    }

  /**
    * Translates the `sourceArray2d`.
    *
    * If `dontSaveInPersistentCache` is **true** then the translation result will not be saved in the on-disk translation cache, only in the in-memory cache.
    *
    * The `dontSortResults` parameter is only valid when using the ***google*** translation service, if its value is **true** then the translation result will not be sorted.
    */
  async translate(
    sourceLanguage: string,
    targetLanguage: string,
    sourceArray2d: string[][],
    dontSaveInPersistentCache = false,
    dontSortResults = false
  ): Promise<string[][]> {
    const [requests, current] = await this.getRequests(sourceLanguage, targetLanguage, sourceArray2d);

    const requestPromises = requests.map((requestGroup) =>
      this.makeRequest(sourceLanguage, targetLanguage, requestGroup)
        .then((response) => {
          const results = this.parseResponse(response);
          requestGroup.forEach((info, index) => {
            const parsed = results[index];
            info.translatedText = parsed?.text ?? "";
            info.detectedLanguage = parsed?.detectedLanguage ?? "und";
            info.status = "complete";
            info.resolveWait();

            if (!dontSaveInPersistentCache && info.translatedText) {
              void this.cache.set(
                this.serviceName,
                sourceLanguage,
                targetLanguage,
                info.originalText,
                info.translatedText,
                info.detectedLanguage ?? "und"
              );
            }
          });
        })
        .catch(() => {
          requestGroup.forEach((info) => {
            info.status = "error";
            info.resolveWait();
          });
        })
    );

    await Promise.all(requestPromises);
    await Promise.all(current.map((info) => info.waitTranslate));

    return current.map((info) => this.transformResponse(info.translatedText ?? "", dontSortResults));
  }

  /**
    * https://github.com/FilipePS/Traduzir-paginas-web/issues/484
    */
  private fixString(value: string): string {
    return value.replace(/\u200b/g, " ");
  }
}

export class TranslationService {
  private config: {
    get<T>(name: string): T;
    onReady(callback?: () => void): Promise<void>;
    onChanged(callback: (name: string, value: unknown) => void): void;
  } | null = null;

  private readonly serviceList = new Map<string, Service>();

  constructor(private readonly cache: TranslationCache, private readonly languages: Languages) {
    const googleService = new Service(
      "google",
      "https://translate-pa.googleapis.com/v1/translateHtml",
      this.cache,
      (sourceArray) => {
        const escaped = sourceArray.map((text) => Utils.escapeHTML(text));
        const inline = escaped.length > 1 ? escaped.map((text, index) => `<a i=${index}>${text}</a>`) : escaped;
        return `<pre>${inline.join("")}</pre>`;
      },
      (response) => {
        const list = response as [string[], string[] | undefined] | null;
        if (!list || !Array.isArray(list[0])) return [{ text: "", detectedLanguage: null }];
        return list[0].map((value, index) => ({
          text: value,
          detectedLanguage: Array.isArray(list[1]) ? list[1][index] ?? null : null,
        }));
      },
      (result, dontSortResults) => {
        let value = result;
        if (value.indexOf("<pre") !== -1) {
          value = value.replace("</pre>", "");
          value = value.slice(value.indexOf(">") + 1);
        }

        const sentenceMatches = [...value.matchAll(/(\<a\si\=[0-9]+\>)([^\<\>]*(?=\<\/a\>))*/g)];
        if (sentenceMatches.length === 0) {
          return [Utils.unescapeHTML(value.replace(/\<\/b\>/g, ""))];
        }

        const indexes = sentenceMatches.map((entry) => {
          const idx = entry[0].match(/[0-9]+(?=\>)/g);
          return idx ? Number(idx[0]) : 0;
        });
        const words = sentenceMatches.map((entry) => {
          const i = entry[0].indexOf(">");
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
      () => "",
      (sourceLanguage, targetLanguage, requests) =>
        JSON.stringify([[requests.map((info) => info.originalText), sourceLanguage, targetLanguage], "te"]),
      () => [
        { name: "Content-Type", value: "application/application/json+protobuf" },
        { name: "X-goog-api-key", value: GoogleAuthHelper.auth ?? "" },
      ],
      "POST"
    );

    const yandexService = new Service(
      "yandex",
      "https://translate.yandex.net/api/v1/tr.json/translate?srv=tr-url-widget",
      this.cache,
      (sourceArray) => sourceArray.map((value) => Utils.escapeHTML(value)).join("<wbr>"),
      (response) => {
        const data = response as { lang?: string; text?: string[] } | null;
        if (!data || !Array.isArray(data.text)) return [{ text: "", detectedLanguage: null }];
        const detectedLanguage = data.lang ? data.lang.split("-")[0] : null;
        return data.text.map((text) => ({ text, detectedLanguage }));
      },
      (result) => result.split("<wbr>").map((value) => Utils.unescapeHTML(value)),
      (sourceLanguage, targetLanguage, requests) =>
        `&id=${YandexSIDHelper.sid ?? ""}-0-0&format=html&lang=${
          sourceLanguage === "auto" ? "" : `${sourceLanguage}-`
        }${targetLanguage}${requests.map((info) => `&text=${encodeURIComponent(info.originalText)}`).join("")}`,
      () => undefined,
      () => [{ name: "Content-Type", value: "application/x-www-form-urlencoded" }],
      "GET"
    );

    const bingService = new Service(
      "bing",
      "https://api-edge.cognitive.microsofttranslator.com/translate?api-version=3.0&includeSentenceLength=true",
      this.cache,
      (sourceArray) => {
        let id = 10;
        return sourceArray
          .map((value) => {
            const tag = `<b${id}>${Utils.escapeHTML(value)}</b${id}>`;
            id += 1;
            return tag;
          })
          .join("");
      },
      (response) => {
        const arr = response as Array<{ translations?: Array<{ text: string }>; detectedLanguage?: { language?: string } }>;
        if (!Array.isArray(arr)) return [{ text: "", detectedLanguage: null }];
        return arr.map((item) => ({
          text: item.translations?.[0]?.text ?? "",
          detectedLanguage: item.detectedLanguage?.language ?? null,
        }));
      },
      (result, dontSortResults) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(result, "text/html");
        const array: string[] = [];
        let currentText = "";
        doc.body.childNodes.forEach((node) => {
          if (node.nodeName === "#text") {
            currentText += node.textContent ?? "";
            return;
          }
          if (dontSortResults) {
            array.push(currentText + (node.textContent ?? ""));
          } else {
            const id = Number(node.nodeName.slice(1)) - 10;
            array[id] = currentText + (node.textContent ?? "");
          }
          currentText = "";
        });
        return array;
      },
      (sourceLanguage, targetLanguage) =>
        `${sourceLanguage !== "auto-detect" ? `&from=${sourceLanguage}` : ""}&to=${targetLanguage}`,
      (_sourceLanguage, _targetLanguage, requests) =>
        JSON.stringify(requests.map((info) => ({ text: info.originalText }))),
      () => [
        { name: "Content-Type", value: "application/json" },
        { name: "authorization", value: `Bearer ${BingAuthHelper.auth ?? ""}` },
      ],
      "POST"
    );

    this.serviceList.set("google", googleService);
    this.serviceList.set("yandex", yandexService);
    this.serviceList.set("bing", bingService);
  }

  private createLibreService(url: string, apiKey: string): Service {
    return new Service(
      "libre",
      url,
      this.cache,
      (sourceArray) => sourceArray[0] ?? "",
      (response) => {
        const data = response as { translatedText?: string; detectedLanguage?: { language?: string } };
        return [
          {
            text: data?.translatedText ?? "",
            detectedLanguage: data?.detectedLanguage?.language ?? null,
          },
        ];
      },
      (result) => [result],
      null,
      (sourceLanguage, targetLanguage, requests) => {
        const params = new URLSearchParams();
        params.append("q", requests[0]?.originalText ?? "");
        params.append("source", sourceLanguage);
        params.append("target", targetLanguage);
        params.append("format", "text");
        params.append("api_key", apiKey);
        return params.toString();
      },
      () => [{ name: "Content-Type", value: "application/x-www-form-urlencoded" }],
      "POST"
    );
  }

  private getSafeServiceByName(serviceName: string): Service | DeepLService | null {
    if (!this.config) return this.serviceList.get(serviceName) ?? null;
    const enabledServices = this.config.get<string[]>("enabledServices");
    const customServices = this.config.get<Array<{ name?: string }>>("customServices");
    if (
      enabledServices.includes(serviceName) ||
      customServices.find((item) => item.name === serviceName)
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
    this.config = config;

    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      const action = (request as { action?: string }).action;
      if (!action) return;

      let dontSaveInPersistentCache = true;
      if (config.get<string>("enableDiskCache") === "yes") {
        dontSaveInPersistentCache = sender.tab ? sender.tab.incognito : false;
      }

      if (action === "translateHTML") {
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

      if (action === "translateText") {
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

      if (action === "translateSingleText") {
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

      if (action === "removeTranslationsWithError") {
        this.serviceList.forEach((service) => {
          if ("removeTranslationsWithError" in service) {
            service.removeTranslationsWithError();
          }
        });
        return;
      }

      if (action === "createLibreService") {
        const libre = request as { libre: { url: string; apiKey: string } };
        this.serviceList.set("libre", this.createLibreService(libre.libre.url, libre.libre.apiKey));
        return;
      }

      if (action === "removeLibreService") {
        this.serviceList.delete("libre");
        return;
      }

      return;
    });

    void config.onReady(() => {
      const customServices = config.get<Array<{ name?: string; url?: string; apiKey?: string }>>(
        "customServices"
      );
      const libre = customServices.find((item) => item.name === "libre");
      if (libre?.url && libre?.apiKey) {
        this.serviceList.set("libre", this.createLibreService(libre.url, libre.apiKey));
      }

      const deeplFreeApi = customServices.find((item) => item.name === "deepl_freeapi");
      if (deeplFreeApi?.apiKey) {
        this.serviceList.set("deepl", this.createDeeplFreeApiService(deeplFreeApi.apiKey));
      }

      const proxyServers = config.get<Record<string, { translateServer?: string }>>("proxyServers");
      const google = this.serviceList.get("google");
      if (google && "baseURL" in google) {
        if (proxyServers?.google?.translateServer) {
          const url = new URL(google.baseURL);
          url.host = proxyServers.google.translateServer;
          google.baseURL = url.toString();
        }
      }
    });

    config.onChanged((name, newValue) => {
      if (name !== "proxyServers") return;
      const proxyServers = newValue as Record<string, { translateServer?: string }>;
      const google = this.serviceList.get("google");
      if (!google || !("baseURL" in google)) return;
      const url = new URL(google.baseURL);
      if (proxyServers?.google?.translateServer) {
        url.host = proxyServers.google.translateServer;
      } else {
        url.host = "translate-pa.googleapis.com";
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
    let selectedServiceName = this.languages.getAlternativeService(targetLanguage, serviceName, true) ?? serviceName;
    const service = this.getSafeServiceByName(selectedServiceName);
    if (!service) return sourceArray2d;

    if (selectedServiceName === "google") {
      await GoogleAuthHelper.findAuth();
      if (!GoogleAuthHelper.auth) {
        selectedServiceName = "google";
      }
    } else if (selectedServiceName === "yandex") {
      await YandexSIDHelper.findSID();
      if (!YandexSIDHelper.sid) return sourceArray2d;
    } else if (selectedServiceName === "bing") {
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
    let selectedServiceName = this.languages.getAlternativeService(targetLanguage, serviceName, false) ?? serviceName;
    if (selectedServiceName === "deepl") {
      selectedServiceName = "deepl";
    }
    const results = await this.translateHTML(
      selectedServiceName,
      sourceLanguage,
      targetLanguage,
      sourceArray.map((text) => [text]),
      dontSaveInPersistentCache,
      false
    );
    return results.map((result) => result[0] ?? "");
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
    return result[0] ?? "";
  }
}
