import type { PopupConfig } from "../popup/data";

export type V2OptionsConfig = PopupConfig & {
    toggleModes: Record<string, string>;
    alwaysTranslateSites: string[];
    neverTranslateSites: string[];
    alwaysTranslateLanguages: string[];
    neverTranslateLanguages: string[];
    uiLanguage: string;
    translationPreference: string;
    translationStyle: string;
    richTextTranslate: boolean;
    textColor: string;
    fontScale: string;
    fontWeight: string;
    italicTranslate: boolean;
    customFontEnabled: boolean;
    customFontFamily: string;
};
