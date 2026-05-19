import '@/zod-config';

import { mount, unmount } from 'svelte';
import { ContentScriptContext } from 'wxt/utils/content-script-context';
import { defineContentScript } from 'wxt/utils/define-content-script';

import { initShadowRoot } from '@/lib/dom/shadow';
import logger from '@/lib/logger';
import { protectSelectAllShadowRoot } from '@/lib/utils/select-all';

import Main from './Main.svelte';

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

    await main(ctx);
  }
});

async function main(ctx: ContentScriptContext) {
  const ui = await createShadowRootUi(ctx, {
    name: 'anylang-instant-lookup',
    position: 'overlay',
    anchor: 'body',
    onMount(target: HTMLElement, _shadow: ShadowRoot, shadowHost: HTMLElement) {
      console.log(target);
      initShadowRoot(target);
      protectSelectAllShadowRoot(shadowHost, target);

      const root = mount(Main, { target });
      return root;
    },
    onRemove: (root) => {
      if (root) unmount(root);
    }
  });

  ui.mount();
}
