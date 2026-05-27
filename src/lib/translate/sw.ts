import { generateText } from 'ai';

import lang from '@/lib/lang';
import logger from '@/lib/logger';
import providerManager from '@/lib/provider';
import urlUtils from '@/lib/url';
import type { DetectedLangCode, LangCode } from '@/types/lang';
import type { PromptResolver } from '@/types/prompt';
import { AIProvider, isPaidProvider, type ProviderConfig } from '@/types/provider';

import { aiTranslate } from './api/ai';
import { bingTranslate } from './api/bing';
import { googleTranslate } from './api/google';
import { translateUtils } from './utils';

export function shouldEnableAutoTranslation(
  url: string,
  detectedCodeOrUnd: DetectedLangCode,
  sourceLangCode: LangCode | 'auto' | 'default',
  autoAppliedSites: string[] = [],
  autoAppliedLangs: LangCode[] = []
): boolean {
  const doesMatchSites =
    autoAppliedSites.some((pattern) => urlUtils.matchDomainPattern(url, pattern)) ?? false;

  let doesMatchLangs = false;
  if (detectedCodeOrUnd !== 'und') {
    doesMatchLangs = autoAppliedLangs.includes(
      lang.getFinalLangCode(sourceLangCode, detectedCodeOrUnd)
    );
  }

  return doesMatchSites || doesMatchLangs;
}

/**
 * Execute a translation request using the given provider config.
 *
 * The actual per-provider API calls (Google, Microsoft, OpenAI, etc.)
 * live in `translate/api/*` and are handled by the background service worker
 * via `sendMessage('enqueueAdaptiveTranslateRequest', ...)`.
 *
 * This function is the thin dispatch layer that validates input and routes
 * to the appropriate backend — it is intentionally kept provider-agnostic
 * so that the content script never embeds API keys or network logic.
 */
export async function translate<TContext>(
  text: string,
  sourceLangCode: LangCode | 'auto' | 'default',
  targetLangCode: LangCode,
  providerConfig: ProviderConfig,
  promptResolver: PromptResolver<TContext>,
  options?: {
    forceBackgroundFetch?: boolean;
    isBatch?: boolean;
    context?: TContext;
  }
): Promise<string> {
  logger.trace({ text, sourceLangCode, targetLangCode, providerConfig, options });

  const preparedText = translateUtils.prepareTranslationText(text);
  if (!preparedText) return '';

  const { provider, type } = providerConfig;

  if (type === 'free') {
    const sourceLang =
      sourceLangCode === 'auto' || sourceLangCode === 'default' ? 'auto' : sourceLangCode;

    if (provider === 'google-translate') {
      return await googleTranslate(preparedText, sourceLang, targetLangCode);
    }

    if (provider === 'bing-translate') {
      return await bingTranslate(preparedText, sourceLang, targetLangCode);
    }

    logger.error('Unsupported free provider', { provider, type });
    return '';
  }

  if (isPaidProvider(providerConfig)) {
    // TODO: route to appropriate free/go/zen provider call
    throw new Error('translate: go/zen provider not yet implemented');
  }

  if (type === 'custom') {
    return await aiTranslate(
      preparedText,
      sourceLangCode,
      targetLangCode,
      providerConfig,
      promptResolver,
      options
    );
  }

  throw new Error(`Unsupported ${type} provider: ${provider}`);
}

/**
 * Generate a brief summary of article content for translation context
 */
export async function generateArticleSummary(
  title: string,
  textContent: string,
  providerConfig: AIProvider
): Promise<string | null> {
  const preparedText = translateUtils.cleanText(textContent);
  if (!preparedText) return null;

  // TODO: Implement go/zen provider detection
  if (isPaidProvider(providerConfig)) {
    throw new Error('generateArticleSummary: go/zen provider will come soon');
  }

  const {
    model,
    name: providerName,
    provider,
    providerOptions: userOptions,
    temperature
  } = providerConfig;
  if (!model.name) {
    throw new Error('generateArticleSummary: model must be provided');
  }

  try {
    const providerOptions = providerManager.overrideOptions(model.name, provider, userOptions);
    const languageModel = await providerManager.getLanguageModel(providerName);

    const prompt = `Summarize the following article in 2-3 sentences. Focus on the main topic and key points. Return ONLY the summary, no explanations or formatting.

Title: ${title}

Content:
${preparedText}`;

    const { text: summary } = await generateText({
      model: languageModel,
      prompt,
      temperature,
      providerOptions
    });

    const cleanedSummary = summary.trim();
    logger.info({
      summary: `${cleanedSummary.slice(0, 100)}...`
    });

    return cleanedSummary;
  } catch (error) {
    logger.error({ error });
    return null;
  }
}
