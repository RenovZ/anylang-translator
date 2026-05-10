import configStore from '@/lib/config';
import { onMessage, sendMessage } from '@/lib/protocol';
import autoTranslation from '@/lib/translate/auto-translation';

export function translateMessage() {
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
}
