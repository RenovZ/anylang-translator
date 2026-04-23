import { i18n } from '@/lib/i18n';
import {
  AiProviderType,
  type FeatureKey,
  type Provider,
  type TranslationDisplayStyle
} from './config';

export const aiProviders: AiProviderType[] = ['go', 'zen', 'custom'];

export const goProviders = (
  [
    {
      type: 'go',
      name: 'Z.ai',
      model: 'GLM-5.1',
      models: ['GLM-5.1', 'GLM-5'],
      icon: 'zai'
    },
    {
      type: 'go',
      name: 'Kimi',
      company: 'Moonshot',
      model: 'Kimi K2.6',
      models: ['Kimi K2.6', 'Kimi K2.5'],
      icon: 'kimi'
    },
    {
      type: 'go',
      name: 'MiMo',
      company: 'Xiaomi',
      model: 'MiMo-V2-Pro',
      models: ['MiMo-V2-Pro', 'MiMo-V2-Omni'],
      icon: 'xiaomimimo'
    },
    {
      type: 'go',
      name: 'MiniMax',
      model: 'MiniMax M2.7',
      models: ['MiniMax M2.7', 'MiniMax M2.5'],
      icon: 'minimax'
    },
    {
      type: 'go',
      name: 'Qwen',
      company: 'Alibaba',
      model: 'Qwen3.6 Plus',
      models: ['Qwen3.6 Plus', 'Qwen3.5 Plus'],
      icon: 'qwen'
    }
  ] as Provider[]
).toSorted((a, b) => a.name.localeCompare(b.name));

export const zenProviders = (
  [
    {
      type: 'zen',
      name: 'Anthropic',
      model: 'Claude Opus 4.7',
      models: ['Claude Opus 4.7', 'Claude Opus 4.6'],
      icon: 'anthropic'
    },
    {
      type: 'zen',
      name: 'OpenAI',
      model: 'GPT 5.4 Pro',
      models: ['GPT 5.4 Pro', 'GPT 5.4'],
      icon: 'openai'
    },
    {
      type: 'zen',
      name: 'Gemini',
      company: 'Google',
      model: 'Gemini 3.1 Pro',
      models: ['Gemini 3.1 Pro', 'Gemini 3 Pro', 'Gemini 3 Flash'],
      icon: 'gemini'
    }
  ] as Provider[]
).toSorted((a, b) => a.name.localeCompare(b.name));

export const promptPresets = [
  { value: 'general', label: i18n('prompt_preset_general', { defaultValue: 'General' }) },
  {
    value: 'smart_select',
    label: i18n('prompt_preset_smart_select', { defaultValue: 'Smart selection' })
  },
  {
    value: 'paraphrase_master',
    label: i18n('prompt_preset_paraphrase_master', { defaultValue: 'Paraphrase master' })
  },
  {
    value: 'paragraph_summary_expert',
    label: i18n('prompt_preset_paragraph_summary', {
      defaultValue: 'Paragraph summary expert'
    })
  },
  {
    value: 'english_simplify_master',
    label: i18n('prompt_preset_english_simplify', {
      defaultValue: 'English simplification master'
    })
  },
  {
    value: 'twitter_enhancer',
    label: i18n('prompt_preset_twitter_enhancer', {
      defaultValue: 'Twitter translation enhancer'
    })
  },
  {
    value: 'tech_translation_master',
    label: i18n('prompt_preset_tech_translation', { defaultValue: 'Tech translation master' })
  },
  {
    value: 'reddit_enhancer',
    label: i18n('prompt_preset_reddit_enhancer', {
      defaultValue: 'Reddit translation enhancer'
    })
  },
  {
    value: 'paper_translation_expert',
    label: i18n('prompt_preset_paper_translation', {
      defaultValue: 'Academic paper translator'
    })
  },
  {
    value: 'news_media_translator',
    label: i18n('prompt_preset_news_media', { defaultValue: 'News media translator' })
  },
  {
    value: 'music_expert',
    label: i18n('prompt_preset_music', { defaultValue: 'Music expert' })
  },
  {
    value: 'medical_translation_master',
    label: i18n('prompt_preset_medical', { defaultValue: 'Medical translation master' })
  },
  {
    value: 'legal_industry_translator',
    label: i18n('prompt_preset_legal', { defaultValue: 'Legal industry translator' })
  },
  {
    value: 'github_enhancer',
    label: i18n('prompt_preset_github_enhancer', {
      defaultValue: 'GitHub translation enhancer'
    })
  },
  {
    value: 'game_translator',
    label: i18n('prompt_preset_game', { defaultValue: 'Game translator' })
  },
  {
    value: 'ecommerce_translation_master',
    label: i18n('prompt_preset_ecommerce', { defaultValue: 'E-commerce translation master' })
  },
  {
    value: 'finance_translation_consultant',
    label: i18n('prompt_preset_finance', { defaultValue: 'Finance translation consultant' })
  },
  {
    value: 'novel_translator',
    label: i18n('prompt_preset_novel', { defaultValue: 'Novel translator' })
  },
  {
    value: 'ao3_translator',
    label: i18n('prompt_preset_ao3', { defaultValue: 'AO3 translator' })
  },
  {
    value: 'ebook_translator',
    label: i18n('prompt_preset_ebook', { defaultValue: 'E-book translator' })
  },
  { value: 'designer', label: i18n('prompt_preset_designer', { defaultValue: 'Designer' }) },
  {
    value: 'mixed_zh_en',
    label: i18n('prompt_preset_mixed_zh_en', { defaultValue: 'Mixed Chinese-English' })
  },
  {
    value: 'web3_translation_master',
    label: i18n('prompt_preset_web3', { defaultValue: 'Web3 translation master' })
  },
  {
    value: 'more_translation_experts',
    label: i18n('prompt_preset_more_experts', { defaultValue: 'More translation experts' })
  }
];

export const translationDisplayStyles: TranslationDisplayStyle[] = [
  {
    value: 'none',
    label: i18n('translation_display_style_none', { defaultValue: 'None' }),
    styles: {}
  },
  {
    value: 'dashed_underline',
    label: i18n('translation_display_style_dashed_underline', { defaultValue: 'Dotted lines' }),
    styles: {
      textDecorationLine: 'underline',
      textDecorationStyle: 'dashed',
      textDecorationColor: '#38bdf8',
      textUnderlineOffset: '4px'
    }
  },
  {
    value: 'solid_underline',
    label: i18n('translation_display_style_solid_underline', { defaultValue: 'Straight line' }),
    styles: {
      textDecorationLine: 'underline',
      textDecorationStyle: 'solid',
      textDecorationColor: '#0ea5e9',
      textUnderlineOffset: '4px'
    }
  },
  {
    value: 'dashed_border',
    label: i18n('translation_display_style_dashed_border', { defaultValue: 'Dotted Border' }),
    styles: {
      border: '1px dashed #94a3b8',
      padding: '2px 4px'
    }
  },
  {
    value: 'solid_border',
    label: i18n('translation_display_style_solid_border', { defaultValue: 'Solid Border' }),
    styles: {
      border: '1px solid #94a3b8',
      padding: '2px 4px'
    }
  },
  {
    value: 'blur_learning',
    label: i18n('translation_display_style_blur_learning', {
      defaultValue: 'Blur effect (learning mode)'
    }),
    styles: {
      filter: 'blur(4px)'
    },
    attributes: {
      'data-anylang-translator-hover-style': 'filter_none'
    }
  },
  {
    value: 'transparent',
    label: i18n('translation_display_style_transparent', { defaultValue: 'Transparency effect' }),
    styles: {
      opacity: '0.15'
    },
    attributes: {
      'data-anylang-translator-hover-style': 'opacity_1'
    }
  },
  {
    value: 'dotted_underline',
    label: i18n('translation_display_style_dotted_underline', { defaultValue: 'Dotted lines' }),
    styles: {
      textDecorationLine: 'underline',
      textDecorationStyle: 'dotted',
      textDecorationColor: '#0ea5e9',
      textUnderlineOffset: '4px'
    }
  },
  {
    value: 'divider',
    label: i18n('translation_display_style_divider', { defaultValue: 'Dividing line' }),
    styles: {
      borderLeftWidth: '4px',
      borderLeftStyle: 'solid',
      borderLeftColor: '#60a5fa',
      paddingLeft: '12px'
    }
  },
  {
    value: 'highlight',
    label: i18n('translation_display_style_highlight', { defaultValue: 'Highlight' }),
    styles: {
      backgroundColor: '#fde047',
      padding: '0px 4px'
    }
  },
  {
    value: 'marker',
    label: i18n('translation_display_style_marker', { defaultValue: 'Marker' }),
    styles: {
      backgroundColor: '#fef08a',
      padding: '0px 4px'
    }
  },
  {
    value: 'marker2',
    label: i18n('translation_display_style_marker2', { defaultValue: 'Maker2' }),
    styles: {
      backgroundColor: '#fde047',
      padding: '0px 4px'
    }
  },
  {
    value: 'quote_style',
    label: i18n('translation_display_style_quote_style', { defaultValue: 'quote style' }),
    styles: {
      borderLeftWidth: '4px',
      borderLeftStyle: 'solid',
      borderLeftColor: '#f87171',
      paddingLeft: '12px'
    }
  },
  {
    value: 'weaken',
    label: i18n('translation_display_style_weaken', { defaultValue: 'Weaken' }),
    styles: {
      color: '#9ca3af'
    }
  },
  {
    value: 'black_gray',
    label: i18n('translation_display_style_black_gray', { defaultValue: 'Black Gray' }),
    styles: {
      color: '#1f2937'
    }
  },
  {
    value: 'white_paper_shadow',
    label: i18n('translation_display_style_white_paper_shadow', {
      defaultValue: 'White paper shadow effect'
    }),
    styles: {
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      padding: '12px'
    }
  },
  {
    value: 'italic',
    label: i18n('translation_display_style_italic', { defaultValue: 'Italic' }),
    styles: {
      fontStyle: 'italic'
    }
  },
  {
    value: 'bold',
    label: i18n('translation_display_style_bold', { defaultValue: 'Bold' }),
    styles: {
      fontWeight: '700'
    }
  },
  {
    value: 'thin_dotted_lines',
    label: i18n('translation_display_style_thin_dotted_lines', {
      defaultValue: 'Thin dotted lines'
    }),
    styles: {
      textDecorationLine: 'underline',
      textDecorationStyle: 'dotted',
      textDecorationColor: '#9ca3af',
      textUnderlineOffset: '4px'
    }
  },
  {
    value: 'wavy_lines',
    label: i18n('translation_display_style_wavy_lines', { defaultValue: 'wavy lines' }),
    styles: {
      textDecorationLine: 'underline',
      textDecorationStyle: 'wavy',
      textDecorationColor: '#38bdf8',
      textUnderlineOffset: '4px'
    }
  },
  {
    value: 'system_dotted_lines',
    label: i18n('translation_display_style_system_dotted_lines', {
      defaultValue: 'System built-in dotted lines'
    }),
    styles: {
      textDecorationLine: 'underline',
      textDecorationStyle: 'dotted',
      textUnderlineOffset: '4px'
    }
  },
  {
    value: 'system_dotted_lines_2',
    label: i18n('translation_display_style_system_dotted_lines_2', {
      defaultValue: 'System built-in dotted lines'
    }),
    styles: {
      borderBottomWidth: '1px',
      borderBottomStyle: 'dotted',
      borderBottomColor: 'currentColor'
    }
  },
  {
    value: 'system_straight_lines',
    label: i18n('translation_display_style_system_straight_lines', {
      defaultValue: 'System built-in straight lines'
    }),
    styles: {
      textDecorationLine: 'underline',
      textUnderlineOffset: '4px'
    }
  },
  {
    value: 'background',
    label: i18n('translation_display_style_background', { defaultValue: 'Background' }),
    styles: {
      backgroundColor: 'oklch(98% 0.016 73.684)',
      borderRadius: '4px',
      padding: '4px 8px'
    }
  },
  {
    value: 'custom',
    label: i18n('translation_display_style_custom', { defaultValue: 'Custom' }),
    styles: {}
  }
];

export const fontFamilyOptions = [
  { value: '', label: i18n('font_system_default', { defaultValue: 'System default' }) },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Times New Roman, Times, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'PingFang SC, Microsoft YaHei, sans-serif', label: 'PingFang SC' },
  { value: 'Microsoft YaHei, PingFang SC, sans-serif', label: 'Microsoft YaHei' },
  { value: 'Source Han Sans SC, Noto Sans SC, sans-serif', label: 'Source Han Sans SC' },
  { value: 'Noto Sans SC, Source Han Sans SC, sans-serif', label: 'Noto Sans SC' }
];

export const allFeatures: { key: FeatureKey; label: string }[] = [
  {
    key: 'pageTranslation',
    label: i18n('feature_page_translation', { defaultValue: 'Page Translation' })
  },
  {
    key: 'videoSubtitles',
    label: i18n('feature_video_subtitles', { defaultValue: 'Video Subtitles' })
  },
  {
    key: 'selectionToolbarTranslation',
    label: i18n('feature_selection_toolbar', { defaultValue: 'Selection Toolbar Translation' })
  },
  {
    key: 'inputTranslation',
    label: i18n('feature_input_translation', { defaultValue: 'Input Translation' })
  },
  {
    key: 'imageTranslation',
    label: i18n('feature_image_translation', { defaultValue: 'Image Translation' })
  },
  {
    key: 'improveWriting',
    label: i18n('feature_improve_writing', { defaultValue: 'Improve Writing' })
  },
  { key: 'dictionary', label: i18n('feature_dictionary', { defaultValue: 'Dictionary' }) },
  {
    key: 'customAiAction',
    label: i18n('feature_custom_ai_action', { defaultValue: 'Custom AI Action' })
  }
];
