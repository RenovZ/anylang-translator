import { z } from 'zod';

import type { FeatureField } from '@/preset/constants';
import { PROMPT_LIST } from '@/preset/prompt';
import { freeProviders, goProviders, zenProviders } from '@/preset/provider';
import { displayStyles, HOTKEYS } from '@/preset/translate';
import { aiProviderSchema, providerSchema, type ProviderConfig } from '@/types/provider';

import { LangCode, langCodeSchema, uiLangCodeSchema } from './lang';
import { promptSchema, type Prompt } from './prompt';
import { displayStyleSchema } from './translate';

export const selectionTriggerSchema = z.enum(['directly', 'show icons', 'noop']);
export const translateModeSchema = z.enum(['translation_only', 'bilingual']);
export type TranslateMode = z.infer<typeof translateModeSchema>;
export const pageRangeSchema = z.enum(['main', 'all']);
export type TranslatePageRange = z.infer<typeof pageRangeSchema>;

export const langDetectionModeSchema = z.enum(['basic', 'llm']);
export type LangDetectionMode = z.infer<typeof langDetectionModeSchema>;

export const langDetectionSchema = z.object({
  mode: langDetectionModeSchema,
  provider: aiProviderSchema.nullable(),
  langCode: langCodeSchema
});
export type LangDetection = z.infer<typeof langDetectionSchema>;

const featureConfigBaseSchema = z.object({
  icon: z.string(),
  provider: providerSchema.nullable(),
  shortcut: z.array(z.string()),
  autoAppliedSites: z.array(z.string()).optional(),
  autoAppliedLangs: langCodeSchema.optional()
});
const featureAdaptiveTranslateSchema = featureConfigBaseSchema.extend({
  provider: providerSchema,
  translate: z.object({
    mode: translateModeSchema.default('bilingual'),
    displayStyle: displayStyleSchema.default(displayStyles[0]),
    pageRange: pageRangeSchema.default('main'),
    triggerOnHover: z.enum(HOTKEYS)
    // NOTE: we dont need these options
    // minCharactersPerNode: z.number().default(0),
    // minWordsPerNode: z.number().default(0),
    // skipLanguages: z.array(z.enum(DEFAULT_LANG_CODES)).default([])
  })
});
const featureInstantLookupSchema = featureConfigBaseSchema.extend({
  provider: providerSchema,
  selection: z.object({
    triggerTranslate: selectionTriggerSchema.default('directly')
  })
});
export const featureConfigSchema = z.union([
  featureConfigBaseSchema,
  featureAdaptiveTranslateSchema,
  featureInstantLookupSchema
]);
export type FeatureConfig = z.infer<typeof featureConfigSchema>;

export const configSchema = z.object({
  installDateTime: z.number().nullable().default(null),
  lastTimeShowingReleaseNotes: z.number().nullable().default(null),
  originalUserAgent: z.string().nullable().default(null),

  uiLangCode: uiLangCodeSchema.or(z.literal('default')),
  sourceLangCode: langCodeSchema.optional(),
  targetLangCode: langCodeSchema,

  langDetection: langDetectionSchema,

  providers: z
    .array(providerSchema)
    .superRefine((providers, ctx) => {
      const nameSet = new Set<string>();
      providers.forEach((provider: ProviderConfig, index: number) => {
        if (nameSet.has(provider.name)) {
          ctx.addIssue({
            code: 'custom',
            message: `Duplicate provider name "${provider.name}"`,
            path: [index, 'name']
          });
        }
        nameSet.add(provider.name);
      });
    })
    .default([...freeProviders, ...goProviders, ...zenProviders]),

  adaptiveTranslate: featureAdaptiveTranslateSchema,
  instantLookup: featureInstantLookupSchema,
  intelligentInput: featureConfigBaseSchema,
  bilingualSubtitles: featureConfigBaseSchema,
  panoramaReading: featureConfigBaseSchema,
  writingCopilot: featureConfigBaseSchema,

  customAIPrompts: z
    .array(promptSchema)
    .superRefine((prompts, ctx) => {
      const nameSet = new Set<string>();
      prompts.forEach((prompt: Prompt, index: number) => {
        if (nameSet.has(prompt.name)) {
          ctx.addIssue({
            code: 'custom',
            message: `Duplicate prompt name "${prompt.name}"`,
            path: [index, 'name']
          });
        }
        nameSet.add(prompt.name);
      });
    })
    .default(PROMPT_LIST)
});

export type Config = z.infer<typeof configSchema>;

export type AutoAppliedLangsField = {
  [K in FeatureField]: Config[K] extends { autoAppliedLangs?: LangCode[] } ? K : never;
}[FeatureField];

export type AutoAppliedSitesField = {
  [K in FeatureField]: Config[K] extends { autoAppliedSites?: string[] } ? K : never;
}[FeatureField];
