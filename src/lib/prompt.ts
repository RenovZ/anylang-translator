import {
  DEFAULT_BATCH_TRANSLATE_PROMPT,
  DEFAULT_SUBTITLE_TRANSLATE_SYSTEM_PROMPT,
  DEFAULT_TRANSLATE_PROMPT,
  DEFAULT_TRANSLATE_SYSTEM_PROMPT,
  getTokenCellText,
  INPUT,
  TARGET_LANGUAGE,
  VIDEO_SUMMARY,
  VIDEO_TITLE,
  WEB_CONTENT,
  WEB_SUMMARY,
  WEB_TITLE
} from '@/preset/prompt';
import { WebPagePromptContext } from '@/types/content';
import { SubtitlePromptContext } from '@/types/prompt';
import { AIProvider } from '@/types/provider';

export interface TranslatePromptOptions<TContext = unknown> {
  isBatch?: boolean;
  context?: TContext;
}

export interface TranslatePromptResult {
  systemPrompt: string;
  prompt: string;
}

function resolvePromptReplacementValue(value: string | null | undefined, fallback: string): string {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

export function getTranslatePrompt(
  providerConfig: AIProvider,
  targetLang: string,
  input: string,
  options?: TranslatePromptOptions<WebPagePromptContext>
): TranslatePromptResult {
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

export function getSubtitlesTranslatePrompt(
  providerConfig: AIProvider,
  targetLang: string,
  input: string,
  options?: TranslatePromptOptions<SubtitlePromptContext>
): TranslatePromptResult {
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
