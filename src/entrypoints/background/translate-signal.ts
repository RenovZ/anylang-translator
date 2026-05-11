import configStore from '@/lib/config';
import logger from '@/lib/logger';
import { onMessage, sendMessage } from '@/lib/protocol';
import { translateState } from '@/lib/session';
import autoTranslation from '@/lib/translate/auto-translation';

export function registerTranslate() {
  onMessage('getPageTranslationActive', async (msg) => {
    const tabId = msg.sender?.tab?.id;
    if (typeof tabId === 'number') {
      return translateState.get(tabId).enabled;
    }
    logger.error('Invalid tabId of getPageTranslationActive', { msg });
    return false;
  });

  // translate.content/bootstrap.ts
  onMessage('checkAutoPageTranslation', async (msg) => {
    const tabId = msg.sender?.tab?.id;
    const { url, detectedCodeOrUnd } = msg.data;
    if (typeof tabId === 'number') {
      const config = configStore.get();
      if (!config) return;
      const shouldEnable = await autoTranslation.run(url, detectedCodeOrUnd);
      if (shouldEnable) {
        void sendMessage(
          'togglePageTranslation',
          {
            enabled: true
            // TODO: analyticsContext: createFeatureUsageContext(ANALYTICS_FEATURE.PAGE_TRANSLATION, ANALYTICS_SURFACE.PAGE_AUTO)
          },
          tabId
        );
      }
    }
  });

  // popup / adaptive-translate
  onMessage('adaptiveTranslate', async (msg) => {
    logger.debug({ msg });
    const { tabId, enabled, analyticsContext } = msg.data;
    void sendMessage('togglePageTranslation', { enabled, analyticsContext }, tabId);
  });

  // side.content / floating-button
  onMessage('trySetPageTranslationFromContentScript', async (msg) => {
    const tabId = msg.sender?.tab?.id;
    const { enabled, analyticsContext } = msg.data;
    if (typeof tabId === 'number') {
      void sendMessage('togglePageTranslation', { enabled, analyticsContext }, tabId);
    } else {
      logger.error('tabId is not a number', { msg });
    }
  });

  // page-translation
  onMessage('reportPageTranslateState', async (msg) => {
    const tabId = msg.sender?.tab?.id;
    const { enabled } = msg.data;
    if (typeof tabId === 'number') {
      await translateState.set(tabId, { enabled });
    } else {
      logger.error('tabId is not a number', { msg });
    }
  });
}
