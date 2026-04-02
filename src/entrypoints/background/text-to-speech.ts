import { browser } from 'wxt/browser';

interface BingLanguageData {
  language: string;
  locale: string;
  gender: string;
  voice: string;
}

class BingTTSAuthHelper {
  private static lastRequestTime: number | null = null;
  private static ig: string | null = null;
  private static iid: string | null = null;
  private static key: number | null = null;
  private static token: string | null = null;
  private static notFound = false;
  private static promise: Promise<void> | null = null;

  static get IG(): string | null {
    return BingTTSAuthHelper.ig;
  }
  static get IID(): string | null {
    return BingTTSAuthHelper.iid;
  }
  static get keyValue(): number | null {
    return BingTTSAuthHelper.key;
  }
  static get tokenValue(): string | null {
    return BingTTSAuthHelper.token;
  }

  /**
   * Find the SID (IID and IG) of Bing Translator. The SID value is used in translation requests.
   */
  static async findAuth(): Promise<void> {
    if (BingTTSAuthHelper.promise) return BingTTSAuthHelper.promise;

    BingTTSAuthHelper.promise = new Promise((resolve) => {
      let update = false;
      if (BingTTSAuthHelper.lastRequestTime) {
        const date = new Date();
        if (BingTTSAuthHelper.ig) date.setMinutes(date.getMinutes() - 30);
        else if (BingTTSAuthHelper.notFound) date.setMinutes(date.getMinutes() - 5);
        else date.setMinutes(date.getMinutes() - 2);
        update = date.getTime() > BingTTSAuthHelper.lastRequestTime;
      } else {
        update = true;
      }

      if (!update) {
        resolve();
        return;
      }

      BingTTSAuthHelper.lastRequestTime = Date.now();
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://www.bing.com/translator');
      xhr.send();
      xhr.onload = () => {
        try {
          const responseText = xhr.responseText;
          if (!responseText || responseText.length < 2) throw new Error('missing response');
          const ig = responseText.match(/IG:"([^"]+)"/)?.[1];
          const iid = responseText.match(/data-iid="([^"]+)"/)?.[1];
          if (!ig || !iid) throw new Error('missing IG or IID');

          const marker = 'params_AbusePreventionHelper = [';
          const start = responseText.indexOf(marker);
          if (start === -1) throw new Error('missing abuse helper');
          const end = responseText.indexOf(']', start);
          if (end === -1) throw new Error('missing abuse helper end');
          const content = responseText.slice(start + marker.length - 1, end + 1);
          const parsed = JSON.parse(content) as [number, string];

          BingTTSAuthHelper.ig = ig;
          BingTTSAuthHelper.iid = iid;
          BingTTSAuthHelper.key = parsed[0];
          BingTTSAuthHelper.token = parsed[1];
          BingTTSAuthHelper.notFound = false;
        } catch {
          BingTTSAuthHelper.notFound = true;
        }
        resolve();
      };
      xhr.onerror = xhr.onabort = xhr.ontimeout = () => resolve();
    });

    await BingTTSAuthHelper.promise;
    BingTTSAuthHelper.promise = null;
  }

  /**
   * Get the language data for the language.
   */
  static getLanguageData(language: string): BingLanguageData | undefined {
    const replacements: Array<{ search: string; replace: string }> = [
      { search: 'zh-CN', replace: 'zh-Hans' },
      { search: 'zh-TW', replace: 'zh-Hant' },
      { search: 'tl', replace: 'fil' },
      { search: 'hmn', replace: 'mww' },
      { search: 'ku', replace: 'kmr' },
      { search: 'ckb', replace: 'ku' },
      { search: 'mn', replace: 'mn-Cyrl' },
      { search: 'no', replace: 'nb' },
      { search: 'lg', replace: 'lug' },
      { search: 'sr', replace: 'sr-Cyrl' }
    ];
    replacements.forEach((item) => {
      if (language === item.search) {
        language = item.replace;
      }
    });

    const list: BingLanguageData[] = [
      { language: 'af', locale: 'af-ZA', gender: 'Female', voice: 'af-ZA-AdriNeural' },
      { language: 'am', locale: 'am-ET', gender: 'Female', voice: 'am-ET-MekdesNeural' },
      { language: 'ar', locale: 'ar-SA', gender: 'Male', voice: 'ar-SA-HamedNeural' },
      { language: 'bg', locale: 'bg-BG', gender: 'Male', voice: 'bg-BG-BorislavNeural' },
      { language: 'bn', locale: 'bn-IN', gender: 'Female', voice: 'bn-IN-TanishaaNeural' },
      { language: 'ca', locale: 'ca-ES', gender: 'Female', voice: 'ca-ES-JoanaNeural' },
      { language: 'cs', locale: 'cs-CZ', gender: 'Male', voice: 'cs-CZ-AntoninNeural' },
      { language: 'da', locale: 'da-DK', gender: 'Female', voice: 'da-DK-ChristelNeural' },
      { language: 'de', locale: 'de-DE', gender: 'Female', voice: 'de-DE-KatjaNeural' },
      { language: 'el', locale: 'el-GR', gender: 'Male', voice: 'el-GR-NestorasNeural' },
      { language: 'en', locale: 'en-US', gender: 'Female', voice: 'en-US-AriaNeural' },
      { language: 'es', locale: 'es-ES', gender: 'Female', voice: 'es-ES-ElviraNeural' },
      { language: 'fa', locale: 'fa-IR', gender: 'Female', voice: 'fa-IR-DilaraNeural' },
      { language: 'fi', locale: 'fi-FI', gender: 'Female', voice: 'fi-FI-NooraNeural' },
      { language: 'fr', locale: 'fr-FR', gender: 'Female', voice: 'fr-FR-DeniseNeural' },
      { language: 'fr-CA', locale: 'fr-CA', gender: 'Female', voice: 'fr-CA-SylvieNeural' },
      { language: 'he', locale: 'he-IL', gender: 'Male', voice: 'he-IL-AvriNeural' },
      { language: 'hi', locale: 'hi-IN', gender: 'Female', voice: 'hi-IN-SwaraNeural' },
      { language: 'id', locale: 'id-ID', gender: 'Male', voice: 'id-ID-ArdiNeural' },
      { language: 'it', locale: 'it-IT', gender: 'Male', voice: 'it-IT-DiegoNeural' },
      { language: 'ja', locale: 'ja-JP', gender: 'Female', voice: 'ja-JP-NanamiNeural' },
      { language: 'ko', locale: 'ko-KR', gender: 'Female', voice: 'ko-KR-SunHiNeural' },
      { language: 'nb', locale: 'nb-NO', gender: 'Female', voice: 'nb-NO-PernilleNeural' },
      { language: 'nl', locale: 'nl-NL', gender: 'Female', voice: 'nl-NL-ColetteNeural' },
      { language: 'pl', locale: 'pl-PL', gender: 'Female', voice: 'pl-PL-ZofiaNeural' },
      { language: 'pt', locale: 'pt-BR', gender: 'Female', voice: 'pt-BR-FranciscaNeural' },
      { language: 'pt-PT', locale: 'pt-PT', gender: 'Female', voice: 'pt-PT-FernandaNeural' },
      { language: 'ru', locale: 'ru-RU', gender: 'Female', voice: 'ru-RU-DariyaNeural' },
      { language: 'sv', locale: 'sv-SE', gender: 'Female', voice: 'sv-SE-SofieNeural' },
      { language: 'tr', locale: 'tr-TR', gender: 'Female', voice: 'tr-TR-EmelNeural' },
      { language: 'uk', locale: 'uk-UA', gender: 'Female', voice: 'uk-UA-PolinaNeural' },
      { language: 'vi', locale: 'vi-VN', gender: 'Male', voice: 'vi-VN-NamMinhNeural' },
      { language: 'yue', locale: 'zh-HK', gender: 'Female', voice: 'zh-HK-HiuGaaiNeural' },
      { language: 'zh-Hans', locale: 'zh-CN', gender: 'Female', voice: 'zh-CN-XiaoxiaoNeural' },
      { language: 'zh-Hant', locale: 'zh-CN', gender: 'Female', voice: 'zh-CN-XiaoxiaoNeural' }
    ];
    return list.find((item) => item.language === language);
  }
}

class AudioAmplifier {
  private audioCtx?: AudioContext;
  private gainNode?: GainNode;
  private readonly sources: MediaElementAudioSourceNode[] = [];

  constructor() {
    if ('AudioContext' in window) {
      this.audioCtx = new AudioContext();
      void this.audioCtx.suspend();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = 1;
      this.gainNode.connect(this.audioCtx.destination);
    }
  }

  async amplify(audio: HTMLAudioElement): Promise<void> {
    if (!this.audioCtx || !this.gainNode) return;
    if (!this.sources.find((source) => source.mediaElement === audio)) {
      const source = this.audioCtx.createMediaElementSource(audio);
      this.sources.push(source);
      source.connect(this.gainNode);
    }
    await this.audioCtx.resume();
  }

  setVolume(volume: number): void {
    if (!this.gainNode) return;
    this.gainNode.gain.value = volume > 1 ? volume : 1;
  }

  async suspend(): Promise<void> {
    if (this.audioCtx) {
      await this.audioCtx.suspend();
    }
  }
}

class Service {
  private readonly audios = new Map<string, HTMLAudioElement>();
  private audioSpeed = 1;
  private readonly amplifier = new AudioAmplifier();

  constructor(
    private readonly serviceName: string,
    public baseURL: string,
    private readonly method: 'GET' | 'POST',
    private readonly getExtraParameters: (text: string, targetLanguage: string) => string,
    private readonly getRequestBody:
      | ((text: string, targetLanguage: string) => string)
      | null = null
  ) {}

  private getRequests(fullText: string): string[] {
    const fullTextSplitted: string[] = [];
    fullText
      .trim()
      .split(' ')
      .forEach((word) => {
        let currentWord = word;
        if (currentWord.length > 160) {
          while (currentWord.length > 160) {
            fullTextSplitted.push(currentWord.slice(0, 160));
            currentWord = currentWord.slice(160);
          }
        }
        if (currentWord.trim().length > 0) {
          fullTextSplitted.push(currentWord);
        }
      });

    const requests: string[] = [];
    let requestString = '';
    fullTextSplitted.forEach((text) => {
      const chunk = `${text} `;
      if (requestString.length + chunk.length < 170) requestString += chunk;
      else {
        requests.push(requestString);
        requestString = chunk;
      }
    });
    if (requestString.trim().length > 0) requests.push(requestString);
    return requests;
  }

  private async makeRequest(text: string, targetLanguage: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(this.method, this.baseURL + this.getExtraParameters(text, targetLanguage));
      xhr.responseType = 'blob';
      xhr.onload = () => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(new Error('reader failed'));
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = () => reject(new Error('request failed'));

      if (this.getRequestBody) {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(this.getRequestBody(text, targetLanguage));
      } else {
        xhr.send();
      }
    });
  }

  async textToSpeech(fullText: string, targetLanguage: string): Promise<void> {
    if (this.serviceName === 'bing') {
      await BingTTSAuthHelper.findAuth();
    }

    const requests = this.getRequests(fullText);
    await Promise.all(
      requests.map(async (requestText) => {
        const key = [targetLanguage, requestText].join(', ');
        if (this.audios.get(key)) return;
        const response = await this.makeRequest(requestText, targetLanguage).catch(() => '');
        if (!response) return;
        this.audios.set(key, new Audio(response));
      })
    );

    const audios = requests
      .map((text) => this.audios.get([targetLanguage, text].join(', ')))
      .filter((audio): audio is HTMLAudioElement => Boolean(audio));

    await this.play(audios);
  }

  private async play(audios: HTMLAudioElement[]): Promise<void> {
    this.stopAll();
    for (const audio of audios) {
      audio.playbackRate = this.audioSpeed;
      await this.amplifier.amplify(audio);
      await new Promise<void>((resolve) => {
        audio.addEventListener('ended', () => resolve(), { once: true });
        void audio.play().catch(() => resolve());
      });
    }
    await this.amplifier.suspend();
  }

  setAudioSpeed(speed: number): void {
    this.audioSpeed = speed;
    this.audios.forEach((audio) => {
      audio.playbackRate = speed;
    });
  }

  setAudioVolume(volume: number): void {
    this.audios.forEach((audio) => {
      audio.volume = volume > 1 ? 1 : volume;
    });
    this.amplifier.setVolume(volume < 1 ? 1 : volume);
  }

  stopAll(): void {
    this.audios.forEach((audio) => {
      audio.pause();
      if (!Number.isNaN(audio.duration) && Number.isFinite(audio.duration)) {
        audio.currentTime = audio.duration;
      }
    });
    void this.amplifier.suspend();
  }
}

export class TextToSpeech {
  private readonly googleService = new Service(
    'google',
    'https://translate.google.com/translate_tts?ie=UTF-8',
    'GET',
    (text, targetLanguage) =>
      `&tl=${targetLanguage}&client=dict-chrome-ex&ttsspeed=0.5&q=${encodeURIComponent(text)}`
  );

  private readonly bingService = new Service(
    'bing',
    'https://www.bing.com/tfettts?isVertical=1',
    'POST',
    () =>
      `&&IG=${encodeURIComponent(BingTTSAuthHelper.IG ?? '')}&IID=${encodeURIComponent(BingTTSAuthHelper.IID ?? '')}.1`,
    (text, targetLanguage) => {
      const languageData = BingTTSAuthHelper.getLanguageData(targetLanguage);
      if (
        !languageData ||
        !BingTTSAuthHelper.tokenValue ||
        typeof BingTTSAuthHelper.keyValue !== 'number'
      ) {
        return '';
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(
        "<speak version='1.0' xml:lang=''><voice xml:lang='' xml:gender='' name=''><prosody rate='-20.00%'></prosody></voice></speak>",
        'text/xml'
      );

      doc.querySelector('speak')?.setAttribute('xml:lang', languageData.locale);
      doc.querySelector('voice')?.setAttribute('xml:lang', languageData.locale);
      doc.querySelector('voice')?.setAttribute('xml:gender', languageData.gender);
      doc.querySelector('voice')?.setAttribute('xml:name', languageData.voice);
      const prosody = doc.querySelector('prosody');
      if (prosody) prosody.textContent = text;

      const params = new URLSearchParams();
      params.append('ssml', new XMLSerializer().serializeToString(doc));
      params.append('token', BingTTSAuthHelper.tokenValue);
      params.append('key', String(BingTTSAuthHelper.keyValue));
      return params.toString();
    }
  );

  bindRuntimeMessageListener(config: {
    get<T>(name: string): T;
    onReady(callback?: () => void): Promise<void>;
    onChanged(callback: (name: string, value: unknown) => void): void;
  }): void {
    browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      const action = (request as { action?: string }).action;
      if (action === 'textToSpeech') {
        const serviceName = config.get<string>('textToSpeechService');
        const service = serviceName === 'bing' ? this.bingService : this.googleService;
        void service
          .textToSpeech(
            String((request as { text: string }).text),
            String((request as { targetLanguage: string }).targetLanguage)
          )
          .finally(() => sendResponse());
        return true;
      }

      if (action === 'stopAudio') {
        this.googleService.stopAll();
        this.bingService.stopAll();
      }

      return;
    });

    void config.onReady(() => {
      this.googleService.setAudioSpeed(config.get<number>('ttsSpeed'));
      this.bingService.setAudioSpeed(config.get<number>('ttsSpeed'));
      this.googleService.setAudioVolume(config.get<number>('ttsVolume'));
      this.bingService.setAudioVolume(config.get<number>('ttsVolume'));

      const proxyServers = config.get<Record<string, { ttsServer?: string }>>('proxyServers');
      if (proxyServers?.google?.ttsServer) {
        const url = new URL(this.googleService.baseURL);
        url.host = proxyServers.google.ttsServer;
        this.googleService.baseURL = url.toString();
      }

      config.onChanged((name, value) => {
        if (name === 'ttsSpeed') {
          const speed = Number(value);
          this.googleService.setAudioSpeed(speed);
          this.bingService.setAudioSpeed(speed);
        } else if (name === 'ttsVolume') {
          const volume = Number(value);
          this.googleService.setAudioVolume(volume);
          this.bingService.setAudioVolume(volume);
        } else if (name === 'proxyServers') {
          const servers = value as Record<string, { ttsServer?: string }>;
          const url = new URL(this.googleService.baseURL);
          if (servers?.google?.ttsServer) {
            url.host = servers.google.ttsServer;
          } else {
            url.host = 'translate.google.com';
          }
          this.googleService.baseURL = url.toString();
        }
      });
    });
  }
}
