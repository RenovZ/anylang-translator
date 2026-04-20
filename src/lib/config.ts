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

const STORAGE_KEY = 'local:config_v1';

export class ConfigStore {
  installDateTime: number | null = null; // 安装时间（时间戳）
  lastTimeShowingReleaseNotes: number | null = null; // 上次展示更新日志的时间
  originalUserAgent: string | null = null; // 原始 User-Agent（用于设备/浏览器识别或兼容判断）

  uiLanguage: string = 'default'; // UI 语言（default = 跟随系统语言）

  translateProvider: Provider = { type: 'api', name: 'google' }; // 页面翻译服务提供商（当前选中）
  textToSpeechProvider: Provider = { type: 'api', name: 'google' }; // 文本转语音服务提供商
  enabledProviders: Provider[] = [
    { type: 'api', name: 'google' },
    { type: 'api', name: 'bing' }
  ]; // 已启用的服务提供商列表
  customProviders: Provider[] = []; // 用户自定义添加的服务提供商

  ttsSpeed = 1; // 语音播放速度（0.5 - 2.0）
  ttsVolume = 1; // 语音播放音量（0 - 1）

  sourceLanguage: string | null = null; // 翻译源语言（当前页面/文本）
  targetLanguage: string | null = null; // 翻译目标语言

  alwaysTranslateSites: string[] = []; // 始终自动翻译的网站列表（域名）
  neverTranslateSites: string[] = []; // 永不翻译的网站列表（域名）

  sitesToTranslateWhenHovering: string[] = []; // 鼠标悬停时触发翻译的网站列表
  langsToTranslateWhenHovering: string[] = []; // 鼠标悬停时触发翻译的语言列表

  alwaysTranslateLangs: string[] = []; // 始终自动翻译的语言列表
  neverTranslateLangs: string[] = []; // 永不翻译的语言列表

  showTranslatePageContextMenu = true; // 是否在右键菜单显示「翻译页面」
  showTranslateSelectedContextMenu = true; // 是否在右键菜单显示「翻译选中文本」
  showButtonInTheAddressBar = true; // 是否在地址栏显示翻译按钮
  showOriginalTextWhenHovering = false; // 鼠标悬停时是否显示原文
  showTranslateSelectedButton = true; // 是否显示“翻译选中文本”按钮

  // 移动端弹窗显示策略
  // when-necessary = 必要时
  // only-when-i-touch = 仅手动触发
  // always-show = 总是显示
  whenShowMobilePopup: 'when-necessary' | 'only-when-i-touch' | 'always-show' = 'when-necessary';

  popupBlueWhenSiteIsTranslated = true; // 当网站已翻译时，弹窗是否变蓝提示状态
  popupPanelSection = 1; // 弹窗默认显示的面板分区编号

  showReleaseNotes = true; // 是否显示更新日志

  dontShowIfIsNotValidText = true; // 当文本无效时不显示翻译入口
  dontShowIfPageLangIsTargetLang = false; // 页面语言 == 目标语言时是否隐藏翻译
  dontShowIfPageLangIsUnknown = false; // 页面语言未知时是否隐藏翻译
  dontShowIfSelectedTextIsTargetLang = false; // 选中文本语言 == 目标语言时是否隐藏翻译
  dontShowIfSelectedTextIsUnknown = false; // 选中文本语言未知时是否隐藏翻译

  hotkeys: Record<string, string> = {}; // 快捷键配置（由 manifest 或用户设置）

  expandPanelTranslateSelectedText = false; // 翻译选中文本时是否自动展开面板
  translateTag_pre = true; // 是否翻译 <pre> 标签内容
  enableIframePageTranslation = true; // 是否允许 iframe 页面翻译
  dontSortResults = false; // 是否不对翻译结果排序（一般用于调试/特殊源）

  translateDynamicallyCreatedContent = true; // 是否翻译动态生成的 DOM 内容（SPA）
  autoTranslateWhenClickingALink = false; // 点击链接时是否自动触发翻译

  translateSelectedWhenPressTwice = false; // 连续按两次快捷键时翻译选中文本
  translateTextOverMouseWhenPressTwice = false; // 连续按两次时翻译鼠标悬停文本
  translateClickingOnce = false; // 单击一次是否触发翻译（激进模式）

  enableDiskCache = false; // 是否启用本地磁盘缓存（翻译结果缓存）
  useAlternativeService = true; // 是否允许使用备用翻译服务

  showMobilePopupOnDesktop = false; // 桌面端是否显示移动端样式弹窗
  popupMobileKeepOnScren = false; // 移动端弹窗是否固定在屏幕上（不自动消失）
  popupMobilePosition: 'top' | 'bottom' = 'top'; // 移动端弹窗位置

  addPaddingToPage = false; // 是否给页面注入额外 padding（避免 UI 遮挡）

  proxyServers: Record<string, unknown> = {}; // 代理服务器配置（用于 API 转发 / 网络绕过）

  private static _instance: ConfigStore | null = null;
  private _saveTimer: ReturnType<typeof setTimeout> | null = null;

  private constructor() {}

  static async getInstance(): Promise<ConfigStore> {
    if (!ConfigStore._instance) {
      const config = new ConfigStore();
      await config.load();

      const proxy = new Proxy(config, {
        set(target, prop, value) {
          if (value !== target[prop as keyof ConfigStore]) {
            target.debounceSave();
            Reflect.set(target, prop, value);
          }
          return true;
        }
      });

      ConfigStore._instance = proxy;
    }
    return ConfigStore._instance;
  }

  async reset() {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
    }
    await storage.removeItem(STORAGE_KEY);
    const defaults = new ConfigStore();
    for (const key of Object.keys(defaults)) {
      Reflect.set(this, key, defaults[key as keyof ConfigStore]);
    }
    await this.save();
  }

  private async save() {
    const data: Record<string, unknown> = {};
    const defaults = new ConfigStore();
    for (const key of Object.keys(defaults)) {
      data[key] = (this as Record<string, unknown>)[key];
    }
    await storage.setItem(STORAGE_KEY, data);
  }

  private debounceSave() {
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => this.save(), 300);
  }

  private async load() {
    const data = await storage.getItem<Record<string, unknown>>(STORAGE_KEY);
    if (!data) return;

    const keys = Object.keys(data);
    for (const key of keys) {
      Reflect.set(this, key, data[key]);
    }
  }
}

export const config = await ConfigStore.getInstance();
