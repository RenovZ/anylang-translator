import { data } from 'franc/data.js';
import { expressions } from 'franc/expressions.js';
import { describe, expect, it } from 'vitest';

import { FRANC_TO_LANG_CODE } from '../franc-map';
import { DEFAULT_LANG_CODES } from '../lang';

describe('franc-map', () => {
  const projectCodes = new Set(DEFAULT_LANG_CODES);

  it('should map all franc data.js codes to valid project LangCodes when mapped', () => {
    const invalid: string[] = [];

    for (const script in data) {
      for (const lang in data[script]) {
        const mapped = FRANC_TO_LANG_CODE[lang];
        if (mapped !== undefined && !projectCodes.has(mapped)) {
          invalid.push(`${lang} -> ${mapped}`);
        }
      }
    }

    expect(invalid).toEqual([]);
  });

  it('should map all franc expression script codes to valid project LangCodes when mapped', () => {
    const genericScripts = new Set([
      'Latin',
      'Arabic',
      'Cyrillic',
      'Devanagari',
      'Myanmar',
      'Ethiopic',
      'Hebrew'
    ]);
    const invalid: string[] = [];

    for (const script in expressions) {
      if (genericScripts.has(script)) continue;

      const mapped = FRANC_TO_LANG_CODE[script];
      if (mapped !== undefined && !projectCodes.has(mapped)) {
        invalid.push(`${script} -> ${mapped}`);
      }
    }

    expect(invalid).toEqual([]);
  });

  it('should have "und" undefined in map (handled by caller)', () => {
    expect(FRANC_TO_LANG_CODE['und']).toBeUndefined();
  });

  it('should have no mappings to codes outside DEFAULT_LANG_CODES', () => {
    const invalid: string[] = [];

    for (const [francCode, target] of Object.entries(FRANC_TO_LANG_CODE)) {
      if (!projectCodes.has(target)) {
        invalid.push(`${francCode} -> ${target}`);
      }
    }

    expect(invalid).toEqual([]);
  });

  it('should include mappings for major languages', () => {
    expect(FRANC_TO_LANG_CODE['eng']).toBe('en');
    expect(FRANC_TO_LANG_CODE['spa']).toBe('es');
    expect(FRANC_TO_LANG_CODE['fra']).toBe('fr');
    expect(FRANC_TO_LANG_CODE['deu']).toBe('de');
    expect(FRANC_TO_LANG_CODE['jpn']).toBe('ja');
    expect(FRANC_TO_LANG_CODE['kor']).toBe('ko');
    expect(FRANC_TO_LANG_CODE['cmn']).toBe('zh-CN');
    expect(FRANC_TO_LANG_CODE['rus']).toBe('ru');
    expect(FRANC_TO_LANG_CODE['arb']).toBe('ar');
    expect(FRANC_TO_LANG_CODE['hin']).toBe('hi');
  });
});
