export type SelectionTriggerValue = 'directly' | 'show icons' | null;
export type TranslationMode = 'bilingual' | 'translation_only';

export type TranslationDisplayStyleCustom = {
  backgroundColor: string;
  color: string;
  fontSize: string;
  fontWeight: number;
  fontFamily: string;
  borderRadius: string;
  padding: string;
};

export type TranslationDisplayStyle = {
  value: string;
  label: string;
  styles: Record<string, string> | TranslationDisplayStyleCustom;
  attributes?: Record<string, string>;
};
