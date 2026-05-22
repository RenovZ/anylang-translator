import { defineExtensionMessaging } from '@webext-core/messaging';

import type { FeatureUsedEvent } from '@/types/analytics';
import type { GenerateTextParams, GenerateTextResult } from '@/types/background';
import type { FeaturePayload } from '@/types/feature';
import type { DetectedLangCode, LangCode } from '@/types/lang';
import type { ProviderConfig } from '@/types/provider';

interface Protocol {
  generateText: (data: GenerateTextParams) => Promise<GenerateTextResult>;

  // navigation
  openPage: (data: { url: string; active?: boolean }) => Promise<void>;
  openOptionsPage: () => Promise<void>;

  // features
  tryAdaptiveTranslate: (data: FeaturePayload) => Promise<void>;
  // getPageTranslationActive
  getAdaptiveTranslateState: (data: { tabId?: number }) => Promise<boolean>;
  // reportPageTranslateState
  reportAdaptiveTranslateState: (data: { enabled: boolean }) => Promise<void>;
  // checkAutoPageTranslation: for auto start page translation
  checkAutoAdaptiveTranslate: (data: {
    url: string;
    detectedCodeOrUnd: DetectedLangCode;
  }) => Promise<void>;
  // enqueueTranslateRequest
  enqueueAdaptiveTranslateRequest: (data: {
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

  // popup / floating button → background → content script
  // trySetPageTranslationByTabId: (data: {
  //   tabId: number;
  //   enabled: boolean;
  //   analyticsContext?: FeatureUsageContext;
  // }) => Promise<void>;
  // trySetPageTranslationFromContentScript: (data: {
  //   enabled: boolean;
  //   analyticsContext?: FeatureUsageContext;
  // }) => Promise<void>;

  // togglePageTranslation
  adaptiveTranslate: (data: FeaturePayload) => Promise<void>;
  instantLookup: (data: FeaturePayload) => Promise<void>;
  intelligentInput: (data: FeaturePayload) => Promise<void>;
  bilingualSubtitles: (data: FeaturePayload) => Promise<void>;
  panoramaReading: (data: FeaturePayload) => Promise<void>;
  writingCopilot: (data: FeaturePayload) => Promise<void>;

  // analytics
  trackFeatureUsedEvent: (data: FeatureUsedEvent) => Promise<void>;

  // page translate
  // getOrGenerateWebPageSummary
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
