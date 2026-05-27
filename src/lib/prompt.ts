import configStore from '@/lib/config';
import lang from '@/lib/lang';
import { DICTIONARY_EXAMPLE_TAB_MAP } from '@/preset/instant-lookup';
import {
  DEFAULT_BATCH_TRANSLATE_PROMPT,
  DEFAULT_TRANSLATE_PROMPT,
  DEFAULT_TRANSLATE_SYSTEM_PROMPT,
  DICTIONARY_EXAMPLES_SYSTEM_PROMPT,
  DICTIONARY_EXAMPLES_USER_PROMPT,
  DICTIONARY_SYSTEM_PROMPT,
  DICTIONARY_USAGE_SYSTEM_PROMPT,
  DICTIONARY_USAGE_USER_PROMPT,
  DICTIONARY_USER_PROMPT,
  getTokenCellText
} from '@/preset/prompt';
import {
  AUTHENTIC_CASE,
  AUTHORITATIVE_CASE,
  BILINGUAL_CASE,
  INPUT,
  SOURCE_LANGUAGE,
  TARGET_LANGUAGE,
  WEB_CONTENT,
  WEB_SUMMARY,
  WEB_TITLE,
  WORD
} from '@/preset/token';
import type {
  AdaptiveTranslateContext,
  InstantLookupContext,
  PromptResolver,
  PromptResolverConfig
} from '@/types/prompt';

function resolvePromptReplacementValue(value: string | null | undefined, fallback: string): string {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

function replaceTokens(text: string, tokenValues: Record<string, string>): string {
  let result = text;
  for (const [token, value] of Object.entries(tokenValues)) {
    result = result.replaceAll(getTokenCellText(token), value);
  }
  return result;
}

function createPromptResolver<TContext>(
  config: PromptResolverConfig<TContext>
): PromptResolver<TContext> {
  return async (providerConfig, targetLangCode, input, options) => {
    let systemPrompt = config.defaultSystemPrompt;
    const userPrompt = config.defaultUserPrompt;

    if (config.supportsBatch && options?.isBatch) {
      systemPrompt = `${systemPrompt}\n${DEFAULT_BATCH_TRANSLATE_PROMPT}`;
    }

    const { uiLangCode } = configStore.get();
    const tokenValues = config.resolveTokenValues({
      input,
      targetLangCode,
      context: options?.context,
      uiLangCode
    });

    return {
      systemPrompt: replaceTokens(systemPrompt, tokenValues),
      prompt: replaceTokens(userPrompt, tokenValues)
    };
  };
}

export const getAdaptiveTranslatePrompt = createPromptResolver<AdaptiveTranslateContext>({
  defaultSystemPrompt: DEFAULT_TRANSLATE_SYSTEM_PROMPT,
  defaultUserPrompt: DEFAULT_TRANSLATE_PROMPT,
  supportsBatch: true,
  resolveTokenValues: ({ input, targetLangCode, context, uiLangCode }) => {
    const targetLang = lang.getLangName(targetLangCode, uiLangCode);
    if (!targetLang) {
      throw new Error(`Unexpected target language code:`, { cause: { targetLangCode } });
    }
    return {
      [TARGET_LANGUAGE]: targetLang,
      [INPUT]: input,
      [WEB_TITLE]: resolvePromptReplacementValue(context?.webTitle, 'No title available'),
      [WEB_CONTENT]: resolvePromptReplacementValue(context?.webContent, 'No content available'),
      [WEB_SUMMARY]: resolvePromptReplacementValue(context?.webSummary, 'No summary available')
    };
  }
});

export const getInstantLookupDictionaryPrompt = createPromptResolver<InstantLookupContext>({
  defaultSystemPrompt: DICTIONARY_SYSTEM_PROMPT,
  defaultUserPrompt: DICTIONARY_USER_PROMPT,
  resolveTokenValues: ({ input, targetLangCode, context, uiLangCode }) => {
    const detectedLangCode = context?.detectedLangCode;
    if (!detectedLangCode) {
      throw new Error('Detected language code must be provided');
    }
    const sourceLang = lang.getLangName(detectedLangCode, uiLangCode);
    const targetLang = lang.getLangName(targetLangCode, uiLangCode);
    if (!sourceLang || !targetLang) {
      throw new Error(`Unexpected language code:`, { cause: { detectedLangCode, targetLangCode } });
    }
    return {
      [SOURCE_LANGUAGE]: sourceLang,
      [TARGET_LANGUAGE]: targetLang,
      [WORD]: input,
      [WEB_TITLE]: resolvePromptReplacementValue(context?.webTitle, 'No title available'),
      [WEB_SUMMARY]: resolvePromptReplacementValue(context?.webSummary, 'No summary available')
    };
  }
});

export const getInstantLookupExamplesPrompt = createPromptResolver<InstantLookupContext>({
  defaultSystemPrompt: DICTIONARY_EXAMPLES_SYSTEM_PROMPT,
  defaultUserPrompt: DICTIONARY_EXAMPLES_USER_PROMPT,
  resolveTokenValues: ({ input, targetLangCode, context, uiLangCode }) => {
    const detectedLangCode = context?.detectedLangCode;
    if (!detectedLangCode) {
      throw new Error('Detected language code must be provided');
    }
    const sourceLang = lang.getLangName(detectedLangCode, uiLangCode);
    const targetLang = lang.getLangName(targetLangCode, uiLangCode);
    if (!sourceLang || !targetLang) {
      throw new Error(`Unexpected language code:`, { cause: { detectedLangCode, targetLangCode } });
    }
    return {
      [BILINGUAL_CASE]: DICTIONARY_EXAMPLE_TAB_MAP[BILINGUAL_CASE],
      [AUTHENTIC_CASE]: DICTIONARY_EXAMPLE_TAB_MAP[AUTHENTIC_CASE],
      [AUTHORITATIVE_CASE]: DICTIONARY_EXAMPLE_TAB_MAP[AUTHORITATIVE_CASE],
      [SOURCE_LANGUAGE]: sourceLang,
      [TARGET_LANGUAGE]: targetLang,
      [WORD]: input,
      [WEB_TITLE]: resolvePromptReplacementValue(context?.webTitle, 'No title available'),
      [WEB_SUMMARY]: resolvePromptReplacementValue(context?.webSummary, 'No summary available')
    };
  }
});

export const getInstantLookupUsagePrompt = createPromptResolver<InstantLookupContext>({
  defaultSystemPrompt: DICTIONARY_USAGE_SYSTEM_PROMPT,
  defaultUserPrompt: DICTIONARY_USAGE_USER_PROMPT,
  resolveTokenValues: ({ input, targetLangCode, context, uiLangCode }) => {
    const detectedLangCode = context?.detectedLangCode;
    if (!detectedLangCode) {
      throw new Error('Detected language code must be provided');
    }
    const sourceLang = lang.getLangName(detectedLangCode, uiLangCode);
    const targetLang = lang.getLangName(targetLangCode, uiLangCode);
    if (!sourceLang || !targetLang) {
      throw new Error(`Unexpected language code:`, { cause: { detectedLangCode, targetLangCode } });
    }
    return {
      [SOURCE_LANGUAGE]: sourceLang,
      [TARGET_LANGUAGE]: targetLang,
      [WORD]: input,
      [WEB_TITLE]: resolvePromptReplacementValue(context?.webTitle, 'No title available'),
      [WEB_SUMMARY]: resolvePromptReplacementValue(context?.webSummary, 'No summary available')
    };
  }
});
