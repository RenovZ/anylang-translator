export type AIActionType = 'dictionary' | 'improveWriting' | 'blank';

export type AIAction = {
  preset: boolean;
  type: AIActionType;
  name: string;
  icon: string;
  provider?: PaidProvider;
  systemPrompt: string;
  prompt: string;
  outputSchema: OutputSchema[];
  description?: string;
};

export type OutputSchemaType = 'text' | 'number';

export type OutputSchema = {
  name: string;
  type: OutputSchemaType;
  description?: string;
  enableSpeaking: boolean;
};

export type FeatureKey =
  | 'pageTranslation'
  | 'videoSubtitles'
  | 'selectionToolbarTranslation'
  | 'inputTranslation'
  | 'imageTranslation'
  | 'improveWriting'
  | 'dictionary'
  | 'customAiAction';

export type FeatureValue = {
  disabled?: boolean;
  unsupported?: boolean;
  state?: boolean;
};

// Ordered feature definition for consistent UI rendering
export type FeatureItem = {
  key: FeatureKey;
  label: string;
};

export type AiProviderType = 'go' | 'zen' | 'custom';

export type ProviderConfig = {
  name: string;
  icon?: string;
  company?: string;
  description?: string;
  features: Record<FeatureKey, FeatureValue>;
};

export type FreeProvider = {
  type: 'free';
} & ProviderConfig;

export type PaidProvider = {
  type: AiProviderType;
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  models?: string[];
  prompt?: string;
  temperature?: number;
  providerOptions?: Map<string, unknown>;
  aiAction?: AIAction;
} & ProviderConfig;

export type Provider = FreeProvider | PaidProvider;

export type SelectionTriggerValue = 'directly' | 'show icons' | null;
export type TranslationMode = 'bilingual' | 'translation_only';

export type TranslationDisplayStyleCustom = {
  backgroundColor: string;
  color: string;
  fontSize: string;
  fontWeight: number;
  fontFamily: string;
  borderRadius: string;
  padding: string;
};
export type TranslationDisplayStyle = {
  value: string;
  label: string;
  styles: Record<string, string> | TranslationDisplayStyleCustom;
  attributes?: Record<string, string>;
};

export { type Config } from './config';
