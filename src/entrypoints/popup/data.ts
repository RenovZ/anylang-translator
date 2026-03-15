export type ConfigRowKey = "provider" | "model" | "promptPreset";

export type ConfigRow = {
  key: ConfigRowKey;
  label: string;
  value: string;
  options: string[];
};

export type ToggleItem = {
  key: string;
  label: string;
  enabled: boolean;
  hasMenu: boolean;
  options?: string[];
};

export type PopupConfig = {
  sourceLanguage: string;
  targetLanguage: string;
  provider: string;
  model: string;
  promptPreset: string;
  toggles: Record<string, boolean>;
};

export const sourceLanguageOptions = [
  "自动检测",
  "英语(English)",
  "日语",
  "韩语",
  "法语",
  "德语",
];

export const targetLanguageOptions = [
  "简体中文",
  "英语(English)",
  "日语",
  "韩语",
  "法语",
  "德语",
];

export const languageOptions = [
  { value: "英语(English)", hint: "自动检测" },
  { value: "简体中文", hint: "目标语言" },
];

export const providerOptions = [
  "OpenAI",
  "Google (Vertex AI)",
  "Anthropic (Claude)",
  "AWS",
  "Google (GenAI)",
  "Ollama",
  "Groq",
  "Hugging Face",
  "Mistral AI",
  "Cohere",
  "Fireworks",
  "xAI (Grok)",
  "DeepSeek",
  "Perplexity",
  "Azure AI",
  "NVIDIA AI Endpoints",
  "IBM",
  "Together",
  "OpenRouter",
];

export const modelOptionsByProvider: Record<string, string[]> = {
  OpenAI: ["gpt-4.1-mini", "gpt-4.1", "gpt-4o-mini"],
  "Google (Vertex AI)": ["gemini-2.5-flash", "gemini-2.5-pro"],
  "Anthropic (Claude)": ["claude-3-5-haiku", "claude-3-7-sonnet"],
  AWS: ["amazon.nova-lite", "amazon.nova-pro"],
  "Google (GenAI)": ["gemini-2.5-flash", "gemini-2.5-pro"],
  Ollama: ["qwen3.5-2b", "llama3.2", "deepseek-r1:7b"],
  Groq: ["llama-3.3-70b", "deepseek-r1-distill-llama-70b"],
  "Hugging Face": ["Qwen/Qwen2.5-7B-Instruct", "mistralai/Mistral-7B-Instruct-v0.3"],
  "Mistral AI": ["mistral-small-latest", "ministral-8b-latest"],
  Cohere: ["command-r", "command-r-plus"],
  Fireworks: ["accounts/fireworks/models/deepseek-v3", "accounts/fireworks/models/qwen2p5-coder-32b"],
  "xAI (Grok)": ["grok-2-latest", "grok-2-mini"],
  DeepSeek: ["deepseek-chat", "deepseek-reasoner"],
  Perplexity: ["sonar", "sonar-pro"],
  "Azure AI": ["gpt-4.1-mini", "gpt-4o-mini"],
  "NVIDIA AI Endpoints": ["meta/llama-3.1-70b-instruct", "nvidia/llama-3.1-nemotron-70b-instruct"],
  IBM: ["granite-3.2-8b-instruct", "granite-3.1-2b-instruct"],
  Together: ["meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", "Qwen/Qwen2.5-72B-Instruct-Turbo"],
  OpenRouter: ["openai/gpt-4o-mini", "anthropic/claude-3.5-sonnet", "google/gemini-2.0-flash-001"],
};

export const promptPresetOptions = [
  "通用",
  "智能选择",
  "意译大师",
  "段落总结专家",
  "英文简化大师",
  "Twitter 翻译增强器",
  "科技类翻译大师",
  "Reddit 翻译增强器",
  "学术论文翻译师",
  "新闻媒体译者",
  "音乐专家",
  "医学翻译大师",
  "法律行业译者",
  "GitHub 翻译增强器",
  "游戏译者",
  "电商翻译大师",
  "金融翻译顾问",
  "小说译者",
  "AO3 译者",
  "电子书译者",
  "设计师",
  "中英杂杂",
  "Web3 翻译大师",
  "更多翻译专家",
];

export const configRows: ConfigRow[] = [
  {
    key: "provider",
    label: "供应商",
    value: "Ollama",
    options: providerOptions,
  },
  {
    key: "model",
    label: "模型",
    value: modelOptionsByProvider.Ollama[0],
    options: modelOptionsByProvider.Ollama,
  },
  {
    key: "promptPreset",
    label: "提示词",
    value: "通用",
    options: promptPresetOptions,
  },
];

export const toggles: ToggleItem[] = [
  {
    key: "alwaysTranslateSite",
    label: "总是翻译该网站",
    enabled: false,
    hasMenu: true,
    options: ["总是翻译该网站", "不自动翻译该网站"],
  },
  {
    key: "hoverTrigger",
    label: "鼠标悬停: ＋ Ctrl 翻译/还原该段",
    enabled: true,
    hasMenu: true,
    options: [
      "＋ Ctrl 翻译/还原该段",
      "＋ Shift 翻译/还原该段",
      "＋ Alt 翻译/还原该段",
      "＋ 长按鼠标左键",
      "直接翻译该段",
      "自定义快捷键(打开设置)",
    ],
  },
  {
    key: "selectionTrigger",
    label: "划词翻译: 显示小圆点",
    enabled: true,
    hasMenu: true,
    options: [
      "直接触发",
      "显示图标",
      "显示小圆点",
      "按 Ctrl 触发",
      "按 Shift 触发",
      "按 Alt 触发",
    ],
  },
  {
    key: "alwaysTranslateChinesePage",
    label: "总是翻译简体中文页面",
    enabled: false,
    hasMenu: false,
  },
  {
    key: "autoBilingualSubtitle",
    label: "自动开启双语字幕",
    enabled: false,
    hasMenu: false,
  },
];

export const defaultPopupConfig: PopupConfig = {
  sourceLanguage: languageOptions[0].value,
  targetLanguage: languageOptions[1].value,
  provider: configRows[0].value,
  model: configRows[1].value,
  promptPreset: configRows[2].value,
  toggles: Object.fromEntries(toggles.map((item) => [item.key, item.enabled])),
};

export const quickActions = [
  { label: "文档翻译", icon: "📄" },
  { label: "文本翻译", icon: "T" },
  { label: "工具箱", icon: "⚒️" },
];

export const moreItems = [
  { icon: "📙", label: "使用说明" },
  { icon: "🕒", label: "临时切换默认译文模式为仅显示译文" },
  { icon: "🪄", label: "切换为朗译所有区域" },
  { icon: "💪", label: "开启侧边栏翻译" },
  { icon: "⚡", label: "立即翻译到页面底部" },
  { icon: "📘", label: "阅读本地电子书" },
  { icon: "📗", label: "制作双语 EPUB 电子书" },
  { icon: "📕", label: "BabelDOC 保留排版 PDF 翻译" },
  { icon: "🗂️", label: "翻译本地 PDF 文件" },
  { icon: "🟢", label: "AI 驱动的 PDF Pro 翻译" },
  { icon: "🌐", label: "翻译 HTML/txt 文件" },
  { icon: "🎞️", label: "翻译本地字幕文件" },
  { icon: "⭕", label: "禁用悬浮球" },
  { icon: "🖊️", label: "临时开启译文编辑" },
  { icon: "🔥", label: "免费试用 Pro 会员" },
  { icon: "🧹", label: "清除缓存" },
  { icon: "💬", label: "反馈当前页面翻译问题" },
  { icon: "👍", label: "去商店评价" },
  { icon: "❤️", label: "关于 - 反馈" },
];
