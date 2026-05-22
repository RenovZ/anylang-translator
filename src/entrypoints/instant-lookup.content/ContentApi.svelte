<script module lang="ts">
  import configStore from '@/lib/config';
  import logger from '@/lib/logger';
  import { translate } from '@/lib/translate/sw';
  import type { DetectedLangCode } from '@/types/lang';
  import type { InstantLookupContext, PromptResolver } from '@/types/prompt';

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
        selection: { targetLangCode: selectionTargetLangCode }
      }
    } = config;
    if (!selectionTargetLangCode) {
      config.instantLookup.selection.targetLangCode = targetLangCode;
      configStore.set(config);
      selectionTargetLangCode = targetLangCode;
    }

    if (!provider) return null;

    if (provider.type === 'free') {
      return null;
    }
    if (!detectedLangCode || detectedLangCode === 'und') {
      return null;
    }
    if (detectedLangCode === selectionTargetLangCode) {
      return null;
    }

    try {
      const result = await translate(
        word,
        sourceLangCode ?? 'auto',
        selectionTargetLangCode,
        provider,
        promptResolver,
        { context: { detectedLangCode } }
      );
      return JSON.parse(result);
    } catch (error) {
      logger.error({ error });
      return null;
    }
  }
</script>
