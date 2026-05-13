import contentManager from '@/lib/content';
import db from '@/lib/db';
import { sha256 } from '@/lib/hash';
import logger from '@/lib/logger';
import { getSubtitlesTranslatePrompt, getTranslatePrompt } from '@/lib/prompt';
import { onMessage } from '@/lib/protocol';
import { BatchQueue } from '@/lib/request/batch-queue';
import { RequestQueue } from '@/lib/request/request-queue';
import { translate } from '@/lib/translate';
import { normalizePromptContextValue } from '@/lib/translate/core';
import { putBatchRequestRecord } from '@/lib/utils/batch-request-record';
import { BATCH_SEPARATOR } from '@/preset/prompt';
import { DEFAULT_BATCH_QUEUE_CONFIG, DEFAULT_REQUEST_QUEUE_CONFIG } from '@/preset/translate';
import { WebPagePromptContext } from '@/types/content';
import type { PromptResolver, SubtitlePromptContext } from '@/types/prompt';
import { AIProvider, isLLMProvider, ProviderConfig } from '@/types/provider';
import type { TranslateBatchData } from '@/types/translate';

export function parseBatchResult(result: string): string[] {
  return result.split(BATCH_SEPARATOR).map((t) => t.trim());
}

export function shouldUseBatchQueue(providerConfig: ProviderConfig): boolean {
  return isLLMProvider(providerConfig);
}

export async function executeBatchTranslation<TContext>(
  dataList: TranslateBatchData<TContext>[],
  promptResolver: PromptResolver<TContext>
): Promise<string[]> {
  const { sourceLangCode, targetLangCode, providerConfig, context } = dataList[0];
  const texts = dataList.map((d) => d.text);

  const batchText = texts.join(`\n\n${BATCH_SEPARATOR}\n\n`);
  const result = await translate(
    batchText,
    sourceLangCode,
    targetLangCode,
    providerConfig,
    promptResolver,
    {
      isBatch: true,
      context
    }
  );
  return parseBatchResult(result);
}

async function getOrGenerateWebPageSummary(
  webTitle: string,
  webContent: string,
  providerConfig: AIProvider,
  requestQueue: RequestQueue
): Promise<string | null> {
  const preparedText = contentManager.cleanText(webContent);
  if (!preparedText) {
    return null;
  }

  const textHash = sha256(preparedText);
  const cacheKey = sha256(webTitle, textHash, JSON.stringify(providerConfig));

  const cached = await db.articleSummaryCache.get(cacheKey);
  if (cached) {
    logger.info('Using cached summary');
    return cached.summary;
  }

  const thunk = async () => {
    const cachedAgain = await db.articleSummaryCache.get(cacheKey);
    if (cachedAgain) {
      return cachedAgain.summary;
    }

    const summary = await contentManager.generateArticleSummary(
      webTitle,
      webContent,
      providerConfig
    );
    if (!summary) {
      return '';
    }

    await db.articleSummaryCache.put({
      key: cacheKey,
      summary,
      createdAt: new Date()
    });

    logger.info('Generated and cached new summary');
    return summary;
  };

  try {
    const summary = await requestQueue.enqueue(thunk, Date.now(), cacheKey);
    return summary || null;
  } catch (error) {
    logger.warn('Failed to get/generate summary:', { error });
    return null;
  }
}

async function createTranslationQueues<TContext>(promptResolver: PromptResolver<TContext>) {
  const requestQueue = new RequestQueue({
    rate: DEFAULT_REQUEST_QUEUE_CONFIG.rate,
    capacity: DEFAULT_REQUEST_QUEUE_CONFIG.capacity,
    timeoutMs: 20_000,
    maxRetries: 2,
    baseRetryDelayMs: 1_000
  });

  const batchQueue = new BatchQueue<TranslateBatchData<TContext>, string>({
    maxCharactersPerBatch: DEFAULT_BATCH_QUEUE_CONFIG.maxCharactersPerBatch,
    maxItemsPerBatch: DEFAULT_BATCH_QUEUE_CONFIG.maxItemsPerBatch,
    batchDelay: 100,
    maxRetries: 3,
    enableFallbackToIndividual: true,
    getBatchKey: (data) => {
      return sha256(`${data.sourceLangCode}-${data.targetLangCode}-${data.providerConfig.name}`);
    },
    getCharacters: (data) => data.text.length,
    executeBatch: async (dataList) => {
      const { providerConfig } = dataList[0];
      const hash = sha256(...dataList.map((d) => d.hash));
      const earliestScheduleAt = Math.min(...dataList.map((d) => d.scheduleAt));

      const batchThunk = async (): Promise<string[]> => {
        await putBatchRequestRecord({ originalRequestCount: dataList.length, providerConfig });
        return await executeBatchTranslation(dataList, promptResolver);
      };

      return requestQueue.enqueue(batchThunk, earliestScheduleAt, hash);
    },
    executeIndividual: async (data) => {
      const { text, sourceLangCode, targetLangCode, providerConfig, hash, scheduleAt, context } =
        data;
      const thunk = async () => {
        await putBatchRequestRecord({ originalRequestCount: 1, providerConfig });
        return translate(text, sourceLangCode, targetLangCode, providerConfig, promptResolver, {
          context
        });
      };
      return requestQueue.enqueue(thunk, scheduleAt, hash);
    },
    onError: (error, context) => {
      const errorType = context.isFallback ? 'Individual request' : 'Batch request';
      logger.error(
        `${errorType} failed (batchKey: ${context.batchKey}, retry: ${context.retryCount}):`,
        { error }
      );
    }
  });

  return { requestQueue, batchQueue };
}

export async function setUpWebPageTranslationQueue() {
  const { requestQueue, batchQueue } = await createTranslationQueues(getTranslatePrompt);

  onMessage('enqueueTranslateRequest', async (message) => {
    logger.trace('enqueueTranslateRequest', { message });
    const {
      data: {
        text,
        sourceLangCode,
        targetLangCode,
        providerConfig,
        scheduleAt,
        hash,
        webTitle,
        webContent,
        webSummary
      }
    } = message;

    // Check cache first
    if (hash) {
      const cached = await db.translationCache.get(hash);
      if (cached) {
        return cached.translation;
      }
    }

    let result = '';
    const context: WebPagePromptContext = {
      webTitle: normalizePromptContextValue(webTitle),
      webContent: normalizePromptContextValue(webContent),
      webSummary: normalizePromptContextValue(webSummary)
    };

    if (shouldUseBatchQueue(providerConfig)) {
      const data = {
        text,
        sourceLangCode,
        targetLangCode,
        providerConfig,
        hash,
        scheduleAt,
        context
      };
      result = await batchQueue.enqueue(data);
    } else {
      // Create thunk based on type and params
      const thunk = () =>
        translate(text, sourceLangCode, targetLangCode, providerConfig, getTranslatePrompt);
      result = await requestQueue.enqueue(thunk, scheduleAt, hash);
    }

    // Cache the translation result if successful
    if (result && hash) {
      await db.translationCache.put({
        key: hash,
        translation: result,
        createdAt: new Date()
      });
    }

    return result;
  });

  onMessage('getOrGenerateWebPageSummary', async (message) => {
    logger.trace('getOrGenerateWebPageSummary', { message });
    const { webTitle, webContent, providerConfig } = message.data;

    if (!isLLMProvider(providerConfig) || !webTitle || !webContent) {
      return null;
    }

    return await getOrGenerateWebPageSummary(webTitle, webContent, providerConfig, requestQueue);
  });
}

async function getOrGenerateSubtitleSummary(
  videoTitle: string,
  subtitlesContext: string,
  providerConfig: AIProvider,
  requestQueue: RequestQueue
): Promise<string | null> {
  const preparedText = contentManager.cleanText(subtitlesContext);
  if (!preparedText) {
    return null;
  }

  const textHash = sha256(preparedText);
  const cacheKey = sha256(textHash, JSON.stringify(providerConfig));

  const cached = await db.articleSummaryCache.get(cacheKey);
  if (cached) {
    logger.info('Using cached summary');
    return cached.summary;
  }

  const thunk = async () => {
    const cachedAgain = await db.articleSummaryCache.get(cacheKey);
    if (cachedAgain) {
      return cachedAgain.summary;
    }

    const summary = await contentManager.generateArticleSummary(
      videoTitle,
      subtitlesContext,
      providerConfig
    );
    if (!summary) {
      return '';
    }

    await db.articleSummaryCache.put({
      key: cacheKey,
      summary,
      createdAt: new Date()
    });

    logger.info('Generated and cached new summary');
    return summary;
  };

  try {
    const summary = await requestQueue.enqueue(thunk, Date.now(), cacheKey);
    return summary || null;
  } catch (error) {
    logger.warn('Failed to get/generate summary:', { error });
    return null;
  }
}

/**
 * Set up subtitles translation queue and message handlers
 */
export async function setUpSubtitlesTranslationQueue() {
  const { requestQueue, batchQueue } = await createTranslationQueues(getSubtitlesTranslatePrompt);

  onMessage('enqueueSubtitlesTranslateRequest', async (message) => {
    logger.trace('enqueueSubtitlesTranslateRequest', { message });
    const {
      data: {
        text,
        sourceLangCode,
        targetLangCode,
        providerConfig,
        scheduleAt,
        hash,
        videoTitle,
        summary
      }
    } = message;

    if (hash) {
      const cached = await db.translationCache.get(hash);
      if (cached) {
        return cached.translation;
      }
    }

    let result = '';
    const context: SubtitlePromptContext = {
      videoTitle: normalizePromptContextValue(videoTitle),
      videoSummary: normalizePromptContextValue(summary)
    };

    if (shouldUseBatchQueue(providerConfig)) {
      const data = {
        text,
        sourceLangCode,
        targetLangCode,
        providerConfig,
        hash,
        scheduleAt,
        context
      };
      result = await batchQueue.enqueue(data);
    } else {
      const thunk = () =>
        translate(
          text,
          sourceLangCode,
          targetLangCode,
          providerConfig,
          getSubtitlesTranslatePrompt
        );
      result = await requestQueue.enqueue(thunk, scheduleAt, hash);
    }

    if (result && hash) {
      await db.translationCache.put({
        key: hash,
        translation: result,
        createdAt: new Date()
      });
    }

    return result;
  });

  onMessage('getSubtitlesSummary', async (message) => {
    logger.trace('getSubtitlesSummary', { message });
    const { videoTitle, subtitlesContext, providerConfig } = message.data;

    if (!isLLMProvider(providerConfig) || !videoTitle || !subtitlesContext) {
      return null;
    }

    return await getOrGenerateSubtitleSummary(
      videoTitle,
      subtitlesContext,
      providerConfig,
      requestQueue
    );
  });
}
