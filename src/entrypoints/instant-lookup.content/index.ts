import '@/zod-config';

import { ContentScriptContext } from 'wxt/utils/content-script-context';
import { defineContentScript } from 'wxt/utils/define-content-script';

import logger from '@/lib/logger';

declare global {
  interface Window {
    __ANYLANG_INSTANT_LOOKUP_INJECTED__?: boolean;
  }
}

export default defineContentScript({
  matches: ['*://*/*', 'file:///*'],
  cssInjectionMode: 'ui',
  async main(ctx: ContentScriptContext) {
    logger.info('instant-lookup', { ctx });

    // Prevent double injection (manifest-based + programmatic injection)
    if (window.__ANYLANG_INSTANT_LOOKUP_INJECTED__) return;
    window.__ANYLANG_INSTANT_LOOKUP_INJECTED__ = true;
  }
});
