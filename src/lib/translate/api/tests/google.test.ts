import { describe, expect, it } from 'vitest';

import { googleTranslate } from '../google';

const describeFreeApi = process.env.SKIP_FREE_API === 'true' ? describe.skip : describe;

describeFreeApi('googleTranslate', () => {
  it('google translates text to simplified chinese', async () => {
    const result = await googleTranslate('Library', 'en', 'zh');
    expect(result).toBe('图书馆');
  });
  it('google translates text to traditional chinese', async () => {
    const result = await googleTranslate('Library', 'en', 'zh-TW');
    expect(result).toBe('圖書館');
  });
});
