import Locale from 'intl-locale-textinfo-polyfill';
import { browser } from 'wxt/browser';

import { LANG_CODE_MAP } from '@/preset/lang';
import { LanguageDirection } from '@/types/content';
import { langCodeSchema, uiLangCodeSchema, type LangCode } from '@/types/lang';

import configStore from './config';
import logger from './logger';

const PUNCTUATION_AND_WHITESPACE_PATTERN = /['"`,.\s]/g;

class LangManager {
  getLangCodeMap(): Record<LangCode, string> {
    const config = configStore.get();

    const rawValue =
      config.uiLangCode !== 'default' ? config.uiLangCode : browser.i18n.getUILanguage();
    const { success, data, error } = uiLangCodeSchema.safeParse(rawValue);
    if (success) return LANG_CODE_MAP[data];

    logger.warn('Invalid ui langCode data, using default:', { rawValue, error });
    return LANG_CODE_MAP['en'];
  }

  getLangName(rawLangCode: string): string {
    const langCode = langCodeSchema.parse(rawLangCode);
    return this.getLangCodeMap()[langCode];
  }

  // formatUICode(langCode: string) {
  //   if (typeof langCode !== 'string') return;

  //   const getReplacer = (langCode: string) => {
  //     switch (langCode) {
  //       case 'pt':
  //         return 'pt-BR';
  //       case 'zh':
  //         return 'zh-CN';
  //       default:
  //         return;
  //     }
  //   };

  //   if (SUPPORTED_UI_LANG_CODES.indexOf(langCode) === -1) {
  //     if (langCode.indexOf('-') === -1) {
  //       return getReplacer(langCode);
  //     }

  //     langCode = langCode.split('-')[0];
  //     if (SUPPORTED_UI_LANG_CODES.indexOf(langCode) === -1) {
  //       return getReplacer(langCode);
  //     }
  //   }

  //   return langCode;
  // }

  // format(langCode: string) {
  //   if (typeof langCode !== 'string') return;

  //   if (langCode === 'zh') {
  //     return 'zh-CN';
  //   } else if (langCode === 'zh-Hant') {
  //     return 'zh-TW';
  //   } else if (langCode === 'iw') {
  //     return 'he';
  //   } else if (langCode === 'jw') {
  //     return 'jv';
  //   }

  //   if (DEFAULT_LANG_CODES.indexOf(langCode) === -1) {
  //     if (langCode.indexOf('-') === -1) {
  //       return;
  //     }

  //     langCode = langCode.split('-')[0];
  //     if (DEFAULT_LANG_CODES.indexOf(langCode) === -1) {
  //       return;
  //     }
  //   }

  //   return langCode;
  // }

  async setLangDetection(langCode: LangCode | 'und'): Promise<void> {
    const config = configStore.get();
    config.langDetection.langCode = langCode;
    await configStore.set(config);
  }

  getLangDirection(langCode: LangCode): LanguageDirection {
    return new Locale(langCode).getTextInfo().direction as LanguageDirection;
  }

  isRtlLang(langCode: LangCode): boolean {
    return this.getLangDirection(langCode) === 'rtl';
  }

  parseLangCode(rawOutput: string): LangCode | null {
    const cleanedCode = rawOutput
      .trim()
      .toLowerCase()
      .replace(PUNCTUATION_AND_WHITESPACE_PATTERN, '');
    const result = langCodeSchema.safeParse(cleanedCode);
    return result.success ? result.data : null;
  }
}

export default new LangManager();
