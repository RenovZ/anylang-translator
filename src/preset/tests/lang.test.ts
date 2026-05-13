import { describe, expect, it } from 'vitest';

import { DEFAULT_LANG_CODES, LANG_CODE_MAP } from '../lang';

describe('lang', () => {
  it('should have every langCode in every uiLangCode present in DEFAULT_LANG_CODES', () => {
    const invalid: string[] = [];

    for (const uiLangCode of Object.keys(LANG_CODE_MAP)) {
      const langCodes = Object.keys(LANG_CODE_MAP[uiLangCode as keyof typeof LANG_CODE_MAP]);
      for (const langCode of langCodes) {
        if (!DEFAULT_LANG_CODES.includes(langCode)) {
          invalid.push(`${uiLangCode}.${langCode}`);
        }
      }
    }

    expect(invalid).toEqual([]);
  });

  it('should have "en" uiLangCode', () => {
    expect(LANG_CODE_MAP).toHaveProperty('en');
  });

  it('should have consistent langCode count across uiLangCodes', () => {
    const enCodes = Object.keys(LANG_CODE_MAP['en']);
    expect(enCodes.length).toBe(DEFAULT_LANG_CODES.length);
  });
});
