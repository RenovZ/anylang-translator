import { describe, expect, it } from 'vitest';

import { bingTranslate } from '../bing';

const describeFreeApi = process.env.SKIP_FREE_API === 'true' ? describe.skip : describe;

describeFreeApi('bingTranslate', () => {
  it('bing translates text to simplified chinese', async () => {
    const result = await bingTranslate('Library', 'en', 'zh');
    expect(result).toBe('图书馆');
  });
  it('bing translates text to traditional chinese', async () => {
    const result = await bingTranslate('Library', 'en', 'zh-TW');
    expect(result).toBe('圖書館');
  });
});
