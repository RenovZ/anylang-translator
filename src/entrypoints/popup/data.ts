import i18n from '@/lib/i18n';

export const selectionTranslateToggle = {
  label: i18n('selection_translate', {
    defaultValue: 'Selection translate'
  }),
  options: [
    {
      value: 'directly',
      label: i18n('selection_translate_directly', { defaultValue: 'Directly' })
    },
    {
      value: 'show icons',
      label: i18n('selection_translate_show_icons', { defaultValue: 'Show icons' })
    }
  ]
};

export const quickActions = [
  {
    label: i18n('quick_action_doc_translate', { defaultValue: 'Document Translate' }),
    icon: '📄',
    description: i18n('quick_action_doc_translate_description', {
      defaultValue: 'Translate PDF, ePub, docx, srt, ass, HTML, TXT, and Markdown files.'
    })
  },
  {
    label: i18n('quick_action_text_translate', { defaultValue: 'Text Translate' }),
    icon: 'T'
  },
  { label: i18n('quick_action_toolbox', { defaultValue: 'Toolbox' }), icon: '⚒️' }
];

export const moreItems = [
  { icon: '📙', label: i18n('more_item_user_guide', { defaultValue: 'User guide' }) },
  {
    icon: '🕒',
    label: i18n('more_item_temp_translation_only', {
      defaultValue: 'Temporarily set default mode to translation-only'
    })
  },
  {
    icon: '🪄',
    label: i18n('more_item_translate_all_regions', {
      defaultValue: 'Switch to translating all regions'
    })
  },
  {
    icon: '💪',
    label: i18n('more_item_enable_sidebar', { defaultValue: 'Enable sidebar translation' })
  },
  {
    icon: '⚡',
    label: i18n('more_item_translate_to_bottom', {
      defaultValue: 'Translate to page bottom now'
    })
  },
  {
    icon: '📘',
    label: i18n('more_item_read_local_ebook', { defaultValue: 'Read local e-book' })
  },
  {
    icon: '📗',
    label: i18n('more_item_make_bilingual_epub', {
      defaultValue: 'Create bilingual EPUB e-book'
    })
  },
  {
    icon: '📕',
    label: i18n('more_item_babeldoc_pdf_translate', {
      defaultValue: 'BabelDOC layout-preserving PDF translation'
    })
  },
  {
    icon: '🗂️',
    label: i18n('more_item_local_pdf_translate', { defaultValue: 'Translate local PDF file' })
  },
  {
    icon: '🟢',
    label: i18n('more_item_ai_pdf_pro_translate', {
      defaultValue: 'AI-powered PDF Pro translation'
    })
  },
  {
    icon: '🌐',
    label: i18n('more_item_html_txt_translate', { defaultValue: 'Translate HTML/txt files' })
  },
  {
    icon: '🎞️',
    label: i18n('more_item_subtitle_file_translate', {
      defaultValue: 'Translate local subtitle files'
    })
  },
  {
    icon: '⭕',
    label: i18n('more_item_disable_floating_ball', { defaultValue: 'Disable floating ball' })
  },
  {
    icon: '🖊️',
    label: i18n('more_item_enable_edit_translation', {
      defaultValue: 'Temporarily enable translation editing'
    })
  },
  {
    icon: '🔥',
    label: i18n('more_item_try_pro', { defaultValue: 'Try Pro membership for free' })
  },
  { icon: '🧹', label: i18n('more_item_clear_cache', { defaultValue: 'Clear cache' }) },
  {
    icon: '💬',
    label: i18n('more_item_feedback_page_translation', {
      defaultValue: 'Report translation issue on this page'
    })
  },
  { icon: '👍', label: i18n('more_item_rate_store', { defaultValue: 'Rate in store' }) },
  {
    icon: '❤️',
    label: i18n('more_item_about_feedback', { defaultValue: 'About - Feedback' })
  }
];
