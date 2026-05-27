import type { DetectedLangCode, LangCode, UILangCode } from './lang';
import { AIProvider } from './provider';

export interface PromptOptions<TContext = unknown> {
  isBatch?: boolean;
  context?: TContext;
}

export interface PromptResult {
  systemPrompt: string;
  prompt: string;
}

export interface PromptResolverConfig<TContext = unknown> {
  defaultSystemPrompt: string;
  defaultUserPrompt: string;
  supportsBatch?: boolean;
  resolveTokenValues: (params: {
    input: string;
    targetLangCode: LangCode;
    context: TContext | undefined;
    uiLangCode: UILangCode | 'auto' | 'default';
  }) => Record<string, string>;
}

export type PromptResolver<TContext = unknown> = (
  providerConfig: AIProvider,
  targetLangCode: LangCode,
  input: string,
  options?: PromptOptions<TContext>
) => Promise<PromptResult>;

export interface AdaptiveTranslateContext {
  webTitle?: string | null;
  webContent?: string | null;
  webSummary?: string | null;
}

export interface InstantLookupContext {
  webTitle?: string | null;
  webSummary?: string | null;
  detectedLangCode?: DetectedLangCode;
}
