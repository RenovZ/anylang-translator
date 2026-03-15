export const languageOptions = [
  { value: "英语(English)", hint: "自动检测" },
  { value: "简体中文", hint: "目标语言" },
];

export const configRows = [
  {
    label: "供应商", value: "Ollama", options: [
      "Ollama",
      // TODO: 根据第二张图补充完整对应的模型供应商
    ] },
  {
    label: "模型", value: "qwen3.5-2b", options: [
    //TODO: 根据供应商补充完成相关的模型
    ] },
  {
    label: "提示词", value: "通用", options: [
      "通用",
      "智能选择",
      "意译大师",
      //TODO: 根据第一张图补充完成余下的选项
    ] },
];

export const toggles = [
  { label: "总是翻译该网站", enabled: false, hasMenu: true },
  { label: "鼠标悬停: ＋ Ctrl 翻译/还原该段", enabled: true, hasMenu: true },
  { label: "划词翻译: 显示小圆点", enabled: true, hasMenu: true },
  { label: "总是翻译简体中文页面", enabled: false, hasMenu: false },
  { label: "自动开启双语字幕", enabled: false, hasMenu: false },
];

export const quickActions = [
  { label: "文档翻译", icon: "📄" },
  { label: "文本翻译", icon: "T" },
  { label: "工具箱", icon: "⚒️" },
];
