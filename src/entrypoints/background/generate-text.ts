import { generateText } from 'ai';

import logger from '@/lib/logger';
import { onMessage } from '@/lib/protocol';
import providerManager from '@/lib/provider';
import type { GenerateTextParams, GenerateTextResult } from '@/types/background';

export async function runGenerateText(params: GenerateTextParams): Promise<GenerateTextResult> {
  const { providerName, ...restParams } = params;
  const model = await providerManager.getLanguageModel(providerName);

  const { text } = await generateText({
    ...restParams,
    model
  });

  return { text };
}

export function registerGenerateText() {
  onMessage('generateText', async (message) => {
    logger.debug('generateText', { message });
    try {
      return await runGenerateText(message.data);
    } catch (error) {
      logger.error('generateText failed', { error });
      throw error;
    }
  });
}
