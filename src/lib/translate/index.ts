import { toast } from '@/components/isolated-toast';
import configStore from '@/lib/config';
import contentManager from '@/lib/content';
import cryptoPolyfill from '@/lib/crypto-polyfill';
import domFilter from '@/lib/dom/filter';
import domFind from '@/lib/dom/find';
import domTraversal from '@/lib/dom/traversal';
import i18n from '@/lib/i18n';
import logger from '@/lib/logger';
import type { WebPagePromptContext } from '@/types/content';
import type { Point } from '@/types/dom';
import type { LangCode } from '@/types/lang';
import type { PromptResolver } from '@/types/prompt';
import type { ProviderConfig } from '@/types/provider';
import type { InputTranslationLang } from '@/types/translate';

import { aiTranslate } from './api/ai';
import { bingTranslate } from './api/bing';
import { googleTranslate } from './api/google';
import { prepareTranslationText, translateTextCore, translateWalkedElement } from './core';
import * as webpage from './webpage';

/**
 * Execute a translation request using the given provider config.
 *
 * The actual per-provider API calls (Google, Microsoft, OpenAI, etc.)
 * live in `translate/api/*` and are handled by the background service worker
 * via `sendMessage('enqueueTranslateRequest', ...)`.
 *
 * This function is the thin dispatch layer that validates input and routes
 * to the appropriate backend — it is intentionally kept provider-agnostic
 * so that the content script never embeds API keys or network logic.
 *
 * TODO: Wire up per-provider dispatch once translate/api/* is implemented.
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

  const preparedText = prepareTranslationText(text);
  if (preparedText === '') {
    return '';
  }

  const { provider, type } = providerConfig;

  if (type === 'free') {
    const sourceLang =
      sourceLangCode === 'auto' || sourceLangCode === 'default' ? 'auto' : sourceLangCode;
    const targetLang = targetLangCode;

    if (provider === 'google-translate') {
      return await googleTranslate(preparedText, sourceLang, targetLang);
    }

    if (provider === 'bing-translate') {
      return await bingTranslate(preparedText, sourceLang, targetLang);
    }

    logger.error('Unsupported free provider', { provider, type });
    return '';
  }

  if (type === 'go' || type === 'zen') {
    // TODO: route to appropriate free/go/zen provider call
    throw new Error('executeTranslate: free/go/zen provider not yet implemented');
  }

  if (type === 'custom') {
    const targetLangName = targetLangCode;
    return await aiTranslate(preparedText, targetLangName, providerConfig, promptResolver, options);
  }

  throw new Error(`Unsupported ${type} provider: ${provider}`);
}

const MIN_LANG_DETECT_LEN = 50;

export function validateConfig(): boolean {
  const config = configStore.get();
  const { langCode: detectedCode } = config.langDetection;

  if (
    config.sourceLangCode === config.targetLangCode ||
    (!config.sourceLangCode && detectedCode === config.targetLangCode)
  ) {
    toast.error(
      i18n('toast_translation_same_langauge', {
        defaultValue: 'Source and target languages are the same'
      })
    );
    logger.trace('skipped on same language found');
    return false;
  }

  // TODO: 是否需要验证apiKey
  // // check if the API key is configured
  // if (
  //   isAPIProviderConfig(providerConfig) &&
  //   !providerConfig.apiKey?.trim() &&
  //   !['deeplx', 'ollama'].includes(providerConfig.provider)
  // ) {
  //   toast.error(...)
  //   logger.info('skipped on no API key found');
  //   return false;
  // }

  return true;
}

// High-level orchestration function
export async function removeOrShowNodeTranslation(point: Point): Promise<void> {
  const node = domFind.blockNodeAt(point);
  if (!node || !domFilter.isHTMLElement(node)) return;

  if (!validateConfig()) return;

  const id = cryptoPolyfill.getUUID();
  domTraversal.walkAndLabelElement(node, id);
  await translateWalkedElement(node, id, true);
}

// TODO: 不确定是否要这个功能
// async isSmallParagraph(text: string): Promise<boolean> {
//   const config = configStore.get();
//   const { minCharactersPerNode, minWordsPerNode } = config.quickTranslate.translate.page;
//   const { sourceCode } = config.sourceLangCode;

//   if (minCharactersPerNode > 0 && text.length < minCharactersPerNode) return true;

//   if (minWordsPerNode > 0) {
//     const finalSourceCode = await getSourceCode(sourceCode);
//     if (countWords(text, finalSourceCode) < minWordsPerNode) return true;
//   }

//   return false;
// }

async function isTargetLang(text: string, targetCode: LangCode): Promise<boolean> {
  if (text.length < MIN_LANG_DETECT_LEN) return false;
  const detected = await contentManager.detectLangCode(text, { enableLLM: false });
  return detected === targetCode;
}

async function getPageContext(
  providerConfig: ProviderConfig,
  enableAIContentAware: boolean,
  includeSummary: boolean
): Promise<WebPagePromptContext | undefined> {
  // Only LLM (non-free) providers can use web page context
  if (providerConfig.type === 'free') {
    return undefined;
  }

  const ctx = await webpage.context.get();
  if (!ctx) {
    return undefined;
  }

  const webSummary = includeSummary
    ? await webpage.summary.get(ctx, providerConfig, enableAIContentAware)
    : undefined;

  return {
    webTitle: ctx.webTitle,
    webContent: ctx.webContent,
    webSummary: webSummary ?? undefined
  };
}

async function doTranslatePage(
  text: string,
  options: {
    extraHashTags?: string[];
    webPageContext?: WebPagePromptContext;
  } = {}
): Promise<string> {
  const config = configStore.get();
  const preparedText = text.trim();
  if (preparedText === '') {
    return '';
  }

  const providerConfig = config.adaptiveTranslate.provider;
  const targetLangCode = config.targetLangCode as LangCode;
  const sourceLangCode = (config.sourceLangCode ?? 'auto') as LangCode | 'auto';

  if (await isTargetLang(preparedText, targetLangCode)) {
    logger.info(
      `translateTextForPage: skipping translation because text is already in target language. text: ${preparedText}`
    );
    return '';
  }

  // NOTE: we dont need this check anymore
  // // Skip translation if text is in skipLanguages list (page translation only)
  // const { skipLanguages } = config.quickTranslate.translate;
  // if (skipLanguages.length > 0 && preparedText.length >= MIN_SKIP_LEN) {
  //   const shouldSkip = await translateText.shouldSkipLang(
  //     preparedText,
  //     skipLanguages as LangCode[],
  //     config.langDetection.mode === 'llm'
  //   );
  //   if (shouldSkip) {
  //     logger.info(
  //       `translateTextForPage: skipping translation because text is in skip language list. text: ${preparedText}`
  //     );
  //     return '';
  //   }
  // }

  return translateTextCore({
    text: preparedText,
    sourceLangCode,
    targetLangCode,
    providerConfig,
    extraHashTags: options.extraHashTags,
    webPageContext: options.webPageContext
  });
}

/**
 * Page translation — uses the quickTranslate provider.
 * Includes skip-language logic (page translation only).
 */
export async function translateTextForPage(text: string): Promise<string> {
  const config = configStore.get();
  const providerConfig = config.adaptiveTranslate.provider;
  const webPageContext = await getPageContext(
    providerConfig,
    false /* enableAIContentAware — TODO wire up when config field exists */,
    true
  );

  return doTranslatePage(text, {
    webPageContext
  });
}

/**
 * Page title translation — uses page translation settings, but always treats the
 * current source title as the webpage title context.
 */
export async function translateTextForPageTitle(text: string): Promise<string> {
  const config = configStore.get();
  const providerConfig = config.adaptiveTranslate.provider;

  // prettier-ignore
  const { webContent, webSummary } =
      (await getPageContext(
        providerConfig,
        false /* enableAIContentAware */,
        false
      )) ?? {};

  return doTranslatePage(text, {
    extraHashTags: ['pageTitleTranslation'],
    webPageContext: {
      webTitle: text,
      webContent,
      webSummary
    }
  });
}

async function resolveLang(
  lang: InputTranslationLang,
  sourceLangCode: LangCode | undefined,
  targetLangCode: LangCode
): Promise<LangCode> {
  if (lang === 'sourceCode') {
    return (sourceLangCode ?? targetLangCode) as LangCode;
  }
  if (lang === 'targetCode') {
    return targetLangCode;
  }
  return lang as LangCode;
}

/**
 * Input translation — translates user-typed text using configured languages.
 */
export async function translateTextForInput(
  text: string,
  fromLang: InputTranslationLang,
  toLang: InputTranslationLang
): Promise<string> {
  const config = configStore.get();
  const providerConfig = config.adaptiveTranslate.provider;
  const targetLangCode = config.targetLangCode as LangCode;
  const sourceLangCode = config.sourceLangCode as LangCode | undefined;

  const resolvedFromLang = await resolveLang(fromLang, sourceLangCode, targetLangCode);
  const resolvedToLang = await resolveLang(toLang, sourceLangCode, targetLangCode);

  if (resolvedFromLang === resolvedToLang) {
    return '';
  }

  const webPageContext = await getPageContext(
    providerConfig,
    false /* enableAIContentAware */,
    true
  );

  return translateTextCore({
    text,
    sourceLangCode: resolvedFromLang,
    targetLangCode: resolvedToLang,
    providerConfig,
    extraHashTags: [`inputTranslation:${fromLang}->${toLang}`],
    webPageContext
  });
}
