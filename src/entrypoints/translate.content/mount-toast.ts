import { mount, unmount } from 'svelte';

import TranslationToast from './TranslationToast.svelte';

const DATA_ADAPTIVE_TRANSLATE_TOAST = 'data-anylang-adaptive-translate-toast';

export function mountTranslationToast(): () => void {
  const target = document.body ?? document.documentElement;
  const shadowHost = document.createElement('div');
  shadowHost.setAttribute(DATA_ADAPTIVE_TRANSLATE_TOAST, '');

  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

  const container = document.createElement('div');
  shadowRoot.appendChild(container);

  const component = mount(TranslationToast, { target: container });

  target.appendChild(shadowHost);

  let cleaned = false;

  return () => {
    if (cleaned) return;

    cleaned = true;
    unmount(component);
    shadowHost.remove();
  };
}
