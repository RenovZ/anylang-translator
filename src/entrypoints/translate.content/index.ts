import '@/zod-config';

import { ContentScriptContext } from 'wxt/utils/content-script-context';
import { defineContentScript } from 'wxt/utils/define-content-script';

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
    logger.info('adaptive-translate', { ctx });

    // Prevent double injection (manifest-based + programmatic injection)
    if (window.__ANYLANG_ADAPTIVE_TRANSLATE_INJECTED__) return;
    window.__ANYLANG_ADAPTIVE_TRANSLATE_INJECTED__ = true;

    await bootstrap(ctx);
  }
});
