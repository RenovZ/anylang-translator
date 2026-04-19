import i18n from '@/lib/i18n';

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

export { navItems, legacyToggleModeMap, alwaysTranslateSites };
