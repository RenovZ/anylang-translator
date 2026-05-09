import type { ContentScriptContext } from '#imports';

import logger from '@/lib/logger';
import { sendMessage } from '@/lib/protocol';

import { EVENT_EXTENSION_URL_CHANGE, setupUrlChangeListener } from './listen';
import { mountTranslationToast } from './mount-toast';
import { bindTranslationShortcutKey } from './translation-control/bind-translation-shortcut';
import { registerNodeTranslationTriggers } from './translation-control/node-translation';
import { PageTranslationManager } from './translation-control/page-translation';

export async function bootstrap(ctx: ContentScriptContext) {
  // TODO:
  // ensurePresetStyles(document)

  // const cfg = config.get();

  const cleanupUrlListener = setupUrlChangeListener();

  const removeTranslationToast = window === window.top ? mountTranslationToast() : () => {};

  const teardownNodeTranslation = registerNodeTranslationTriggers();

  const manager = new PageTranslationManager({
    root: null,
    rootMargin: '600px',
    threshold: 0.1
  });

  const cleanupPageTranslationTriggers = manager.registerPageTranslationTriggers();

  const cleanupTranslationShortcut = await bindTranslationShortcutKey(manager);

  // For late-loading iframes: check if translation is already enabled for this tab
  let translationEnabled = false;
  try {
    translationEnabled = await sendMessage('getEnablePageTranslationFromContentScript');
  } catch (error) {
    // Extension context may be invalidated during update, proceed without auto-start
    logger.error('Failed to check translation state:', { error });
  }
  if (translationEnabled) {
    void manager.start();
  }

  const handleUrlChange = async (from: string, to: string) => {
    if (from !== to) {
      logger.info('URL changed ', { from, to });
      if (manager.isActive) {
        manager.stop();
      }

      // Only the top frame should detect and set language to avoid race conditions from iframes
      if (window === window.top) {
        // TODO:
        // const { detectedCodeOrUnd } = await getDocumentInfo();
        // const detectedCode: LangCodeISO6393 =
        //   detectedCodeOrUnd === 'und' ? 'eng' : detectedCodeOrUnd;
        // await storage.setItem<LangCodeISO6393>(`local:${DETECTED_CODE_STORAGE_KEY}`, detectedCode);
        // // Notify background script that URL has changed, let it decide whether to automatically enable translation
        // void sendMessage('checkAndAskAutoPageTranslation', { url: to, detectedCodeOrUnd });
      }
    }
  };

  const handleExtensionUrlChange = (e: Event) => {
    const customEvent = e as CustomEvent<{ from: string; to: string }>;
    const { from, to } = customEvent.detail;
    void handleUrlChange(from, to);
  };
  window.addEventListener(EVENT_EXTENSION_URL_CHANGE, handleExtensionUrlChange);

  // TODO:
  // // Listen for translation state changes from background
  // const cleanupTranslationStateListener = onMessage("askManagerToTogglePageTranslation", (msg) => {
  //   const { enabled, analyticsContext } = msg.data
  //   if (enabled === manager.isActive)
  //     return
  //   enabled ? void manager.start(window === window.top ? analyticsContext : undefined) : manager.stop()
  // })

  ctx.onInvalidated(() => {
    removeTranslationToast();
    cleanupUrlListener();
    teardownNodeTranslation();
    cleanupPageTranslationTriggers();
    cleanupTranslationShortcut();
    // cleanupTranslationStateListener()
    window.removeEventListener(EVENT_EXTENSION_URL_CHANGE, handleExtensionUrlChange);
    window.__ANYLANG_ADAPTIVE_TRANSLATE_INJECTED__ = false;
    // clearEffectiveSiteControlUrl()
  });

  // Only the top frame should detect and set language to avoid race conditions from iframes
  if (window === window.top) {
    // TODO:
    // const { detectedCodeOrUnd } = await getDocumentInfo()
    // const initialDetectedCode: LangCodeISO6393 = detectedCodeOrUnd === "und" ? "eng" : detectedCodeOrUnd
    // await storage.setItem<LangCodeISO6393>(`local:${DETECTED_CODE_STORAGE_KEY}`, initialDetectedCode)
    // // Check if auto-translation should be enabled for initial page load
    // void sendMessage("checkAndAskAutoPageTranslation", { url: window.location.href, detectedCodeOrUnd })
  }
}
