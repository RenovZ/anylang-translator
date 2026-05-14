import { defineExtensionMessaging } from '@webext-core/messaging';

import type { FeatureUsageContext, FeatureUsedEvent } from '@/types/analytics';
import type { GenerateTextParams, GenerateTextResult } from '@/types/background';
import { LangCode } from '@/types/lang';
import type { ProviderConfig } from '@/types/provider';

interface Protocol {
  generateText: (data: GenerateTextParams) => Promise<GenerateTextResult>;

  // navigation
  openPage: (data: { url: string; active?: boolean }) => Promise<void>;
  openOptionsPage: () => Promise<void>;

  // features
  adaptiveTranslate: (data: {
    tabId: number;
    enabled: boolean;
    analyticsContext?: FeatureUsageContext;
  }) => Promise<void>;
  getPageTranslationActive: () => Promise<boolean>;
  reportPageTranslateState: (data: { enabled: boolean }) => Promise<void>;
  togglePageTranslation: (data: {
    enabled: boolean;
    analyticsContext?: FeatureUsageContext;
  }) => Promise<void>;

  // popup / floating button → background → content script
  trySetPageTranslationByTabId: (data: {
    tabId: number;
    enabled: boolean;
    analyticsContext?: FeatureUsageContext;
  }) => Promise<void>;
  trySetPageTranslationFromContentScript: (data: {
    enabled: boolean;
    analyticsContext?: FeatureUsageContext;
  }) => Promise<void>;

  instantLookup: () => Promise<void>;

  // for auto start page translation
  checkAutoPageTranslation: (data: {
    url: string;
    detectedCodeOrUnd: LangCode | 'und';
  }) => Promise<void>;

  // analytics
  trackFeatureUsedEvent: (data: FeatureUsedEvent) => Promise<void>;

  // page translate
  enqueueTranslateRequest: (data: {
    text: string;
    sourceLangCode: LangCode | 'auto' | 'default';
    targetLangCode: LangCode;
    providerConfig: ProviderConfig;
    scheduleAt: number;
    hash: string;
    webTitle?: string | null;
    webContent?: string | null;
    webSummary?: string | null;
  }) => Promise<string>;
  getOrGenerateWebPageSummary: (data: {
    webTitle: string;
    webContent: string;
    providerConfig: ProviderConfig;
  }) => Promise<string | null>;
  enqueueSubtitlesTranslateRequest: (data: {
    text: string;
    sourceLangCode: LangCode | 'auto' | 'default';
    targetLangCode: LangCode;
    providerConfig: ProviderConfig;
    scheduleAt: number;
    hash: string;
    videoTitle?: string | null;
    summary?: string | null;
  }) => Promise<string>;
  getSubtitlesSummary: (data: {
    videoTitle: string;
    subtitlesContext: string;
    providerConfig: ProviderConfig;
  }) => Promise<string | null>;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<Protocol>();
