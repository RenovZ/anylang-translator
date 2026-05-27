<script module lang="ts">
  import configStore from '@/lib/config';
  import logger from '@/lib/logger';
  import { translate } from '@/lib/translate/sw';
  import { context as webPageContext, summary as webPageSummary } from '@/lib/translate/webpage';
  import type { DetectedLangCode } from '@/types/lang';
  import type { InstantLookupContext, PromptResolver } from '@/types/prompt';
  import { isLLMProvider } from '@/types/provider';

  export async function getData<V>(
    word: string,
    detectedLangCode: DetectedLangCode,
    promptResolver: PromptResolver<InstantLookupContext>
  ): Promise<V | null> {
    const config = configStore.get();
    let {
      sourceLangCode,
      targetLangCode,
      instantLookup: {
        provider,
        selection: { targetLangCode: selectionTargetLangCode, withContext }
      }
    } = config;
    if (!selectionTargetLangCode) {
      config.instantLookup.selection.targetLangCode = targetLangCode;
      configStore.set(config);
      selectionTargetLangCode = targetLangCode;
    }

    if (!provider) return null;
    if (!isLLMProvider(provider)) return null;
    if (!detectedLangCode || detectedLangCode === 'und') return null;
    if (detectedLangCode === selectionTargetLangCode) return null;

    let context: InstantLookupContext = { detectedLangCode };

    if (withContext && isLLMProvider(provider)) {
      try {
        const webCtx = await webPageContext.get('main');
        let webSummary: string | null | undefined;
        if (webCtx) {
          webSummary = await webPageSummary.get(webCtx, provider, true);
        }
        context = {
          detectedLangCode,
          webTitle: webCtx?.webTitle,
          webSummary: webSummary ?? undefined
        };
      } catch (error) {
        logger.warn('Failed to get web page context for instant lookup', { error });
      }
    }

    try {
      const result = await translate(
        word,
        sourceLangCode ?? 'auto',
        selectionTargetLangCode,
        provider,
        promptResolver,
        { context }
      );
      return JSON.parse(result);
    } catch (error) {
      logger.error({ error });
      return null;
    }
  }
</script>
