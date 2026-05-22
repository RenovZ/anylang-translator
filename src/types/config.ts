import { z } from 'zod';

import { PROMPT_LIST } from '@/preset/prompt';
import { freeProviders, goProviders, zenProviders } from '@/preset/provider';
import { displayStyles, TRIGGER_HOTKEYS } from '@/preset/translate';
import { aiProviderSchema, providerSchema, type ProviderConfig } from '@/types/provider';

import { langCodeSchema, uiLangCodeSchema } from './lang';
import { promptSchema, type Prompt } from './prompt';
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
  // langCode: langCodeSchema
});
export type LangDetection = z.infer<typeof langDetectionSchema>;

const featureBaseSchema = z.object({
  icon: z.string(),
  provider: providerSchema.nullable(),
  shortcut: z.array(z.string())
});
const adaptiveTranslateSchema = featureBaseSchema.extend({
  autoTranslatedSites: z.array(z.string()).default([]),
  autoTranslatedLangs: z.array(langCodeSchema).default([]),
  provider: providerSchema,
  translate: z.object({
    mode: translateModeSchema.default('bilingual'),
    displayStyle: displayStyleSchema.default(displayStyles[0]),
    pageRange: pageRangeSchema.default('main'),
    triggerOnHover: triggerOnHoverSchema
    // NOTE: we dont need these options
    // minCharactersPerNode: z.number().default(0),
    // minWordsPerNode: z.number().default(0),
    // skipLanguages: z.array(z.enum(DEFAULT_LANG_CODES)).default([])
  })
});
const instantLookupSchema = featureBaseSchema.extend({
  disabledSites: z.array(z.string()).default([]),
  disabledLangs: z.array(langCodeSchema).default([]),
  selection: z.object({
    targetLangCode: langCodeSchema.optional(),
    triggerMode: triggerModeOnSelectionSchema.default('directly')
  })
});
const intelligentInputSchema = featureBaseSchema.extend({
  disabledSites: z.array(z.string()).default([]),
  disabledLangs: z.array(langCodeSchema).default([])
});
const bilingualSubtitlesSchema = featureBaseSchema.extend({
  autoEnabledSites: z.array(z.string()).default([]),
  autoEnabledLangs: z.array(langCodeSchema).default([])
});
const panoramaReadingSchema = featureBaseSchema.extend({
  disabledSites: z.array(z.string()).default([]),
  disabledLangs: z.array(langCodeSchema).default([])
});
const writingCopilotSchema = featureBaseSchema.extend({
  disabledSites: z.array(z.string()).default([]),
  disabledLangs: z.array(langCodeSchema).default([])
});
export const featureConfigSchema = z.union([
  featureBaseSchema,
  adaptiveTranslateSchema,
  instantLookupSchema,
  intelligentInputSchema,
  bilingualSubtitlesSchema,
  panoramaReadingSchema,
  writingCopilotSchema
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

  adaptiveTranslate: adaptiveTranslateSchema,
  instantLookup: instantLookupSchema,
  intelligentInput: intelligentInputSchema,
  bilingualSubtitles: bilingualSubtitlesSchema,
  panoramaReading: panoramaReadingSchema,
  writingCopilot: writingCopilotSchema,

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

// export type XLangsField = {
//   [K in FeatureField]: Config[K] extends
//     | { autoAppliedLangs?: LangCode[] }
//     | { autoEnabledLangs?: LangCode[] }
//     | { disabledLangs?: LangCode[] }
//     ? K
//     : never;
// }[FeatureField];

// export type XSitesField = {
//   [K in FeatureField]: Config[K] extends
//     | { autoAppliedSites?: string[] }
//     | { autoEnabledSites?: string[] }
//     | { disabledSites?: string[] }
//     ? K
//     : never;
// }[FeatureField];
