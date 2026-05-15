import analyticsManager from '@/lib/analytics';
import configStore from '@/lib/config';
import logger from '@/lib/logger';
import { onMessage, sendMessage } from '@/lib/protocol';
import { translateState } from '@/lib/session';
import { shouldEnableAutoTranslation } from '@/lib/translate/sw';
import { ANALYTICS_FEATURE, ANALYTICS_SURFACE } from '@/preset/analytics';

export function registerTranslate() {
  onMessage('getPageTranslationActive', async (msg) => {
    logger.debug('getPageTranslationActive', { msg });
    const tabId = msg.sender?.tab?.id;
    if (typeof tabId === 'number') {
      return translateState.get(tabId).enabled;
    }
    logger.error('Invalid tabId of getPageTranslationActive', { msg });
    return false;
  });

  // translate.content/bootstrap.ts
  onMessage('checkAutoPageTranslation', async (msg) => {
    logger.debug('checkAutoPageTranslation', { msg });
    const tabId = msg.sender?.tab?.id;
    const { url, detectedCodeOrUnd } = msg.data;
    if (typeof tabId === 'number') {
      const config = configStore.get();
      const {
        sourceLangCode,
        adaptiveTranslate: { autoAppliedSites, autoAppliedLangs }
      } = config;
      const shouldEnable = await shouldEnableAutoTranslation(
        url,
        detectedCodeOrUnd,
        sourceLangCode ?? 'auto',
        autoAppliedSites,
        autoAppliedLangs
      );
      if (shouldEnable) {
        logger.debug('togglePageTranslation', { shouldEnable, url, detectedCodeOrUnd });
        void sendMessage(
          'togglePageTranslation',
          {
            enabled: true,
            analyticsContext: analyticsManager.createFeatureUsageContext(
              ANALYTICS_FEATURE.ADAPTIVE_TRANSLATE,
              ANALYTICS_SURFACE.PAGE_AUTO
            )
          },
          tabId
        );
      }
    }
  });

  // popup / adaptive-translate
  onMessage('adaptiveTranslate', async (msg) => {
    logger.debug('adaptiveTranslate', { msg });
    const { tabId, enabled, analyticsContext } = msg.data;
    logger.debug('togglePageTranslation', { tabId, enabled, analyticsContext });
    void sendMessage('togglePageTranslation', { enabled, analyticsContext }, tabId);
  });

  // side.content / floating-button
  onMessage('trySetPageTranslationFromContentScript', async (msg) => {
    logger.debug('trySetPageTranslationFromContentScript', { msg });
    const tabId = msg.sender?.tab?.id;
    const { enabled, analyticsContext } = msg.data;
    if (typeof tabId === 'number') {
      logger.debug('togglePageTranslation', { tabId, enabled, analyticsContext });
      void sendMessage('togglePageTranslation', { enabled, analyticsContext }, tabId);
    } else {
      logger.error('tabId is not a number', { msg });
    }
  });

  // page-translation
  onMessage('reportPageTranslateState', async (msg) => {
    logger.debug('reportPageTranslateState', { msg });
    const tabId = msg.sender?.tab?.id;
    const { enabled } = msg.data;
    if (typeof tabId === 'number') {
      await translateState.set(tabId, { enabled });
    } else {
      logger.error('tabId is not a number', { msg });
    }
  });
}
