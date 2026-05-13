import { z } from 'zod';

import { attributeKeys, displayStyleValues, MAX_CUSTOM_CSS_LENGTH } from '@/preset/translate';

import { LangCode } from './lang';
import { ProviderConfig } from './provider';

const customDisplaySchema = z.object({
  backgroundColor: z.string(),
  color: z.string(),
  fontSize: z.string(),
  fontWeight: z.number(),
  fontFamily: z.string(),
  borderRadius: z.string(),
  padding: z.string()
});
export type CustomDisplayStyle = z.infer<typeof customDisplaySchema>;

const stylesSchema: z.ZodType<Record<string, string> | CustomDisplayStyle> = z.union([
  z.record(z.string(), z.string()),
  customDisplaySchema
]);
const attributeKeySchema = z.enum(attributeKeys);
const attributesSchema = z.record(attributeKeySchema, z.string());
export const displayStyleSchema = z.object({
  value: z.enum(displayStyleValues),
  label: z.string(),
  styles: stylesSchema,
  attributes: attributesSchema.optional(),
  customCSS: z.string().max(MAX_CUSTOM_CSS_LENGTH, 'Custom CSS cannot exceed 8KB').nullable()
});
export type DisplayStyle = z.infer<typeof displayStyleSchema>;

export interface Options {
  text: string;
  sourceLang?: string;
  targetLang?: string;
}

export interface Result {
  translation: string;
  sourceLang?: string;
  targetLang?: string;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Input translation
// ─────────────────────────────────────────────────────────────────────────────

// /**
//  * Specifies the source/target language for input translation.
//  * Can be 'sourceCode' / 'targetCode' to resolve from global config,
//  * or a literal LangCode for explicit language.
//  */
// export type InputTranslationLang = 'sourceCode' | 'targetCode' | string;

export interface TranslateBatchData<TContext = unknown> {
  text: string;
  sourceLangCode: LangCode | 'auto' | 'default';
  targetLangCode: LangCode;
  providerConfig: ProviderConfig;
  hash: string;
  scheduleAt: number;
  context?: TContext;
}
