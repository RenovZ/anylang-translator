import logger from '@/lib/logger';
import type { LangCode } from '@/types/lang';
import type { Provider } from '@/types/provider';

import textPreparation from './text-preparation';

class ExecuteTranslate {
  /**
   * Execute a translation request using the given provider config.
   *
   * The actual per-provider API calls (Google, Microsoft, DeepL, OpenAI, etc.)
   * live in `translate/api/*` and are handled by the background service worker
   * via `sendMessage('enqueueTranslateRequest', ...)`.
   *
   * This function is the thin dispatch layer that validates input and routes
   * to the appropriate backend — it is intentionally kept provider-agnostic
   * so that the content script never embeds API keys or network logic.
   *
   * TODO: Wire up per-provider dispatch once translate/api/* is implemented.
   */
  async executeTranslate(
    text: string,
    sourceLangCode: LangCode | 'auto',
    targetLangCode: LangCode,
    providerConfig: Provider
  ): Promise<string> {
    const preparedText = textPreparation.prepareTranslationText(text);
    if (preparedText === '') {
      return '';
    }

    // Free providers (go/zen) are handled by the background service
    if (
      providerConfig.type === 'free' ||
      providerConfig.type === 'go' ||
      providerConfig.type === 'zen'
    ) {
      // TODO: route to appropriate free/go/zen provider call
      logger.warn('executeTranslate: free/go/zen provider not yet implemented', {
        provider: providerConfig.type
      });
      return '';
    }

    // Custom (LLM / API) providers
    // TODO: route to translate/api/* once implemented
    logger.warn('executeTranslate: custom provider routing not yet implemented', {
      provider: providerConfig.type,
      sourceLangCode,
      targetLangCode
    });
    return '';
  }
}

export default new ExecuteTranslate();
