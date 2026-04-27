import i18n from '@/lib/i18n';
import { AiProviderType, type FeatureKey, type FeatureValue, type Provider } from '../types';

export const allFeatures: Record<FeatureKey, string> = {
  pageTranslation: i18n('feature_page_translation', { defaultValue: 'Page Translation' }),
  videoSubtitles: i18n('feature_video_subtitles', { defaultValue: 'Video Subtitles' }),
  selectionToolbarTranslation: i18n('feature_selection_toolbar', {
    defaultValue: 'Selection Toolbar Translation'
  }),
  inputTranslation: i18n('feature_input_translation', { defaultValue: 'Input Translation' }),
  imageTranslation: i18n('feature_image_translation', { defaultValue: 'Image Translation' }),
  improveWriting: i18n('feature_improve_writing', { defaultValue: 'Improve Writing' }),
  dictionary: i18n('feature_dictionary', { defaultValue: 'Dictionary' }),
  customAiAction: i18n('feature_custom_ai_action', { defaultValue: 'Custom AI Action' })
};

export const defaultFeatures: Record<FeatureKey, FeatureValue> = {
  pageTranslation: { state: false },
  videoSubtitles: { state: false },
  selectionToolbarTranslation: { state: false },
  inputTranslation: { state: false },
  imageTranslation: { state: false },
  improveWriting: { state: false },
  dictionary: { state: false },
  customAiAction: { state: false }
};

const defaultOpenedFeatures: Record<FeatureKey, FeatureValue> = {
  pageTranslation: { disabled: true, state: true },
  videoSubtitles: { disabled: true, state: true },
  selectionToolbarTranslation: { disabled: true, state: true },
  inputTranslation: { disabled: true, state: true },
  imageTranslation: { disabled: true, state: true },
  improveWriting: { disabled: true, state: true },
  dictionary: { disabled: true, state: true },
  customAiAction: { disabled: true, state: true }
} as const;

export const bingTranslatorProvider: Provider = {
  type: 'free',
  name: 'Bing Translator',
  icon: 'bing',
  features: {
    ...defaultOpenedFeatures,
    imageTranslation: { unsupported: true },
    improveWriting: { unsupported: true },
    dictionary: { unsupported: true },
    customAiAction: { unsupported: true }
  }
} as const;

export const googleTranslatorProvider: Provider = {
  type: 'free',
  name: 'Google Translator',
  icon: 'google',
  features: {
    ...defaultOpenedFeatures,
    imageTranslation: { unsupported: true },
    improveWriting: { unsupported: true },
    dictionary: { unsupported: true },
    customAiAction: { unsupported: true }
  }
} as const;

export const aiProviders: AiProviderType[] = ['go', 'zen', 'custom'];

export const goProviders = (
  [
    {
      type: 'go',
      name: 'DeepSeek',
      model: 'DeepSeek-V4-Pro',
      models: ['DeepSeek-V4-Pro', 'DeepSeek-V4-Flash'],
      icon: 'deepseek',
      features: { ...defaultOpenedFeatures } as const
    },
    {
      type: 'go',
      name: 'Z.ai',
      model: 'GLM-5.1',
      models: ['GLM-5.1', 'GLM-5'],
      icon: 'zai',
      features: { ...defaultOpenedFeatures } as const
    },
    {
      type: 'go',
      name: 'Kimi',
      company: 'Moonshot',
      model: 'Kimi K2.6',
      models: ['Kimi K2.6', 'Kimi K2.5'],
      icon: 'kimi',
      features: { ...defaultOpenedFeatures } as const
    },
    {
      type: 'go',
      name: 'MiMo',
      company: 'Xiaomi',
      model: 'MiMo-V2-Pro',
      models: ['MiMo-V2-Pro', 'MiMo-V2-Omni'],
      icon: 'xiaomimimo',
      features: { ...defaultOpenedFeatures } as const
    },
    {
      type: 'go',
      name: 'MiniMax',
      model: 'MiniMax M2.7',
      models: ['MiniMax M2.7', 'MiniMax M2.5'],
      icon: 'minimax',
      features: { ...defaultOpenedFeatures } as const
    },
    {
      type: 'go',
      name: 'Qwen',
      company: 'Alibaba',
      model: 'Qwen3.6 Plus',
      models: ['Qwen3.6 Plus', 'Qwen3.5 Plus'],
      icon: 'qwen',
      features: { ...defaultOpenedFeatures } as const
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
      icon: 'anthropic',
      features: { ...defaultOpenedFeatures } as const
    },
    {
      type: 'zen',
      name: 'OpenAI',
      model: 'GPT 5.4 Pro',
      models: ['GPT 5.4 Pro', 'GPT 5.4'],
      icon: 'openai',
      features: { ...defaultOpenedFeatures } as const
    },
    {
      type: 'zen',
      name: 'Gemini',
      company: 'Google',
      model: 'Gemini 3.1 Pro',
      models: ['Gemini 3.1 Pro', 'Gemini 3 Pro', 'Gemini 3 Flash'],
      icon: 'gemini',
      features: { ...defaultOpenedFeatures } as const
    }
  ] as Provider[]
).toSorted((a, b) => a.name.localeCompare(b.name));
