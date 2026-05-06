import type { FeatureKey } from '@/lib/preset/constants';

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
