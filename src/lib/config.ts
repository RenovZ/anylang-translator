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

export const providers: Provider[] = [
  { type: 'api', name: 'google' },
  { type: 'api', name: 'bing' },
  { type: 'ai', name: 'OpenAI', models: ['gpt-4.1-mini', 'gpt-4.1', 'gpt-4o-mini'] },
  { type: 'ai', name: 'Anthropic', models: ['claude-3-5-haiku', 'claude-3-7-sonnet'] },
  { type: 'ai', name: 'Google AI', models: ['gemini-2.5-flash', 'gemini-2.5-pro'] },
  { type: 'ai', name: 'AWS', models: ['amazon.nova-lite', 'amazon.nova-pro'] },
  { type: 'ai', name: 'Ollama', models: ['qwen3.5-2b', 'llama3.2', 'deepseek-r1:7b'] },
  { type: 'ai', name: 'Groq', models: ['llama-3.3-70b', 'deepseek-r1-distill-llama-70b'] },
  {
    type: 'ai',
    name: 'Hugging Face',
    models: ['Qwen/Qwen2.5-7B-Instruct', 'mistralai/Mistral-7B-Instruct-v0.3']
  },
  { type: 'ai', name: 'Mistral AI', models: ['mistral-small-latest', 'ministral-8b-latest'] },
  { type: 'ai', name: 'Cohere', models: ['command-r', 'command-r-plus'] },
  {
    type: 'ai',
    name: 'Fireworks',
    models: ['accounts/fireworks/models/deepseek-v3', 'accounts/fireworks/models/qwen2p5-coder-32b']
  },
  { type: 'ai', name: 'xAI (Grok)', models: ['grok-2-latest', 'grok-2-mini'] },
  { type: 'ai', name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-reasoner'] },
  { type: 'ai', name: 'Perplexity', models: ['sonar', 'sonar-pro'] },
  { type: 'ai', name: 'Azure AI', models: ['gpt-4.1-mini', 'gpt-4o-mini'] },
  {
    type: 'ai',
    name: 'NVIDIA AI',
    models: ['meta/llama-3.1-70b-instruct', 'nvidia/llama-3.1-nemotron-70b-instruct']
  },
  { type: 'ai', name: 'IBM', models: ['granite-3.2-8b-instruct', 'granite-3.1-2b-instruct'] },
  {
    type: 'ai',
    name: 'Together',
    models: ['meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', 'Qwen/Qwen2.5-72B-Instruct-Turbo']
  },
  {
    type: 'ai',
    name: 'OpenRouter',
    models: ['openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet', 'google/gemini-2.0-flash-001']
  }
];

export const defaultConfig = {
  installDateTime: null as number | null, // 安装时间（时间戳）
  lastTimeShowingReleaseNotes: null as number | null, // 上次展示更新日志的时间
  originalUserAgent: null as string | null, // 原始 User-Agent（用于设备/浏览器识别或兼容判断）

  uiLanguage: 'default' as string, // UI 语言（default = 跟随系统语言）

  translateProvider: { type: 'api', name: 'google' } as Provider, // 页面翻译服务提供商（当前选中）
  textToSpeechProvider: { type: 'api', name: 'google' } as Provider, // 文本转语音服务提供商
  enabledProviders: [
    { type: 'api', name: 'google' },
    { type: 'api', name: 'bing' }
  ] as Provider[], // 已启用的服务提供商列表
  customProviders: [] as Provider[], // 用户自定义添加的服务提供商

  ttsSpeed: 1, // 语音播放速度（0.5 - 2.0）
  ttsVolume: 1, // 语音播放音量（0 - 1）

  sourceLanguage: null as string | null, // 翻译源语言（当前页面/文本）
  targetLanguage: null as string | null, // 翻译目标语言

  alwaysTranslateSites: [] as string[], // 始终自动翻译的网站列表（域名）
  neverTranslateSites: [] as string[], // 永不翻译的网站列表（域名）

  sitesToTranslateWhenHovering: [] as string[], // 鼠标悬停时触发翻译的网站列表
  langsToTranslateWhenHovering: [] as string[], // 鼠标悬停时触发翻译的语言列表

  alwaysTranslateLangs: [] as string[], // 始终自动翻译的语言列表
  neverTranslateLangs: [] as string[], // 永不翻译的语言列表

  showTranslatePageContextMenu: true, // 是否在右键菜单显示「翻译页面」
  showTranslateSelectedContextMenu: true, // 是否在右键菜单显示「翻译选中文本」
  showButtonInTheAddressBar: true, // 是否在地址栏显示翻译按钮
  showOriginalTextWhenHovering: false, // 鼠标悬停时是否显示原文
  showTranslateSelectedButton: true, // 是否显示“翻译选中文本”按钮

  whenShowMobilePopup: 'when-necessary' as 'when-necessary' | 'only-when-i-touch' | 'always-show',
  // 移动端弹窗显示策略
  // when-necessary = 必要时
  // only-when-i-touch = 仅手动触发
  // always-show = 总是显示

  popupBlueWhenSiteIsTranslated: true, // 当网站已翻译时，弹窗是否变蓝提示状态
  popupPanelSection: 1, // 弹窗默认显示的面板分区编号

  showReleaseNotes: true, // 是否显示更新日志

  dontShowIfIsNotValidText: true, // 当文本无效时不显示翻译入口
  dontShowIfPageLangIsTargetLang: false, // 页面语言 == 目标语言时是否隐藏翻译
  dontShowIfPageLangIsUnknown: false, // 页面语言未知时是否隐藏翻译
  dontShowIfSelectedTextIsTargetLang: false, // 选中文本语言 == 目标语言时是否隐藏翻译
  dontShowIfSelectedTextIsUnknown: false, // 选中文本语言未知时是否隐藏翻译

  hotkeys: {} as Record<string, string>, // 快捷键配置（由 manifest 或用户设置）

  expandPanelTranslateSelectedText: false, // 翻译选中文本时是否自动展开面板
  translateTag_pre: true, // 是否翻译 <pre> 标签内容
  enableIframePageTranslation: true, // 是否允许 iframe 页面翻译
  dontSortResults: false, // 是否不对翻译结果排序（一般用于调试/特殊源）

  translateDynamicallyCreatedContent: true, // 是否翻译动态生成的 DOM 内容（SPA）
  autoTranslateWhenClickingALink: false, // 点击链接时是否自动触发翻译

  translateSelectedWhenPressTwice: false, // 连续按两次快捷键时翻译选中文本
  translateTextOverMouseWhenPressTwice: false, // 连续按两次时翻译鼠标悬停文本
  translateClickingOnce: false, // 单击一次是否触发翻译（激进模式）

  enableDiskCache: false, // 是否启用本地磁盘缓存（翻译结果缓存）
  useAlternativeService: true, // 是否允许使用备用翻译服务

  showMobilePopupOnDesktop: false, // 桌面端是否显示移动端样式弹窗
  popupMobileKeepOnScren: false, // 移动端弹窗是否固定在屏幕上（不自动消失）
  popupMobilePosition: 'top' as 'top' | 'bottom', // 移动端弹窗位置

  addPaddingToPage: false, // 是否给页面注入额外 padding（避免 UI 遮挡）

  proxyServers: {} as Record<string, unknown> // 代理服务器配置（用于 API 转发 / 网络绕过）
};

export type ConfigSchema = typeof defaultConfig;

type Listener<K extends keyof ConfigSchema> = (
  value: ConfigSchema[K],
  prev: ConfigSchema[K]
) => void;

const STORAGE_KEY = 'local:config_v1';
class ConfigStore {
  private data: ConfigSchema = structuredClone(defaultConfig);
  private _ready: Promise<void>;
  // 写入队列（保证顺序一致）
  private writeQueue: Promise<void> = Promise.resolve();
  // debounce timer（减少 storage 写入）
  private persistTimer: ReturnType<typeof setTimeout> | null = null;
  // listeners（轻量 reactive）
  private listeners = new Map<keyof ConfigSchema, Set<Function>>();

  private static instance: ConfigStore;
  private constructor() {
    this._ready = this.init();
  }

  private async init() {
    const stored = await storage.getItem<Partial<ConfigSchema>>(STORAGE_KEY);

    if (stored) {
      this.patch(stored);
    }
  }

  static getInstance(): ConfigStore {
    if (!this.instance) {
      this.instance = new ConfigStore();
    }
    return this.instance;
  }

  ready() {
    return this._ready;
  }

  isSameProvider(a: Provider, b: Provider) {
    if (a.type === 'api' && b.type === 'api') {
      return a.name === b.name;
    }

    if (a.type === 'ai' && b.type === 'ai') {
      return a.name === b.name && a.model === b.model && a.prompt === b.prompt;
    }

    return false;
  }

  get<K extends keyof ConfigSchema>(key: K): ConfigSchema[K] {
    const value = this.data[key];

    if (value === null || typeof value !== 'object') {
      return value;
    }

    return structuredClone(value);
  }

  getAll(): ConfigSchema {
    return structuredClone(this.data);
  }

  set<K extends keyof ConfigSchema>(key: K, value: ConfigSchema[K]) {
    const prev = this.data[key];

    // ⚠️ 只对 primitive 做短路
    // isEqual(prev, value) 是深层比较, 有性能问题
    if (Object.is(prev, value)) return;

    this.data[key] = value;

    this.emitChange(key, value, prev);

    this.schedulePersist();
  }

  patch(partial: Partial<ConfigSchema>) {
    let changed = false;

    for (const key in partial) {
      const k = key as keyof ConfigSchema;

      const prev = this.data[k];
      const next = partial[k];

      if (Object.is(prev, next)) continue;
      if (next === undefined) continue;

      (this.data as Record<string, unknown>)[k] = next;
      // this.data[k] = next;
      this.emitChange(k, next, prev);
      changed = true;
    }

    if (changed) {
      this.schedulePersist();
    }
  }

  async reset() {
    const prev = this.data;
    const next = structuredClone(defaultConfig);

    const keys = Object.keys(defaultConfig) as (keyof ConfigSchema)[];

    this.data = next;

    for (const key of keys) {
      this.emitChange(key, next[key], prev[key]);
    }

    this.schedulePersist();
  }

  onChange<K extends keyof ConfigSchema>(key: K, fn: Listener<K>) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(fn);

    return () => {
      this.listeners.get(key)?.delete(fn);
    };
  }

  private emitChange<K extends keyof ConfigSchema>(
    key: K,
    value: ConfigSchema[K],
    prev: ConfigSchema[K]
  ) {
    const set = this.listeners.get(key);
    if (!set) return;

    set.forEach((fn) => fn(value, prev));
  }

  private schedulePersist() {
    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
    }

    this.persistTimer = setTimeout(() => {
      this.writeQueue = this.writeQueue
        .then(() => storage.setItem(STORAGE_KEY, this.data))
        .catch((err) => {
          console.error('[ConfigStore persist error]', err);
        });
    }, 50);
  }
}

const store = ConfigStore.getInstance();
export const config = new Proxy(store, {
  get(target, key: string) {
    if (typeof key === 'string' && key in target) {
      const value = (target as any)[key];

      // 绑定 this（防止方法丢失上下文）
      if (typeof value === 'function') {
        return value.bind(target);
      }

      return value;
    }

    // if (!target.isReady()) {
    //   console.warn('[ConfigStore] accessed before init');
    // }

    return target.get(key as keyof ConfigSchema);
  },

  set(target, key: string, value) {
    if (!(key in defaultConfig)) {
      console.warn(`[ConfigStore] invalid key: ${key}`);
      return false;
    }

    target.set(key as keyof ConfigSchema, value);
    return true;
  }
}) as unknown as ConfigSchema & ConfigStore;
