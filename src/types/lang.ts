import { z } from 'zod';

import { DEFAULT_LANG_CODES, LANG_CODE_MAP } from '@/preset/lang';

export const langCodeSchema = z.enum(DEFAULT_LANG_CODES);
export type LangCode = z.infer<typeof langCodeSchema>;

export const uiLangCodeSchema = z.custom<keyof typeof LANG_CODE_MAP>(
  (val): val is keyof typeof LANG_CODE_MAP => typeof val === 'string' && val in LANG_CODE_MAP
);
export type UILangCode = z.infer<typeof uiLangCodeSchema>;
