import type { ContentScriptContext } from '#imports';

import logger from '@/lib/logger';

declare global {
  interface Window {
    __ANYLANG_ADAPTIVE_TRANSLATE_INJECTED__?: boolean;
  }
}

export default defineContentScript({
  matches: ['*://*/*', 'file:///*'],
  cssInjectionMode: 'manual',
  allFrames: true,
  async main(ctx: ContentScriptContext) {
    logger.info('translate.content: main', { ctx });

    if (window.__ANYLANG_ADAPTIVE_TRANSLATE_INJECTED__) return;
    window.__ANYLANG_ADAPTIVE_TRANSLATE_INJECTED__ = true;

    const { bootstrap } = await import('./bootstrap');
    await bootstrap(ctx);
  }
});
