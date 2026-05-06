import type { FeatureKey } from '@/lib/preset/constants';

import type { AIPrompt } from './ai';
import type { FeatureValue } from './feature';

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

export type FeatureConfig = {
  icon: string;
  provider: Provider | null;
  shortcut: string[];
  autoAppliedSites?: string[];
  autoAppliedLang?: string;
};
