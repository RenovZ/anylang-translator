import type { ContentScriptContext } from '#imports';

import { toast } from '@/components/isolated-toast';
import configStore from '@/lib/config';
import contentManager from '@/lib/content';
import logger from '@/lib/logger';
import { onMessage, sendMessage } from '@/lib/protocol';
import { styleInjector } from '@/lib/translate/ui';

import { bindTranslationShortcutKey, nodeTranslation, PageTranslateManager } from './control';
import { EVENT_EXTENSION_URL_CHANGE, setupUrlChangeListener } from './listen';

export async function bootstrap(ctx: ContentScriptContext) {
  const {
    langDetection: { mode: langDetectionMode },
    adaptiveTranslate: {
      autoAppliedSites,
      autoAppliedLangs,
      translate: { pageRange }
    }
  } = configStore.get();

  styleInjector.ensurePresetStyles(document);

  const cleanupUrlListener = setupUrlChangeListener();

  const teardownNodeTranslation = nodeTranslation.register();

  const manager = new PageTranslateManager();

  const cleanupTriggers = manager.registerTriggers();

  const cleanupTranslationShortcut = bindTranslationShortcutKey(manager);

  // For late-loading iframes: check if translation is already enabled for this tab
  let translationEnabled = false;
  try {
    logger.debug('getPageTranslationActive');
    translationEnabled = await sendMessage('getPageTranslationActive');
  } catch (error) {
    // Extension context may be invalidated during update, proceed without auto-start
    logger.error('Failed to check translation state:', { error });
  }
  logger.trace({ translationEnabled });
  if (translationEnabled) {
    void manager.start();
  }

  const handleUrlChange = async (from: string, to: string) => {
    if (from !== to) {
      logger.info('URL changed ', { from, to });
      if (manager.isTranslating) {
        manager.stop();
      }

      // Only the top frame should detect and set language to avoid race conditions from iframes
      if (window === window.top) {
        const { detectedCodeOrUnd } = await contentManager.getDocumentInfo({
          autoAppliedSites,
          autoAppliedLangs,
          pageRange,
          langDetectionMode
        });
        logger.trace({ detectedCodeOrUnd });
        await configStore.setDetectedLangCode(detectedCodeOrUnd);

        logger.debug('checkAutoPageTranslation', { to, detectedCodeOrUnd });
        // Notify background script that URL has changed, let it decide whether to automatically enable translation
        void sendMessage('checkAutoPageTranslation', { url: to, detectedCodeOrUnd });
      }
    }
  };

  const handleExtensionUrlChange = (e: Event) => {
    const customEvent = e as CustomEvent<{ from: string; to: string }>;
    const { from, to } = customEvent.detail;
    void handleUrlChange(from, to);
  };
  window.addEventListener(EVENT_EXTENSION_URL_CHANGE, handleExtensionUrlChange);

  // Listen for translation state changes from background
  const cleanupTranslationStateListener = onMessage('togglePageTranslation', (msg) => {
    logger.debug('togglePageTranslation', { msg });
    const { enabled, analyticsContext } = msg.data;
    if (enabled === manager.isTranslating) return;
    if (enabled) {
      void manager.start(window === window.top ? analyticsContext : undefined);
    } else {
      manager.stop();
    }
  });

  ctx.onInvalidated(() => {
    toast.destroy();
    cleanupUrlListener();
    teardownNodeTranslation();
    cleanupTriggers();
    cleanupTranslationShortcut();
    cleanupTranslationStateListener();
    window.removeEventListener(EVENT_EXTENSION_URL_CHANGE, handleExtensionUrlChange);
    window.__ANYLANG_ADAPTIVE_TRANSLATE_INJECTED__ = false;
  });

  // Only the top frame should detect and set language to avoid race conditions from iframes
  if (window === window.top) {
    const { detectedCodeOrUnd } = await contentManager.getDocumentInfo({
      autoAppliedSites,
      autoAppliedLangs,
      pageRange,
      langDetectionMode
    });
    logger.trace({ detectedCodeOrUnd });
    await configStore.setDetectedLangCode(detectedCodeOrUnd);

    logger.debug('checkAutoPageTranslation', { url: window.location.href, detectedCodeOrUnd });
    // Check if auto-translation should be enabled for initial page load
    void sendMessage('checkAutoPageTranslation', {
      url: window.location.href,
      detectedCodeOrUnd
    });
  }
}
