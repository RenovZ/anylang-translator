import { i18n } from '@/lib/i18n';

export type ConfigRowKey = 'provider' | 'model' | 'promptPreset';

export type LocalizedOption = {
  value: string;
  label: string;
};

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
  options?: LocalizedOption[];
};

const languageLabelByValue: Record<string, string> = {
  auto: i18n('popup_language_auto', { defaultValue: 'Auto detect' }),
  'zh-Hans': i18n('popup_language_zh_hans', { defaultValue: 'Chinese (Simplified)' }),
  en: i18n('popup_language_en', { defaultValue: 'English' }),
  ja: i18n('popup_language_ja', { defaultValue: 'Japanese' }),
  ko: i18n('popup_language_ko', { defaultValue: 'Korean' }),
  fr: i18n('popup_language_fr', { defaultValue: 'French' }),
  de: i18n('popup_language_de', { defaultValue: 'German' })
};

export const languageOptions = [
  {
    value: 'en',
    hint: i18n('popup_language_source_hint', { defaultValue: 'Auto detect' })
  },
  {
    value: 'zh-Hans',
    hint: i18n('popup_language_target_hint', { defaultValue: 'Target language' })
  }
];

export function getLanguageLabel(value: string): string {
  return languageLabelByValue[value] ?? value;
}

export const promptPresetOptions: LocalizedOption[] = [
  { value: 'general', label: i18n('popup_prompt_preset_general', { defaultValue: 'General' }) },
  {
    value: 'smart_select',
    label: i18n('popup_prompt_preset_smart_select', { defaultValue: 'Smart selection' })
  },
  {
    value: 'paraphrase_master',
    label: i18n('popup_prompt_preset_paraphrase_master', { defaultValue: 'Paraphrase master' })
  },
  {
    value: 'paragraph_summary_expert',
    label: i18n('popup_prompt_preset_paragraph_summary', {
      defaultValue: 'Paragraph summary expert'
    })
  },
  {
    value: 'english_simplify_master',
    label: i18n('popup_prompt_preset_english_simplify', {
      defaultValue: 'English simplification master'
    })
  },
  {
    value: 'twitter_enhancer',
    label: i18n('popup_prompt_preset_twitter_enhancer', {
      defaultValue: 'Twitter translation enhancer'
    })
  },
  {
    value: 'tech_translation_master',
    label: i18n('popup_prompt_preset_tech_translation', { defaultValue: 'Tech translation master' })
  },
  {
    value: 'reddit_enhancer',
    label: i18n('popup_prompt_preset_reddit_enhancer', {
      defaultValue: 'Reddit translation enhancer'
    })
  },
  {
    value: 'paper_translation_expert',
    label: i18n('popup_prompt_preset_paper_translation', {
      defaultValue: 'Academic paper translator'
    })
  },
  {
    value: 'news_media_translator',
    label: i18n('popup_prompt_preset_news_media', { defaultValue: 'News media translator' })
  },
  {
    value: 'music_expert',
    label: i18n('popup_prompt_preset_music', { defaultValue: 'Music expert' })
  },
  {
    value: 'medical_translation_master',
    label: i18n('popup_prompt_preset_medical', { defaultValue: 'Medical translation master' })
  },
  {
    value: 'legal_industry_translator',
    label: i18n('popup_prompt_preset_legal', { defaultValue: 'Legal industry translator' })
  },
  {
    value: 'github_enhancer',
    label: i18n('popup_prompt_preset_github_enhancer', {
      defaultValue: 'GitHub translation enhancer'
    })
  },
  {
    value: 'game_translator',
    label: i18n('popup_prompt_preset_game', { defaultValue: 'Game translator' })
  },
  {
    value: 'ecommerce_translation_master',
    label: i18n('popup_prompt_preset_ecommerce', { defaultValue: 'E-commerce translation master' })
  },
  {
    value: 'finance_translation_consultant',
    label: i18n('popup_prompt_preset_finance', { defaultValue: 'Finance translation consultant' })
  },
  {
    value: 'novel_translator',
    label: i18n('popup_prompt_preset_novel', { defaultValue: 'Novel translator' })
  },
  {
    value: 'ao3_translator',
    label: i18n('popup_prompt_preset_ao3', { defaultValue: 'AO3 translator' })
  },
  {
    value: 'ebook_translator',
    label: i18n('popup_prompt_preset_ebook', { defaultValue: 'E-book translator' })
  },
  { value: 'designer', label: i18n('popup_prompt_preset_designer', { defaultValue: 'Designer' }) },
  {
    value: 'mixed_zh_en',
    label: i18n('popup_prompt_preset_mixed_zh_en', { defaultValue: 'Mixed Chinese-English' })
  },
  {
    value: 'web3_translation_master',
    label: i18n('popup_prompt_preset_web3', { defaultValue: 'Web3 translation master' })
  },
  {
    value: 'more_translation_experts',
    label: i18n('popup_prompt_preset_more_experts', { defaultValue: 'More translation experts' })
  }
];

const promptPresetLabelByValue = Object.fromEntries(
  promptPresetOptions.map((option) => [option.value, option.label])
);

export function getPromptPresetLabel(value: string): string {
  return promptPresetLabelByValue[value] ?? value;
}

export const providers: ConfigRow[] = [
  {
    key: 'provider',
    label: i18n('popup_config_provider', { defaultValue: 'Provider' }),
    value: 'Ollama',
    options: providerOptions
  },
  {
    key: 'model',
    label: i18n('popup_config_model', { defaultValue: 'Model' }),
    value: modelOptionsByProvider.Ollama[0],
    options: modelOptionsByProvider.Ollama
  },
  {
    key: 'promptPreset',
    label: i18n('popup_config_prompt_preset', { defaultValue: 'Prompt' }),
    value: promptPresetOptions[0]?.value ?? '',
    options: promptPresetOptions.map((option) => option.value)
  }
];

export const toggles: ToggleItem[] = [
  {
    key: 'alwaysTranslateSite',
    label: i18n('popup_toggle_always_translate_site', {
      defaultValue: 'Always translate this site'
    }),
    enabled: false,
    hasMenu: true,
    options: [
      {
        value: 'always_translate_site',
        label: i18n('popup_toggle_mode_always_translate_site', {
          defaultValue: 'Always translate this site'
        })
      },
      {
        value: 'never_auto_translate_site',
        label: i18n('popup_toggle_mode_never_auto_translate_site', {
          defaultValue: 'Do not auto-translate this site'
        })
      }
    ]
  },
  {
    key: 'hoverTrigger',
    label: i18n('popup_toggle_hover_trigger', {
      defaultValue: 'Hover trigger: + Ctrl to translate/restore paragraph'
    }),
    enabled: true,
    hasMenu: true,
    options: [
      {
        value: 'ctrl',
        label: i18n('popup_toggle_mode_hover_ctrl', {
          defaultValue: '+ Ctrl to translate/restore paragraph'
        })
      },
      {
        value: 'shift',
        label: i18n('popup_toggle_mode_hover_shift', {
          defaultValue: '+ Shift to translate/restore paragraph'
        })
      },
      {
        value: 'alt',
        label: i18n('popup_toggle_mode_hover_alt', {
          defaultValue: '+ Alt to translate/restore paragraph'
        })
      },
      {
        value: 'long_press_left_click',
        label: i18n('popup_toggle_mode_hover_long_press', {
          defaultValue: '+ Long press left mouse button'
        })
      },
      {
        value: 'direct',
        label: i18n('popup_toggle_mode_hover_direct', {
          defaultValue: 'Directly translate paragraph'
        })
      },
      {
        value: 'custom_shortcut',
        label: i18n('popup_toggle_mode_hover_custom_shortcut', {
          defaultValue: 'Custom shortcut (open settings)'
        })
      }
    ]
  },
  {
    key: 'selectionTrigger',
    label: i18n('popup_toggle_selection_trigger', {
      defaultValue: 'Selection translation: Show small dot'
    }),
    enabled: true,
    hasMenu: true,
    options: [
      {
        value: 'direct',
        label: i18n('popup_toggle_mode_selection_direct', { defaultValue: 'Direct trigger' })
      },
      {
        value: 'icon',
        label: i18n('popup_toggle_mode_selection_icon', { defaultValue: 'Show icon' })
      },
      {
        value: 'dot',
        label: i18n('popup_toggle_mode_selection_dot', { defaultValue: 'Show small dot' })
      },
      {
        value: 'ctrl',
        label: i18n('popup_toggle_mode_selection_ctrl', { defaultValue: 'Trigger with Ctrl' })
      },
      {
        value: 'shift',
        label: i18n('popup_toggle_mode_selection_shift', { defaultValue: 'Trigger with Shift' })
      },
      {
        value: 'alt',
        label: i18n('popup_toggle_mode_selection_alt', { defaultValue: 'Trigger with Alt' })
      }
    ]
  },
  {
    key: 'alwaysTranslateChinesePage',
    label: i18n('popup_toggle_always_translate_chinese_page', {
      defaultValue: 'Always translate Chinese (Simplified) pages'
    }),
    enabled: false,
    hasMenu: false
  },
  {
    key: 'autoBilingualSubtitle',
    label: i18n('popup_toggle_auto_bilingual_subtitle', {
      defaultValue: 'Auto-enable bilingual subtitles'
    }),
    enabled: false,
    hasMenu: false
  }
];

export const quickActions = [
  {
    label: i18n('popup_quick_action_doc_translate', { defaultValue: 'Document Translate' }),
    icon: '📄',
    description: i18n('popup_quick_action_doc_translate_description', {
      defaultValue: 'Translate PDF, ePub, docx, srt, ass, HTML, TXT, and Markdown files.'
    })
  },
  {
    label: i18n('popup_quick_action_text_translate', { defaultValue: 'Text Translate' }),
    icon: 'T'
  },
  { label: i18n('popup_quick_action_toolbox', { defaultValue: 'Toolbox' }), icon: '⚒️' }
];

export const moreItems = [
  { icon: '📙', label: i18n('popup_more_item_user_guide', { defaultValue: 'User guide' }) },
  {
    icon: '🕒',
    label: i18n('popup_more_item_temp_translation_only', {
      defaultValue: 'Temporarily set default mode to translation-only'
    })
  },
  {
    icon: '🪄',
    label: i18n('popup_more_item_translate_all_regions', {
      defaultValue: 'Switch to translating all regions'
    })
  },
  {
    icon: '💪',
    label: i18n('popup_more_item_enable_sidebar', { defaultValue: 'Enable sidebar translation' })
  },
  {
    icon: '⚡',
    label: i18n('popup_more_item_translate_to_bottom', {
      defaultValue: 'Translate to page bottom now'
    })
  },
  {
    icon: '📘',
    label: i18n('popup_more_item_read_local_ebook', { defaultValue: 'Read local e-book' })
  },
  {
    icon: '📗',
    label: i18n('popup_more_item_make_bilingual_epub', {
      defaultValue: 'Create bilingual EPUB e-book'
    })
  },
  {
    icon: '📕',
    label: i18n('popup_more_item_babeldoc_pdf_translate', {
      defaultValue: 'BabelDOC layout-preserving PDF translation'
    })
  },
  {
    icon: '🗂️',
    label: i18n('popup_more_item_local_pdf_translate', { defaultValue: 'Translate local PDF file' })
  },
  {
    icon: '🟢',
    label: i18n('popup_more_item_ai_pdf_pro_translate', {
      defaultValue: 'AI-powered PDF Pro translation'
    })
  },
  {
    icon: '🌐',
    label: i18n('popup_more_item_html_txt_translate', { defaultValue: 'Translate HTML/txt files' })
  },
  {
    icon: '🎞️',
    label: i18n('popup_more_item_subtitle_file_translate', {
      defaultValue: 'Translate local subtitle files'
    })
  },
  {
    icon: '⭕',
    label: i18n('popup_more_item_disable_floating_ball', { defaultValue: 'Disable floating ball' })
  },
  {
    icon: '🖊️',
    label: i18n('popup_more_item_enable_edit_translation', {
      defaultValue: 'Temporarily enable translation editing'
    })
  },
  {
    icon: '🔥',
    label: i18n('popup_more_item_try_pro', { defaultValue: 'Try Pro membership for free' })
  },
  { icon: '🧹', label: i18n('popup_more_item_clear_cache', { defaultValue: 'Clear cache' }) },
  {
    icon: '💬',
    label: i18n('popup_more_item_feedback_page_translation', {
      defaultValue: 'Report translation issue on this page'
    })
  },
  { icon: '👍', label: i18n('popup_more_item_rate_store', { defaultValue: 'Rate in store' }) },
  {
    icon: '❤️',
    label: i18n('popup_more_item_about_feedback', { defaultValue: 'About - Feedback' })
  }
];
