import i18n from '@/lib/i18n';
import type { AiProviderType, FeatureItem, FeatureKey, FeatureValue, Provider } from '../types';

// Ordered feature definitions for consistent UI rendering (array order = display order)
export const featureItems: FeatureItem[] = [
  {
    key: 'quickTranslate',
    label: i18n('feature_quick_translate', { defaultValue: 'Quick Translate' })
  },
  {
    key: 'contextTranslate',
    label: i18n('feature_context_translate', { defaultValue: 'Context Translate' })
  },
  {
    key: 'bilingualSubtitles',
    label: i18n('feature_bilingual_subtitles', { defaultValue: 'Bilingual Subtitles' })
  },
  {
    key: 'instantLookup',
    label: i18n('feature_instant_lookup', { defaultValue: 'Instant Lookup' })
  },
  {
    key: 'intelligentInput',
    label: i18n('feature_intelligent_input', { defaultValue: 'Intelligent Input' })
  },
  {
    key: 'writingCopilot',
    label: i18n('feature_writing_copilot', { defaultValue: 'Writing Copilot' })
  },
  {
    key: 'panoramaReading',
    label: i18n('feature_panorama_reading', { defaultValue: 'Panorama Reading' })
  }
];

// Feature keys in display order (derived from featureItems array)
export const featureKeys: FeatureKey[] = featureItems.map((f) => f.key);

export const defaultAIFeatures: Partial<Record<FeatureKey, FeatureValue>> = {
  contextTranslate: { state: false },
  bilingualSubtitles: { state: false },
  instantLookup: { state: false },
  intelligentInput: { state: false },
  writingCopilot: { state: false },
  panoramaReading: { state: false }
};

const defaultOpenedFeatures: Partial<Record<FeatureKey, FeatureValue>> = {
  contextTranslate: { disabled: true, state: true },
  bilingualSubtitles: { disabled: true, state: true },
  instantLookup: { disabled: true, state: true },
  intelligentInput: { disabled: true, state: true },
  writingCopilot: { disabled: true, state: true },
  panoramaReading: { disabled: true, state: true }
} as const;

export const bingTranslatorProvider: Provider = {
  type: 'free',
  name: 'Bing Translator',
  icon: 'bing',
  features: {
    quickTranslate: { state: true }
  } as const
} as const;

export const googleTranslatorProvider: Provider = {
  type: 'free',
  name: 'Google Translator',
  icon: 'google',
  features: {
    quickTranslate: { state: true }
  } as const
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
