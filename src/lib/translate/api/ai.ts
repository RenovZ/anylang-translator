import { generateText } from 'ai';

import errorManager from '@/lib/error';
import logger from '@/lib/logger';
import providerManager from '@/lib/provider';
import type { PromptResolver } from '@/types/prompt';
import { isPaidProvider, type AIProvider } from '@/types/provider';

const THINK_TAG_RE = /<\/think>([\s\S]*)/;

export async function aiTranslate<TContext>(
  text: string,
  targetLangName: string,
  providerConfig: AIProvider,
  promptResolver: PromptResolver<TContext>,
  options?: { isBatch?: boolean; context?: TContext }
) {
  if (isPaidProvider(providerConfig)) {
    // TODO: Implement go/zen provider aiTranslate
    throw new Error('aiTranslate: go/zen provider will come soon');
  }

  const {
    model,
    name: providerName,
    provider,
    providerOptions: userOptions,
    temperature
  } = providerConfig;
  if (!model.name) {
    throw new Error('aiTranslate: model must be provided');
  }
  const providerOptions = providerManager.overrideOptions(model.name, provider, userOptions);
  const languageModel = await providerManager.getLanguageModel(providerName);

  const { systemPrompt, prompt } = promptResolver(providerConfig, targetLangName, text, options);

  const params = {
    model: languageModel,
    system: systemPrompt,
    prompt,
    temperature,
    providerOptions,
    maxRetries: 0 // Disable SDK built-in retries, let RequestQueue/BatchQueue handle it
  };

  try {
    const { text: translatedText } = await generateText(params);
    logger.trace({ params, translatedText });

    const [, finalTranslation = translatedText] = translatedText.match(THINK_TAG_RE) || [];

    return finalTranslation;
  } catch (error) {
    throw new Error(errorManager.extractAISDKErrorMessage(error), { cause: error });
  }
}
