import Locale from 'intl-locale-textinfo-polyfill';
import { browser } from 'wxt/browser';

import { LANG_CODE_MAP, UI_LANG_CODES } from '@/preset/lang';
import { LangDir } from '@/types/content';
import { langCodeSchema, UILangCode, uiLangCodeSchema, type LangCode } from '@/types/lang';

import configStore from './config';
import logger from './logger';

const PUNCTUATION_AND_WHITESPACE_PATTERN = /['"`,.\s]/g;

class LangManager {
  getUILangCodeMap(): Map<UILangCode, string> {
    const config = configStore.get();

    let uiLangCode: UILangCode = 'en';
    const rawValue =
      config.uiLangCode !== 'default' ? config.uiLangCode : browser.i18n.getUILanguage();
    const { success, data, error } = uiLangCodeSchema.safeParse(rawValue);
    if (success) {
      uiLangCode = data;
    } else {
      logger.warn('Invalid langCode data, using default:', { rawValue, error });
    }

    return Object.entries(LANG_CODE_MAP[uiLangCode]).reduce((acc, [langCode, langName]) => {
      if (UI_LANG_CODES.includes(langCode)) {
        acc.set(uiLangCodeSchema.parse(langCode), langName);
      }
      return acc;
    }, new Map<UILangCode, string>());
  }

  getLangCodeMap(): Record<LangCode, string> {
    const config = configStore.get();

    const rawValue =
      config.uiLangCode !== 'default' ? config.uiLangCode : browser.i18n.getUILanguage();
    const { success, data, error } = uiLangCodeSchema.safeParse(rawValue);
    if (success) return LANG_CODE_MAP[data];

    logger.warn('Invalid langCode data, using default:', { rawValue, error });
    return LANG_CODE_MAP['en'];
  }

  getLangName(rawLangCode: string): string | undefined {
    const { success, data, error } = langCodeSchema.safeParse(rawLangCode);
    if (success) return this.getLangCodeMap()[data];

    logger.warn('Invalid langCode data', { rawLangCode, error });
    return undefined;
  }

  getLangDir(langCode: LangCode): LangDir {
    return new Locale(langCode).getTextInfo().direction as LangDir;
  }

  isRtlLang(langCode: LangCode): boolean {
    return this.getLangDir(langCode) === 'rtl';
  }

  parseLangCode(rawOutput: string): LangCode | null {
    const cleanedCode = rawOutput
      .trim()
      .toLowerCase()
      .replace(PUNCTUATION_AND_WHITESPACE_PATTERN, '');
    const result = langCodeSchema.safeParse(cleanedCode);
    return result.success ? result.data : null;
  }

  getFinalLangCode(
    sourceCode: LangCode | 'default' | 'auto',
    detectedCodeOrUnd: LangCode | 'und'
  ): LangCode {
    return sourceCode === 'auto' || sourceCode === 'default' ? detectedCodeOrUnd : sourceCode;
  }
}

export default new LangManager();
