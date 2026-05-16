import { z } from 'zod';

import { displayStylePresets, MAX_CUSTOM_CSS_LENGTH } from '@/preset/translate';

import { TranslateMode, TranslatePageRange } from './config';
import { LangCode } from './lang';
import { ProviderConfig } from './provider';

export const customStylesSchema = z.object({
  backgroundColor: z.string(),
  color: z.string(),
  fontSize: z.string(),
  fontWeight: z.number(),
  fontFamily: z.string(),
  borderRadius: z.string(),
  padding: z.string()
});
export type CustomDisplayStyle = z.infer<typeof customStylesSchema>;

export const displayStyleSchema = z.object({
  preset: z.enum(displayStylePresets),
  customStyles: customStylesSchema.optional(),
  customCss: z.string().max(MAX_CUSTOM_CSS_LENGTH, 'Custom CSS cannot exceed 8KB').optional()
});
export type DisplayStyle = z.infer<typeof displayStyleSchema>;

export interface TranslateOptions {
  providerConfig: ProviderConfig;
  sourceLangCode: LangCode | 'auto' | 'default';
  targetLangCode: LangCode;
  pageRange: TranslatePageRange;
  mode?: TranslateMode;
  displayStyle?: DisplayStyle;
  text?: string;
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
