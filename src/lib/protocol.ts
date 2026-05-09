import { defineExtensionMessaging } from '@webext-core/messaging';

import type { FeatureUsedEvent } from '@/types/analytics';
import type { GenerateTextParams, GenerateTextResult } from '@/types/background';

interface Protocol {
  generateText: (data: GenerateTextParams) => Promise<GenerateTextResult>;

  // navigation
  openPage: (data: { url: string; active?: boolean }) => void;
  openOptionsPage: () => void;

  // features
  quickTranslate: (data: { text: string }) => void;
  getEnablePageTranslationFromContentScript: () => Promise<boolean>;

  contextTranslate: () => void;
  instantLookup: () => void;

  // analytics
  trackFeatureUsedEvent: (data: FeatureUsedEvent) => void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<Protocol>();
