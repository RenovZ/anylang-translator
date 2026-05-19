import analyticsManager from '@/lib/analytics';
import configStore from '@/lib/config';
import logger from '@/lib/logger';
import { onMessage, sendMessage } from '@/lib/protocol';
import { adaptiveTranslateSession } from '@/lib/session';
import { shouldEnableAutoTranslation } from '@/lib/translate/sw';
import { ANALYTICS_FEATURE, ANALYTICS_SURFACE } from '@/preset/analytics';
import { FEAT_ADAPTIVE_TRANSLATE } from '@/preset/feature';

export function registerTranslate() {
  onMessage('getAdaptiveTranslateState', async (msg) => {
    logger.debug('getAdaptiveTranslateState', { msg });
    const tabId = msg.data?.tabId ?? msg.sender?.tab?.id;
    if (typeof tabId === 'number') {
      return adaptiveTranslateSession.get(tabId).enabled;
    }
    logger.error('Invalid tabId of getAdaptiveTranslateState', { msg });
    return false;
  });

  // translate.content/bootstrap.ts
  onMessage('checkAutoAdaptiveTranslate', async (msg) => {
    logger.debug('checkAutoAdaptiveTranslate', { msg });
    const tabId = msg.sender?.tab?.id;
    const { url, detectedCodeOrUnd } = msg.data;
    if (typeof tabId === 'number') {
      const config = configStore.get();
      const {
        sourceLangCode,
        adaptiveTranslate: { autoTranslatedSites, autoTranslatedLangs }
      } = config;
      const shouldEnable = shouldEnableAutoTranslation(
        url,
        detectedCodeOrUnd,
        sourceLangCode ?? 'auto',
        autoTranslatedSites,
        autoTranslatedLangs
      );
      if (shouldEnable) {
        logger.debug('adaptiveTranslate', { shouldEnable, url, detectedCodeOrUnd });
        void sendMessage(
          'adaptiveTranslate',
          {
            enabled: true,
            analyticsContext: analyticsManager.createFeatureUsageContext(
              ANALYTICS_FEATURE[FEAT_ADAPTIVE_TRANSLATE],
              ANALYTICS_SURFACE.PAGE_AUTO
            )
          },
          tabId
        );
      }
    }
  });

  // popup / adaptive-translate
  onMessage('tryAdaptiveTranslate', async (msg) => {
    logger.debug('tryAdaptiveTranslate', { msg });
    const { tabId, enabled, analyticsContext } = msg.data;
    if (!tabId) {
      logger.error('tryAdaptiveTranslate no tabId provided', { msg });
      return;
    }
    logger.debug('adaptiveTranslate', { tabId, enabled, analyticsContext });
    void sendMessage('adaptiveTranslate', { enabled, analyticsContext }, tabId);
  });

  // // side.content / floating-button
  // onMessage('trySetPageTranslationFromContentScript', async (msg) => {
  //   logger.debug('trySetPageTranslationFromContentScript', { msg });
  //   const tabId = msg.sender?.tab?.id;
  //   const { enabled, analyticsContext } = msg.data;
  //   if (typeof tabId === 'number') {
  //     logger.debug('adaptiveTranslate', { tabId, enabled, analyticsContext });
  //     void sendMessage('adaptiveTranslate', { enabled, analyticsContext }, tabId);
  //   } else {
  //     logger.error('tabId is not a number', { msg });
  //   }
  // });

  // page-translation
  onMessage('reportAdaptiveTranslateState', async (msg) => {
    logger.debug('reportPageTranslateState', { msg });
    const tabId = msg.sender?.tab?.id;
    const { enabled } = msg.data;
    if (typeof tabId === 'number') {
      await adaptiveTranslateSession.set(tabId, { enabled });
    } else {
      logger.error('tabId is not a number', { msg });
    }
  });
}
