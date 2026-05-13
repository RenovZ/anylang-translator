import '@/zod-config';

import type { ContentScriptContext } from '#imports';

import logger from '@/lib/logger';

import { bootstrap } from './bootstrap';

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
    logger.info('main', { ctx });

    // Prevent double injection (manifest-based + programmatic injection)
    if (window.__ANYLANG_ADAPTIVE_TRANSLATE_INJECTED__) return;
    window.__ANYLANG_ADAPTIVE_TRANSLATE_INJECTED__ = true;

    await bootstrap(ctx);
  }
});
