import i18n from "@/lib/i18n";

const navItems = [
  {
    id: 'general',
    label: i18n('options_nav_general', { defaultValue: 'General settings' }),
    position: 'top'
  },
  {
    id: 'services',
    label: i18n('options_nav_services', { defaultValue: 'Translation services' }),
    position: 'top'
  },
  { id: 'ai', label: i18n('options_nav_ai', { defaultValue: 'AI experts' }), position: 'top' },
  {
    id: 'terms',
    label: i18n('options_nav_terms', { defaultValue: 'AI terminology' }),
    position: 'top'
  },
  {
    id: 'writing',
    label: i18n('options_nav_writing', { defaultValue: 'AI Write' }),
    position: 'top'
  },
  {
    id: 'subtitle',
    label: i18n('options_nav_subtitle', { defaultValue: 'Video subtitles' }),
    position: 'top'
  },
  {
    id: 'manga',
    label: i18n('options_nav_manga', { defaultValue: 'Manga/Images' }),
    position: 'top'
  },
  {
    id: 'input',
    label: i18n('options_nav_input', { defaultValue: 'Input translation' }),
    position: 'top'
  },
  {
    id: 'selection-transiation',
    label: i18n('options_nav_selection_translation', { defaultValue: 'Selection translation' }),
    position: 'top'
  },
  {
    id: 'mouse-hover',
    label: i18n('options_nav_mouse_hover', { defaultValue: 'Mouse hover' }),
    position: 'top'
  },
  {
    id: 'floating',
    label: i18n('options_nav_floating', { defaultValue: 'Floating ball' }),
    position: 'top'
  },
  {
    id: 'shortcuts',
    label: i18n('options_nav_shortcuts', { defaultValue: 'Shortcuts' }),
    position: 'top'
  },
  {
    id: 'advanced',
    label: i18n('options_nav_advanced', { defaultValue: 'Advanced settings' }),
    position: 'top'
  },
  {
    id: 'import-export',
    label: i18n('options_nav_import_export', { defaultValue: 'Import/Export' }),
    position: 'top'
  },
  {
    id: 'about',
    label: i18n('options_nav_about', { defaultValue: 'About' }),
    position: 'top'
  },
  {
    id: 'pricing',
    label: i18n('options_nav_pricing', { defaultValue: 'Pricing' }),
    position: 'bottom'
  },
  {
    id: 'docs',
    label: i18n('options_nav_docs', { defaultValue: 'Documentation' }),
    position: 'bottom'
  },
  {
    id: 'changelog',
    label: i18n('options_nav_changelog', { defaultValue: 'Changelog' }),
    position: 'bottom'
  },
  {
    id: 'feedback',
    label: i18n('options_nav_feedback', { defaultValue: 'Feedback' }),
    position: 'bottom'
  },
  {
    id: 'developer',
    label: i18n('options_nav_developer', { defaultValue: 'Developer settings' }),
    position: 'bottom'
  }
] as const;

const legacyPromptPresetMap: Record<string, string> = {
  通用: 'general',
  智能选择: 'smart_select',
  意译大师: 'paraphrase_master',
  段落总结专家: 'paragraph_summary_expert',
  英文简化大师: 'english_simplify_master',
  'Twitter 翻译增强器': 'twitter_enhancer',
  科技类翻译大师: 'tech_translation_master',
  'Reddit 翻译增强器': 'reddit_enhancer',
  学术论文翻译师: 'paper_translation_expert',
  新闻媒体译者: 'news_media_translator',
  音乐专家: 'music_expert',
  医学翻译大师: 'medical_translation_master',
  法律行业译者: 'legal_industry_translator',
  'GitHub 翻译增强器': 'github_enhancer',
  游戏译者: 'game_translator',
  电商翻译大师: 'ecommerce_translation_master',
  金融翻译顾问: 'finance_translation_consultant',
  小说译者: 'novel_translator',
  'AO3 译者': 'ao3_translator',
  电子书译者: 'ebook_translator',
  设计师: 'designer',
  中英杂杂: 'mixed_zh_en',
  'Web3 翻译大师': 'web3_translation_master',
  更多翻译专家: 'more_translation_experts'
};

const legacyLanguageMap: Record<string, string> = {
  自动检测: 'auto',
  简体中文: 'zh-Hans',
  '英语(English)': 'en',
  英语: 'en',
  English: 'en',
  日语: 'ja',
  韩语: 'ko',
  法语: 'fr',
  德语: 'de'
};

const legacyToggleModeMap: Record<string, Record<string, string>> = {
  alwaysTranslateSite: {
    总是翻译该网站: 'always_translate_site',
    不自动翻译该网站: 'never_auto_translate_site'
  },
  hoverTrigger: {
    '＋ Ctrl 翻译/还原该段': 'ctrl',
    '＋ Shift 翻译/还原该段': 'shift',
    '＋ Alt 翻译/还原该段': 'alt',
    '＋ 长按鼠标左键': 'long_press_left_click',
    直接翻译该段: 'direct',
    '自定义快捷键(打开设置)': 'custom_shortcut'
  },
  selectionTrigger: {
    直接触发: 'direct',
    显示图标: 'icon',
    显示小圆点: 'dot',
    '按 Ctrl 触发': 'ctrl',
    '按 Shift 触发': 'shift',
    '按 Alt 触发': 'alt'
  }
};

const alwaysTranslateSites = [
  'twitter.com',
  'x.com',
  'www.reddit.com',
  'www.kadaza.com',
  'en.wikipedia.org',
  '*.medium.com',
  'news.ycombinator.com'
];

export {
  navItems,
  legacyPromptPresetMap,
  legacyLanguageMap,
  legacyToggleModeMap,
  alwaysTranslateSites,
}
