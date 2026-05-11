import { defineExtensionMessaging } from '@webext-core/messaging';

import type { FeatureUsageContext, FeatureUsedEvent } from '@/types/analytics';
import type { GenerateTextParams, GenerateTextResult } from '@/types/background';
import { LangCode } from '@/types/lang';
import type { Provider } from '@/types/provider';

interface Protocol {
  generateText: (data: GenerateTextParams) => Promise<GenerateTextResult>;

  // navigation
  openPage: (data: { url: string; active?: boolean }) => void;
  openOptionsPage: () => void;

  // features
  adaptiveTranslate: (data: {
    tabId: number;
    enabled: boolean;
    analyticsContext?: FeatureUsageContext;
  }) => void;
  getPageTranslationActive: () => Promise<boolean>;
  reportPageTranslateState: (data: { enabled: boolean }) => void;
  togglePageTranslation: (data: {
    enabled: boolean;
    analyticsContext?: FeatureUsageContext;
  }) => void;

  // popup / floating button → background → content script
  trySetPageTranslationByTabId: (data: {
    tabId: number;
    enabled: boolean;
    analyticsContext?: FeatureUsageContext;
  }) => void;
  trySetPageTranslationFromContentScript: (data: {
    enabled: boolean;
    analyticsContext?: FeatureUsageContext;
  }) => void;

  instantLookup: () => void;

  // for auto start page translation
  checkAutoPageTranslation: (data: { url: string; detectedCodeOrUnd: LangCode | 'und' }) => void;

  // analytics
  trackFeatureUsedEvent: (data: FeatureUsedEvent) => void;

  // page translate
  enqueueTranslateRequest: (data: {
    text: string;
    sourceLangCode: LangCode | 'auto';
    targetLangCode: LangCode;
    providerConfig: Provider;
    scheduleAt: number;
    hash: number;
    webTitle?: string | null;
    webContent?: string | null;
    webSummary?: string | null;
  }) => Promise<string>;

  getSummary: (data: {
    webTitle: string;
    webContent: string;
    providerConfig: Provider;
  }) => Promise<string | null>;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<Protocol>();
