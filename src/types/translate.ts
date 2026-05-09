import { z } from 'zod';

import { attributeKeys, displayStyleValues } from '@/preset/translate';

export const selectionTriggerSchema = z.enum(['directly', 'show icons']).nullable();
export type SelectionTrigger = z.infer<typeof selectionTriggerSchema>;

export const modeSchema = z.enum(['bilingual', 'translation_only']);
export type Mode = z.infer<typeof modeSchema>;

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
  attributes: attributesSchema.optional()
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
