import { z } from 'zod';

import type { FeatureField } from '@/preset/constants';
import { DEFAULT_LANG_CODES } from '@/preset/lang';
import { PROMPT_LIST } from '@/preset/prompt';
import { freeProviders, goProviders, zenProviders } from '@/preset/provider';
import { displayStyles, HOTKEYS } from '@/preset/translate';
import { aiProviderSchema, providerSchema, type Provider } from '@/types/provider';

import { promptSchema, type Prompt } from './prompt';
import { displayStyleSchema } from './translate';

export const selectionTriggerSchema = z.enum(['directly', 'show icons', 'noop']);
export const translateModeSchema = z.enum(['translation_only', 'bilingual']);
export type TranslateMode = z.infer<typeof translateModeSchema>;
export const pageRangeSchema = z.enum(['main', 'all']);
export type TranslatePageRange = z.infer<typeof pageRangeSchema>;

export const detectionModeSchema = z.enum(['basic', 'llm']);
export type DetectionMode = z.infer<typeof detectionModeSchema>;

export const langDetectionSchema = z.object({
  mode: detectionModeSchema,
  provider: aiProviderSchema.nullable(),
  langCode: z.enum(DEFAULT_LANG_CODES).default('en')
});
export type LangDetection = z.infer<typeof langDetectionSchema>;

const featureContextTranslateSchema = z.object({
  icon: z.string(),
  provider: providerSchema.nullable(),
  shortcut: z.array(z.string())
});
const featureConfigBaseSchema = featureContextTranslateSchema.extend({
  autoAppliedSites: z.array(z.string()).optional(),
  autoAppliedLangs: z.array(z.string()).optional()
});
const featureQuickTranslateSchema = featureConfigBaseSchema.extend({
  provider: providerSchema,
  translate: z.object({
    mode: translateModeSchema.default('bilingual'),
    displayStyle: displayStyleSchema.default(displayStyles[0]),
    pageRange: pageRangeSchema.default('main'),
    triggerOnHover: z.enum(HOTKEYS),
    minCharactersPerNode: z.number().default(0),
    minWordsPerNode: z.number().default(0),
    skipLanguages: z.array(z.enum(DEFAULT_LANG_CODES)).default([])
  })
});
const featureInstantLookupSchema = featureConfigBaseSchema.extend({
  provider: providerSchema,
  selection: z.object({
    triggerTranslate: selectionTriggerSchema.default('directly')
  })
});
export const featureConfigSchema = z.union([
  featureContextTranslateSchema,
  featureConfigBaseSchema,
  featureQuickTranslateSchema,
  featureInstantLookupSchema
]);
export type FeatureConfig = z.infer<typeof featureConfigSchema>;

export const configSchema = z.object({
  installDateTime: z.number().nullable().default(null),
  lastTimeShowingReleaseNotes: z.number().nullable().default(null),
  originalUserAgent: z.string().nullable().default(null),

  uiLangCode: z.string().default('default'),
  sourceLangCode: z.enum(DEFAULT_LANG_CODES).optional(),
  targetLangCode: z.enum(DEFAULT_LANG_CODES).default('en'),

  langDetection: langDetectionSchema,

  providers: z
    .array(providerSchema)
    .superRefine((providers, ctx) => {
      const nameSet = new Set<string>();
      providers.forEach((provider: Provider, index: number) => {
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

  quickTranslate: featureQuickTranslateSchema,
  contextTranslate: featureContextTranslateSchema,
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
  [K in FeatureField]: Config[K] extends { autoAppliedLangs?: string[] } ? K : never;
}[FeatureField];

export type AutoAppliedSitesField = {
  [K in FeatureField]: Config[K] extends { autoAppliedSites?: string[] } ? K : never;
}[FeatureField];
