import type { CommandName, FeatureField, FeatureKey, MessageType } from './preset/constants';

export type { CommandName, FeatureField, FeatureKey, MessageType };

export type OptionsNavItem = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  position: 'top' | 'bottom';
  component?: import('svelte').Component;
  textStyle?: string;
  indicatorStyle?: string;
};

export type AIPrompt = {
  feature: FeatureKey | 'blank';
  name: string;
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

export type FeatureValue = {
  disabled?: boolean;
  state?: boolean;
};

// Ordered feature definition for consistent UI rendering
export type FeatureItem = {
  key: FeatureKey;
  label: string;
};

export type FeatureConfig = {
  icon: string;
  provider: Provider | null;
  shortcut: string[];
  autoAppliedSites?: string[];
  autoAppliedLang?: string;
};

export type AiProviderType = 'go' | 'zen' | 'custom';

export type ProviderConfig = {
  name: string;
  icon?: string;
  company?: string;
  features: Partial<Record<FeatureKey, FeatureValue>>;
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
  aiAction?: AIPrompt;
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
