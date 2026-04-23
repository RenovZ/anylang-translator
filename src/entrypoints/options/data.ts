import i18n from '@/lib/i18n';

export const navItems = [
  {
    id: 'general',
    label: i18n('general', { defaultValue: 'General' }),
    position: 'top'
  },
  {
    id: 'api-providers',
    label: i18n('api_providers', { defaultValue: 'API Providers' }),
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
