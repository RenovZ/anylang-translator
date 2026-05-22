import configStore from '@/lib/config';
import lang from '@/lib/lang';
import {
  DEFAULT_BATCH_TRANSLATE_PROMPT,
  DEFAULT_SUBTITLE_TRANSLATE_SYSTEM_PROMPT,
  DEFAULT_TRANSLATE_PROMPT,
  DEFAULT_TRANSLATE_SYSTEM_PROMPT,
  DICTIONARY_SYSTEM_PROMPT,
  DICTIONARY_USER_PROMPT,
  getTokenCellText,
  INPUT,
  SOURCE_LANGUAGE,
  TARGET_LANGUAGE,
  VIDEO_SUMMARY,
  VIDEO_TITLE,
  WEB_CONTENT,
  WEB_SUMMARY,
  WEB_TITLE,
  WORD
} from '@/preset/prompt';
import { LangCode } from '@/types/lang';
import type {
  AdaptiveTranslateContext,
  BilingualSubtitlesContext,
  InstantLookupContext,
  PromptOptions,
  PromptResult
} from '@/types/prompt';
import { AIProvider } from '@/types/provider';

function resolvePromptReplacementValue(value: string | null | undefined, fallback: string): string {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

export async function getTranslatePrompt(
  providerConfig: AIProvider,
  targetLangCode: LangCode,
  input: string,
  options?: PromptOptions<AdaptiveTranslateContext>
): Promise<PromptResult> {
  const promptConfig = providerConfig.prompt || {};
  let systemPrompt = promptConfig.system || DEFAULT_TRANSLATE_SYSTEM_PROMPT;
  const prompt = promptConfig.prompt || DEFAULT_TRANSLATE_PROMPT;

  // For batch mode, append batch rules to system prompt
  if (options?.isBatch) {
    systemPrompt = `${systemPrompt}
${DEFAULT_BATCH_TRANSLATE_PROMPT}`;
  }
  // Build title and summary replacement values
  const title = resolvePromptReplacementValue(options?.context?.webTitle, 'No title available');
  const contentText = resolvePromptReplacementValue(
    options?.context?.webContent,
    'No content available'
  );
  const summary = resolvePromptReplacementValue(
    options?.context?.webSummary,
    'No summary available'
  );

  const { uiLangCode } = configStore.get();
  const targetLang = lang.getLangName(targetLangCode, uiLangCode);
  if (!targetLang) {
    throw new Error(`Unexpected target language code: ${targetLangCode}`);
  }

  // Replace tokens in both prompts
  const replaceTokens = (text: string) =>
    text
      .replaceAll(getTokenCellText(TARGET_LANGUAGE), targetLang)
      .replaceAll(getTokenCellText(INPUT), input)
      .replaceAll(getTokenCellText(WEB_TITLE), title)
      .replaceAll(getTokenCellText(WEB_CONTENT), contentText)
      .replaceAll(getTokenCellText(WEB_SUMMARY), summary);
  return {
    systemPrompt: replaceTokens(systemPrompt),
    prompt: replaceTokens(prompt)
  };
}

export async function getDictionaryPrompt(
  providerConfig: AIProvider,
  targetLangCode: LangCode,
  word: string,
  options?: PromptOptions<InstantLookupContext>
): Promise<PromptResult> {
  const promptConfig = providerConfig.prompt || {};
  const systemPrompt = promptConfig.system || DICTIONARY_SYSTEM_PROMPT;
  const prompt = promptConfig.prompt || DICTIONARY_USER_PROMPT;
  const { uiLangCode } = configStore.get();

  const { detectedLangCode } = options?.context ?? {};
  if (!detectedLangCode) {
    throw new Error(`Detected language code must be provided`);
  }

  const sourceLang = lang.getLangName(detectedLangCode, uiLangCode);
  const targetLang = lang.getLangName(targetLangCode, uiLangCode);
  if (!sourceLang || !targetLang) {
    throw new Error(`Unexpected language code: ${detectedLangCode} or ${targetLangCode}`);
  }

  // Build title and summary replacement values
  const title = resolvePromptReplacementValue(options?.context?.webTitle, 'No title available');
  const summary = resolvePromptReplacementValue(
    options?.context?.webSummary,
    'No summary available'
  );

  // Replace tokens in both prompts
  const replaceTokens = (text: string) =>
    text
      .replaceAll(getTokenCellText(SOURCE_LANGUAGE), sourceLang)
      .replaceAll(getTokenCellText(TARGET_LANGUAGE), targetLang)
      .replaceAll(getTokenCellText(WORD), word)
      .replaceAll(getTokenCellText(WEB_TITLE), title)
      .replaceAll(getTokenCellText(WEB_SUMMARY), summary);
  return {
    systemPrompt: replaceTokens(systemPrompt),
    prompt: replaceTokens(prompt)
  };
}

export async function getSubtitlesTranslatePrompt(
  providerConfig: AIProvider,
  targetLangCode: LangCode,
  input: string,
  options?: PromptOptions<BilingualSubtitlesContext>
): Promise<PromptResult> {
  let { system: systemPrompt = DEFAULT_SUBTITLE_TRANSLATE_SYSTEM_PROMPT } = providerConfig.prompt;
  const { prompt = DEFAULT_TRANSLATE_PROMPT } = providerConfig.prompt;

  // For batch mode, append batch rules to system prompt
  if (options?.isBatch) {
    systemPrompt = `${systemPrompt}

  ${DEFAULT_BATCH_TRANSLATE_PROMPT}`;
  }

  // Build title and summary replacement values
  const title = resolvePromptReplacementValue(options?.context?.videoTitle, 'No title available');
  const summary = resolvePromptReplacementValue(
    options?.context?.videoSummary,
    'No summary available'
  );

  const { uiLangCode } = configStore.get();
  const targetLang = lang.getLangName(targetLangCode, uiLangCode);
  if (!targetLang) {
    throw new Error(`Unexpected target language code: ${targetLangCode}`);
  }

  // Replace tokens in both prompts
  const replaceTokens = (text: string) =>
    text
      .replaceAll(getTokenCellText(TARGET_LANGUAGE), targetLang)
      .replaceAll(getTokenCellText(INPUT), input)
      .replaceAll(getTokenCellText(VIDEO_TITLE), title)
      .replaceAll(getTokenCellText(VIDEO_SUMMARY), summary);

  return {
    systemPrompt: replaceTokens(systemPrompt),
    prompt: replaceTokens(prompt)
  };
}
