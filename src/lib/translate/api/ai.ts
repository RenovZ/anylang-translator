import { generateText } from 'ai';

import errorManager from '@/lib/error';
import providerManager from '@/lib/provider';
import type { PromptResolver } from '@/types/prompt';
import type { AIProvider } from '@/types/provider';

const THINK_TAG_RE = /<\/think>([\s\S]*)/;

export async function aiTranslate<TContext>(
  text: string,
  targetLangName: string,
  providerConfig: AIProvider,
  promptResolver: PromptResolver<TContext>,
  options?: { isBatch?: boolean; context?: TContext }
) {
  // TODO: Implement go/zen provider aiTranslate
  if (providerConfig.type === 'go' || providerConfig.type === 'zen') {
    throw new Error('aiTranslate: go/zen provider will come soon');
  }

  const { model, provider, providerOptions: userOptions, temperature } = providerConfig;
  const providerOptions = providerManager.overrideOptions(model, provider, userOptions);
  const languageModel = await providerManager.getLanguageModel(model);

  const { systemPrompt, prompt } = promptResolver(providerConfig, targetLangName, text, options);

  try {
    const { text: translatedText } = await generateText({
      model: languageModel,
      system: systemPrompt,
      prompt,
      temperature,
      providerOptions,
      maxRetries: 0 // Disable SDK built-in retries, let RequestQueue/BatchQueue handle it
    });

    const [, finalTranslation = translatedText] = translatedText.match(THINK_TAG_RE) || [];

    return finalTranslation;
  } catch (error) {
    throw new Error(errorManager.extractAISDKErrorMessage(error));
  }
}
