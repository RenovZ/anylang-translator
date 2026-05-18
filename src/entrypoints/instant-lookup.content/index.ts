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

    ctx.onInvalidated(() => {
      window.__ANYLANG_INSTANT_LOOKUP_INJECTED__ = false;
    });

    const ui = await createUi(ctx);
    ui.mount();

    // Optionally, return a value to the background
    return 'Hello world!';
  }
});

function createUi(ctx: ContentScriptContext) {
  return createShadowRootUi(ctx, {
    name: 'anylang-instant-lookup',
    position: 'overlay',
    anchor: 'body',
    onMount(container) {
      const app = document.createElement('p');
      app.textContent = 'Hello active tab!';
      container.append(app);
    }
    // onRemove: (root) => {
    //   root?.unmount();
    //   shadowWrapper = null;
    // }
  });
}
