import { defineExtensionMessaging } from '@webext-core/messaging';

import type { FeatureUsedEventProperties } from '@/types/analytics';

interface Protocol {
  // navigation
  openPage: (data: { url: string; active?: boolean }) => void;
  openOptionsPage: () => void;

  // features
  quickTranslate: (data: { text: string }) => void;
  contextTranslate: () => void;
  instantLookup: () => void;

  // analytics
  trackFeatureUsedEvent: (data: FeatureUsedEventProperties) => void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<Protocol>();
