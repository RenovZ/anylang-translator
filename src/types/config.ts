import { z } from 'zod';

import { freeProviders } from '@/preset/provider';
import { displayStyles, TRIGGER_HOTKEYS } from '@/preset/translate';
import { aiProviderSchema, providerSchema, type ProviderConfig } from '@/types/provider';

import { langCodeSchema, uiLangCodeSchema } from './lang';
import { displayStyleSchema } from './translate';

export const triggerModeOnSelectionSchema = z.enum(['directly', 'show icons', 'noop']);
export const translateModeSchema = z.enum(['translation_only', 'bilingual']);
export type TranslateMode = z.infer<typeof translateModeSchema>;
export const pageRangeSchema = z.enum(['main', 'all']);
export type TranslatePageRange = z.infer<typeof pageRangeSchema>;

export const langDetectionModeSchema = z.enum(['basic', 'llm']);
export type LangDetectionMode = z.infer<typeof langDetectionModeSchema>;

export const triggerOnHoverSchema = z.object({
  hotkey: z.enum(TRIGGER_HOTKEYS).default(TRIGGER_HOTKEYS[0]),
  enabled: z.boolean().default(true)
});

export const langDetectionSchema = z.object({
  mode: langDetectionModeSchema,
  provider: aiProviderSchema.nullable()
});
export type LangDetection = z.infer<typeof langDetectionSchema>;

const featureBaseSchema = z.object({
  icon: z.string(),
  provider: providerSchema.nullable()
});
const adaptiveTranslateSchema = featureBaseSchema.extend({
  shortcut: z.array(z.string()),
  autoTranslatedSites: z.array(z.string()).default([]),
  autoTranslatedLangs: z.array(langCodeSchema).default([]),
  provider: providerSchema,
  translate: z.object({
    mode: translateModeSchema.default('bilingual'),
    displayStyle: displayStyleSchema.default(displayStyles[0]),
    pageRange: pageRangeSchema.default('main'),
    triggerOnHover: triggerOnHoverSchema
  })
});
const instantLookupSchema = featureBaseSchema.extend({
  disabledSites: z.array(z.string()).default([]),
  disabledLangs: z.array(langCodeSchema).default([]),
  selection: z.object({
    withContext: z.boolean().default(false),
    targetLangCode: langCodeSchema.optional(),
    triggerMode: triggerModeOnSelectionSchema.default('directly')
  })
});

export const featureConfigSchema = z.union([
  featureBaseSchema,
  adaptiveTranslateSchema,
  instantLookupSchema
]);
export type FeatureConfig = z.infer<typeof featureConfigSchema>;

export const configSchema = z.object({
  devMode: z.boolean().default(false),

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
    .default([...freeProviders]),

  adaptiveTranslate: adaptiveTranslateSchema,
  instantLookup: instantLookupSchema
});

export type Config = z.infer<typeof configSchema>;
