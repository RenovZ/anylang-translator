import { z } from 'zod';

import { featureKeys } from '@/preset/provider';

import { CustomProvider } from './provider';

// OutputSchema types
export const outputTypeSchema = z.enum(['text', 'number']);
export type OutputType = z.infer<typeof outputTypeSchema>;

export const outputSchema = z.object({
  name: z.string(),
  type: outputTypeSchema,
  description: z.string().optional(),
  enableSpeaking: z.boolean()
});
export type Output = z.infer<typeof outputSchema>;

// Prompt type
export const promptSchema = z.object({
  feature: z.enum([...featureKeys, 'blank']),
  name: z.string(),
  system: z.string(),
  prompt: z.string(),
  output: z.array(outputSchema),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
  mutable: z.boolean().default(false)
});
export type Prompt = z.infer<typeof promptSchema>;

export interface PromptOptions<TContext = unknown> {
  isBatch?: boolean;
  context?: TContext;
}

export interface PromptResult {
  systemPrompt: string;
  prompt: string;
}

export type PromptResolver<TContext = unknown> = (
  providerConfig: CustomProvider,
  targetLang: string,
  input: string,
  options?: PromptOptions<TContext>
) => PromptResult;

export interface SubtitlePromptContext {
  videoTitle?: string | null;
  videoSummary?: string | null;
}
