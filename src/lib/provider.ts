import type { JSONValue } from 'ai';
import { createOllama } from 'ollama-ai-provider-v2';
import { createMinimax } from 'vercel-minimax-ai-provider';
import { createAlibaba } from '@ai-sdk/alibaba';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createCerebras } from '@ai-sdk/cerebras';
import { createCohere } from '@ai-sdk/cohere';
import { createDeepInfra } from '@ai-sdk/deepinfra';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createFireworks } from '@ai-sdk/fireworks';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createHuggingFace } from '@ai-sdk/huggingface';
import { createMistral } from '@ai-sdk/mistral';
import { createMoonshotAI } from '@ai-sdk/moonshotai';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createPerplexity } from '@ai-sdk/perplexity';
import { createReplicate } from '@ai-sdk/replicate';
import { createTogetherAI } from '@ai-sdk/togetherai';
import { createVercel } from '@ai-sdk/vercel';
import { createXai } from '@ai-sdk/xai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

import configStore from '@/lib/config';
import { COMPATIBLE_PROVIDERS, MODEL_OPTIONS, OPENAI_COMPATIBLE_PROVIDER } from '@/preset/provider';
import { CustomProviderType, type CustomProvider } from '@/types/provider';

export interface RecommendedProviderOptions {
  matchIndex: number;
  options: Record<string, JSONValue>;
}

// Option key aliases for normalization
const OPENAI_COMPATIBLE_OPTION_ALIASES = {
  reasoning_effort: 'reasoningEffort',
  verbosity: 'textVerbosity'
} as const satisfies Record<string, string>;

const COMPATIBLE_AI_MAPPER = {
  siliconflow: createOpenAICompatible,
  // tensdaq: createOpenAICompatible,
  ai302: createOpenAICompatible,
  volcengine: createOpenAICompatible,
  openrouter: createOpenRouter,
  [OPENAI_COMPATIBLE_PROVIDER]: createOpenAICompatible
} as const;

const BUILTIN_AI_MAPPER = {
  openai: createOpenAI,
  deepseek: createDeepSeek,
  google: createGoogleGenerativeAI,
  anthropic: createAnthropic,
  xai: createXai,
  bedrock: createAmazonBedrock,
  groq: createGroq,
  deepinfra: createDeepInfra,
  mistral: createMistral,
  togetherai: createTogetherAI,
  cohere: createCohere,
  fireworks: createFireworks,
  cerebras: createCerebras,
  replicate: createReplicate,
  perplexity: createPerplexity,
  vercel: createVercel,
  ollama: createOllama,
  minimax: createMinimax,
  alibaba: createAlibaba,
  moonshotai: createMoonshotAI,
  huggingface: createHuggingFace
} as const;

const CREATE_AI_MAPPER = { ...COMPATIBLE_AI_MAPPER, ...BUILTIN_AI_MAPPER } as const;

const CUSTOM_HEADER_MAP: Partial<Record<keyof typeof CREATE_AI_MAPPER, Record<string, string>>> = {
  anthropic: { 'anthropic-dangerous-direct-browser-access': 'true' }
};

class ProviderManager {
  /**
   * Normalize user provider options by converting alias keys to canonical keys.
   */
  private normalizeOptions(
    provider: CustomProviderType,
    userOptions: Record<string, JSONValue>
  ): Record<string, JSONValue> {
    if (!COMPATIBLE_PROVIDERS.some((p) => p.provider === provider)) {
      return userOptions;
    }

    let changed = false;
    const normalizedOptions: Record<string, JSONValue> = { ...userOptions };

    for (const [rawKey, canonicalKey] of Object.entries(OPENAI_COMPATIBLE_OPTION_ALIASES)) {
      if (!(rawKey in normalizedOptions)) {
        continue;
      }

      if (!(canonicalKey in normalizedOptions)) {
        normalizedOptions[canonicalKey] = normalizedOptions[rawKey];
      }

      delete normalizedOptions[rawKey];
      changed = true;
    }

    return changed ? normalizedOptions : userOptions;
  }

  /**
   * Detect the recommended provider options for a given model.
   * First match wins - more specific patterns should be placed first in MODEL_OPTIONS.
   */
  matchRecommendedOptions(modelName: string): RecommendedProviderOptions | undefined {
    for (const [matchIndex, { pattern, options }] of MODEL_OPTIONS.entries()) {
      if (pattern.test(modelName)) {
        return { matchIndex, options };
      }
    }
  }

  matchRecommendedHeaders(provider: CustomProviderType): Record<string, string> | undefined {
    return CUSTOM_HEADER_MAP[provider as keyof typeof CUSTOM_HEADER_MAP];
  }

  /**
   * Wrap a recommendation for the AI SDK request shape.
   */
  getOptions(
    model: string,
    provider: CustomProviderType
  ): Record<CustomProviderType, Record<string, JSONValue>> {
    const options = this.matchRecommendedOptions(model)?.options;
    if (!options) {
      return {};
    }

    return { [provider]: options };
  }

  /**
   * Get provider options for AI SDK calls.
   * - If the user has saved provider options (including `{}`), use them as-is.
   * - Otherwise fall back to the recommended defaults for the current model.
   */
  overrideOptions(
    model: string,
    provider: CustomProviderType,
    userOptions?: Record<string, JSONValue>
  ): Record<CustomProviderType, Record<string, JSONValue>> | undefined {
    if (userOptions !== undefined) {
      return { [provider]: this.normalizeOptions(provider, userOptions) };
    }

    const recommendedOptions = this.matchRecommendedOptions(model)?.options;
    if (!recommendedOptions) {
      return undefined;
    }

    return { [provider]: recommendedOptions };
  }

  overrideHeaders(
    provider: CustomProviderType,
    userHeaders?: Record<string, string>
  ): Record<string, string> | undefined {
    const compactStringRecord = (
      record?: Readonly<Record<string, unknown>>
    ): Record<string, string> | undefined => {
      if (!record) {
        return undefined;
      }

      const compacted = Object.fromEntries(
        Object.entries(record).filter((entry): entry is [string, string] => {
          const [, value] = entry;
          return typeof value === 'string' && value !== '';
        })
      );

      return Object.keys(compacted).length > 0 ? compacted : undefined;
    };

    if (userHeaders !== undefined) {
      return compactStringRecord(userHeaders);
    }

    return compactStringRecord(this.matchRecommendedHeaders(provider));
  }

  /**
   * Check if provider is a compatible LLM provider (OpenAI-compatible)
   */
  private isCompatibleProvider(
    provider: keyof typeof CREATE_AI_MAPPER
  ): provider is keyof typeof COMPATIBLE_AI_MAPPER {
    return COMPATIBLE_PROVIDERS.some((p) => p.provider === provider);
  }

  /**
   * Remove entries with empty string, null, or undefined values from an object.
   */
  private compactObject<T extends Record<string, unknown>>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== '' && v != null)
    ) as Partial<T>;
  }

  private isValidProvider(provider: string): provider is keyof typeof CREATE_AI_MAPPER {
    return provider in CREATE_AI_MAPPER;
  }

  /**
   * Get language model instance by provider name.
   * Uses the config store to retrieve provider configuration.
   */
  async getLanguageModel(providerName: string) {
    const config = configStore.get();
    const providerConfig = config.providers.find(
      (p): p is CustomProvider => p.type === 'custom' && 'provider' in p && p.name === providerName
    );

    if (!providerConfig) {
      throw new Error(`Provider ${providerName} not found`);
    }

    const {
      model,
      provider,
      baseURL,
      apiKey,
      connectionOptions: connectionConfig,
      headers: userHeaders
    } = providerConfig;

    if (!model.name) {
      throw new Error(`Model in ${providerName} is undefined`);
    }

    if (!this.isValidProvider(provider)) {
      throw new Error(`Invalid provider ${provider}`);
    }

    const headers = this.overrideHeaders(provider, userHeaders);
    const connectionOptions = this.compactObject(connectionConfig ?? {});

    const sharedOptions = {
      ...connectionOptions,
      ...(apiKey && { apiKey }),
      ...(headers && { headers })
    };

    const providerInstance = this.isCompatibleProvider(provider)
      ? CREATE_AI_MAPPER[provider]({
          ...sharedOptions,
          name: provider,
          baseURL: baseURL ?? '',
          supportsStructuredOutputs: true
        })
      : CREATE_AI_MAPPER[provider]({
          ...sharedOptions,
          ...(baseURL && { baseURL })
        });

    return providerInstance.languageModel(model.name);
  }
}

export default new ProviderManager();
