import type { JSONValue } from 'ai';
import type { AlibabaProviderOptions } from '@ai-sdk/alibaba';
import type { AnthropicProviderOptions } from '@ai-sdk/anthropic';
import type { CohereLanguageModelOptions } from '@ai-sdk/cohere';
import type { DeepSeekLanguageModelOptions } from '@ai-sdk/deepseek';
import type { FireworksProviderOptions } from '@ai-sdk/fireworks';
import type { GoogleGenerativeAIProviderOptions } from '@ai-sdk/google';
import type { GroqProviderOptions } from '@ai-sdk/groq';
import type { MoonshotAIProviderOptions } from '@ai-sdk/moonshotai';
import type { OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import type { XaiProviderOptions } from '@ai-sdk/xai';

import i18n from '@/lib/i18n';
import type { FeatureKey } from '@/preset/constants';
import type { FeatureItem, FeatureValue } from '@/types/feature';
import type { FreeProvider, GoProvider, ZenProvider } from '@/types/provider';

// Ordered feature definitions for consistent UI rendering (array order = display order)
export const featureItems: FeatureItem[] = [
  {
    key: 'adaptiveTranslate',
    label: i18n('feature_adaptive_translate', { defaultValue: 'Adaptive Translate' })
  },
  {
    key: 'instantLookup',
    label: i18n('feature_instant_lookup', { defaultValue: 'Instant Lookup' })
  },
  {
    key: 'intelligentInput',
    label: i18n('feature_intelligent_input', { defaultValue: 'Intelligent Input' })
  },
  {
    key: 'bilingualSubtitles',
    label: i18n('feature_bilingual_subtitles', { defaultValue: 'Bilingual Subtitles' })
  },
  {
    key: 'panoramaReading',
    label: i18n('feature_panorama_reading', { defaultValue: 'Panorama Reading' })
  },
  {
    key: 'writingCopilot',
    label: i18n('feature_writing_copilot', { defaultValue: 'Writing Copilot' })
  }
];

// Feature keys in display order (derived from featureItems array)
export const featureKeys: FeatureKey[] = featureItems.map((f) => f.key);

export const defaultAIFeatures: Partial<Record<FeatureKey, FeatureValue>> = {
  adaptiveTranslate: { state: false },
  bilingualSubtitles: { state: false },
  instantLookup: { state: false },
  intelligentInput: { state: false },
  writingCopilot: { state: false },
  panoramaReading: { state: false }
};

export const defaultOpenedFeatures: Partial<Record<FeatureKey, FeatureValue>> = {
  adaptiveTranslate: { disabled: true, state: true },
  bilingualSubtitles: { disabled: true, state: true },
  instantLookup: { disabled: true, state: true },
  intelligentInput: { disabled: true, state: true },
  writingCopilot: { disabled: true, state: true },
  panoramaReading: { disabled: true, state: true }
} as const;

export const FREE_PROVIDERS = [
  {
    provider: 'bing-translate',
    name: 'Bing Translator',
    icon: 'bing'
  },
  {
    provider: 'google-translate',
    name: 'Google Translator',
    icon: 'google'
  }
] as const;
export const freeProviders = FREE_PROVIDERS.map(
  (p) =>
    ({
      type: 'free',
      provider: p.provider,
      name: p.name,
      enabled: true,
      features: {
        adaptiveTranslate: { state: true }
      }
    }) satisfies FreeProvider
);

export const GO_PROVIDERS = [
  {
    provider: 'deepseek',
    name: 'DeepSeek',
    model: 'DeepSeek-V4-Pro',
    icon: 'deepseek'
  },
  {
    provider: 'zai',
    name: 'Z.ai',
    model: 'GLM-5.1',
    icon: 'zai'
  },
  {
    provider: 'kimi',
    name: 'Kimi',
    company: 'Moonshot',
    model: 'Kimi K2.6',
    icon: 'kimi'
  },
  {
    provider: 'mimo',
    name: 'MiMo',
    company: 'Xiaomi',
    model: 'MiMo-V2-Pro',
    icon: 'xiaomimimo'
  },
  {
    provider: 'minimax',
    name: 'MiniMax',
    model: 'MiniMax M2.7',
    icon: 'minimax'
  },
  {
    provider: 'qwen',
    name: 'Qwen',
    company: 'Alibaba',
    model: 'Qwen3.6 Plus',
    icon: 'qwen'
  }
].toSorted((a, b) => a.name.localeCompare(b.name));
export const goProviders = GO_PROVIDERS.map(
  (p) =>
    ({
      type: 'go' as const,
      provider: p.provider,
      model: p.model,
      prompt: {},
      name: p.name,
      enabled: true,
      features: { ...defaultOpenedFeatures } as const
    }) satisfies GoProvider
);

export const ZEN_PROVIDERS = [
  {
    provider: 'anthropic',
    name: 'Anthropic',
    model: 'Claude Opus 4.7',
    icon: 'anthropic'
  },
  {
    provider: 'openai',
    name: 'OpenAI',
    model: 'GPT 5.4 Pro',
    icon: 'openai'
  },
  {
    provider: 'gemini',
    name: 'Gemini',
    company: 'Google',
    model: 'Gemini 3.1 Pro',
    icon: 'gemini'
  }
].toSorted((a, b) => a.name.localeCompare(b.name));
export const zenProviders = ZEN_PROVIDERS.map(
  (p) =>
    ({
      type: 'zen' as const,
      provider: p.provider,
      model: p.model,
      prompt: {},
      name: p.name,
      enabled: true,
      features: { ...defaultOpenedFeatures } as const
    }) satisfies ZenProvider
);

type OpenAIReasoningEffort = Exclude<OpenAIResponsesProviderOptions['reasoningEffort'], undefined>;

interface OpenAIGPT5ReasoningEffortPolicy {
  pattern: RegExp;
  supportedValues: readonly OpenAIReasoningEffort[];
  recommendedValue?: OpenAIReasoningEffort;
}

export const BUILTIN_PROVIDERS = (
  [
    {
      provider: 'openai',
      models: [
        'gpt-5.4-pro',
        'gpt-5.4',
        'gpt-5.4-mini',
        'gpt-5.4-nano',
        'gpt-5.3-chat-latest',
        'gpt-5.2-pro',
        'gpt-5.2',
        'gpt-5.2-chat-latest',
        'gpt-5.1-codex-mini',
        'gpt-5.1-codex',
        'gpt-5.1',
        'gpt-5.1-chat-latest',
        'gpt-5-pro',
        'gpt-5-codex',
        'gpt-5',
        'gpt-5-mini',
        'gpt-5-nano',
        'gpt-5-chat-latest',
        'gpt-4.1-nano',
        'gpt-4.1-mini',
        'gpt-4.1',
        'gpt-4o-mini',
        'gpt-4o'
      ],
      name: 'OpenAI',
      icon: 'openai'
    },
    {
      provider: 'deepseek',
      models: ['deepseek-chat', 'deepseek-reasoner'],
      name: 'DeepSeek',
      icon: 'deepseek'
    },
    {
      provider: 'google',
      models: [
        'gemini-3.1-pro-preview',
        'gemini-3-flash-preview',
        'gemini-3-pro-preview',
        'gemini-2.5-flash-lite',
        'gemini-2.5-flash-lite-preview-06-17',
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-2.0-flash',
        'gemini-1.5-flash-8b',
        'gemini-1.5-flash-8b-latest',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro',
        'gemini-1.5-pro-latest'
      ],
      name: 'Gemini',
      icon: 'gemini',
      company: 'Google'
    },
    {
      provider: 'anthropic',
      models: [
        'claude-opus-4-6',
        'claude-sonnet-4-6',
        'claude-haiku-4-5',
        'claude-sonnet-4-5',
        'claude-opus-4-5',
        'claude-opus-4-1',
        'claude-sonnet-4-0',
        'claude-opus-4-0',
        'claude-3-7-sonnet-latest',
        'claude-3-5-haiku-latest'
      ],
      name: 'Anthropic',
      icon: 'anthropic'
    },
    {
      provider: 'xai',
      models: [
        'grok-4-1',
        'grok-4-1-fast-reasoning',
        'grok-4-1-fast-non-reasoning',
        'grok-4-0709',
        'grok-4-latest',
        'grok-4-fast-non-reasoning',
        'grok-4-fast-reasoning',
        'grok-4',
        'grok-code-fast-1',
        'grok-3-mini-fast',
        'grok-3-mini-fast-latest',
        'grok-3-mini',
        'grok-3-mini-latest',
        'grok-3-fast',
        'grok-3-fast-latest',
        'grok-3',
        'grok-3-latest',
        'grok-2',
        'grok-2-latest',
        'grok-2-1212',
        'grok-2-vision',
        'grok-2-vision-latest',
        'grok-2-vision-1212',
        'grok-beta',
        'grok-vision-beta'
      ],
      name: 'Grok',
      icon: 'grok'
    },
    {
      provider: 'bedrock',
      models: [
        'us.anthropic.claude-opus-4-6-v1',
        'us.anthropic.claude-opus-4-5-20251101-v1:0',
        'us.anthropic.claude-haiku-4-5-20251001-v1:0',
        'openai.gpt-oss-120b-1:0',
        'openai.gpt-oss-20b-1:0',
        'meta.llama3-2-11b-instruct-v1:0',
        'meta.llama3-2-90b-instruct-v1:0',
        'us.meta.llama3-2-11b-instruct-v1:0',
        'us.meta.llama3-2-90b-instruct-v1:0',
        'us.meta.llama4-scout-17b-instruct-v1:0',
        'us.meta.llama4-maverick-17b-instruct-v1:0',
        'us.deepseek.r1-v1:0',
        'anthropic.claude-haiku-4-5-20251001-v1:0',
        'anthropic.claude-sonnet-4-5-20250929-v1:0',
        'us.anthropic.claude-sonnet-4-5-20250929-v1:0',
        'anthropic.claude-sonnet-4-20250514-v1:0',
        'us.anthropic.claude-sonnet-4-20250514-v1:0',
        'anthropic.claude-opus-4-1-20250805-v1:0',
        'us.anthropic.claude-opus-4-1-20250805-v1:0',
        'anthropic.claude-opus-4-20250514-v1:0',
        'us.anthropic.claude-opus-4-20250514-v1:0',
        'anthropic.claude-3-7-sonnet-20250219-v1:0',
        'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
        'us.amazon.nova-micro-v1:0',
        'us.amazon.nova-lite-v1:0',
        'us.amazon.nova-pro-v1:0',
        'us.amazon.nova-premier-v1:0',
        'anthropic.claude-3-5-haiku-20241022-v1:0',
        'us.anthropic.claude-3-5-haiku-20241022-v1:0',
        'anthropic.claude-3-5-sonnet-20241022-v2:0',
        'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
        'us.meta.llama3-3-70b-instruct-v1:0',
        'us.mistral.pixtral-large-2502-v1:0',
        'meta.llama3-2-1b-instruct-v1:0',
        'meta.llama3-2-3b-instruct-v1:0',
        'us.meta.llama3-2-1b-instruct-v1:0',
        'us.meta.llama3-2-3b-instruct-v1:0',
        'meta.llama3-1-8b-instruct-v1:0',
        'us.meta.llama3-1-8b-instruct-v1:0',
        'meta.llama3-1-70b-instruct-v1:0',
        'us.meta.llama3-1-70b-instruct-v1:0',
        'meta.llama3-1-405b-instruct-v1:0'
      ],
      name: 'Bedrock',
      icon: 'bedrock',
      company: 'Amazon'
    },
    {
      provider: 'groq',
      models: [
        'meta-llama/llama-4-scout-17b-16e-instruct',
        'meta-llama/llama-4-maverick-17b-128e-instruct',
        'moonshotai/kimi-k2-instruct-0905',
        'llama-3.3-70b-versatile',
        'qwen/qwen3-32b',
        'qwen-2.5-32b',
        'qwen-qwq-32b',
        'deepseek-r1-distill-qwen-32b',
        'deepseek-r1-distill-llama-70b',
        'openai/gpt-oss-20b',
        'openai/gpt-oss-120b',
        'llama-3.1-8b-instant',
        'llama3-8b-8192',
        'llama3-70b-8192',
        'mixtral-8x7b-32768',
        'gemma2-9b-it',
        'meta-llama/llama-guard-4-12b',
        'llama-guard-3-8b',
        'meta-llama/llama-prompt-guard-2-22m',
        'meta-llama/llama-prompt-guard-2-86m'
      ],
      name: 'Groq',
      icon: 'groq'
    },
    {
      provider: 'deepinfra',
      models: [
        'meta-llama/Llama-4-Scout-17B-16E-Instruct',
        'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
        'deepseek-ai/DeepSeek-R1',
        'deepseek-ai/DeepSeek-R1-Turbo',
        'deepseek-ai/DeepSeek-V3',
        'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
        'meta-llama/Llama-3.3-70B-Instruct',
        'meta-llama/Llama-3.3-70B-Instruct-Turbo',
        'meta-llama/Llama-3.2-11B-Vision-Instruct',
        'meta-llama/Llama-3.2-90B-Vision-Instruct',
        'Qwen/Qwen2.5-72B-Instruct',
        'Qwen/Qwen2.5-Coder-32B-Instruct',
        'Qwen/QwQ-32B-Preview',
        'meta-llama/Meta-Llama-3.1-8B-Instruct',
        'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        'meta-llama/Meta-Llama-3.1-70B-Instruct',
        'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        'meta-llama/Meta-Llama-3.1-405B-Instruct',
        'nvidia/Llama-3.1-Nemotron-70B-Instruct',
        'microsoft/WizardLM-2-8x22B',
        'Qwen/Qwen2-7B-Instruct',
        'google/gemma-2-9b-it',
        'google/codegemma-7b-it',
        'mistralai/Mixtral-8x7B-Instruct-v0.1'
      ],
      name: 'DeepInfra',
      icon: 'deepinfra'
    },
    {
      provider: 'mistral',
      models: [
        'magistral-small-2507',
        'magistral-medium-2507',
        'mistral-medium-2508',
        'magistral-small-2506',
        'magistral-medium-2506',
        'ministral-3b-latest',
        'ministral-8b-latest',
        'mistral-small-latest',
        'mistral-medium-latest',
        'mistral-medium-2505',
        'mistral-large-latest',
        'pixtral-12b-2409',
        'pixtral-large-latest',
        'open-mistral-7b',
        'open-mixtral-8x7b',
        'open-mixtral-8x22b'
      ],
      name: 'Mistral AI',
      icon: 'mistral'
    },
    {
      provider: 'togetherai',
      models: [
        'meta-llama/Llama-3.3-70B-Instruct-Turbo',
        'deepseek-ai/DeepSeek-V3',
        'meta-llama/Meta-Llama-3.3-70B-Instruct-Turbo',
        'Qwen/Qwen2.5-72B-Instruct-Turbo',
        'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        'mistralai/Mixtral-8x22B-Instruct-v0.1',
        'mistralai/Mistral-7B-Instruct-v0.3',
        'databricks/dbrx-instruct',
        'google/gemma-2b-it'
      ],
      name: 'Together.ai',
      icon: 'together'
    },
    {
      provider: 'cohere',
      models: [
        'command-a-reasoning-08-2025',
        'command-a-03-2025',
        'command-r7b-12-2024',
        'command-r-08-2024',
        'command-r-plus-04-2024',
        'command-r-03-2024',
        'command-light',
        'command-light-nightly',
        'command',
        'command-nightly',
        'command-r',
        'command-r-plus'
      ],
      name: 'Cohere',
      icon: 'cohere'
    },
    {
      provider: 'fireworks',
      models: [
        'accounts/fireworks/models/kimi-k2-thinking',
        'accounts/fireworks/models/kimi-k2p5',
        'accounts/fireworks/models/minimax-m2',
        'accounts/fireworks/models/kimi-k2-instruct',
        'accounts/fireworks/models/deepseek-r1',
        'accounts/fireworks/models/deepseek-v3',
        'accounts/fireworks/models/llama-v3p3-70b-instruct',
        'accounts/fireworks/models/llama-v3p2-3b-instruct',
        'accounts/fireworks/models/llama-v3p2-11b-vision-instruct',
        'accounts/fireworks/models/qwq-32b',
        'accounts/fireworks/models/qwen-qwq-32b-preview',
        'accounts/fireworks/models/qwen2p5-coder-32b-instruct',
        'accounts/fireworks/models/qwen2p5-72b-instruct',
        'accounts/fireworks/models/qwen2-vl-72b-instruct',
        'accounts/fireworks/models/llama-v3p1-8b-instruct',
        'accounts/fireworks/models/llama-v3p1-405b-instruct',
        'accounts/fireworks/models/mixtral-8x22b-instruct',
        'accounts/fireworks/models/mixtral-8x7b-instruct',
        'accounts/fireworks/models/mixtral-8x7b-instruct-hf',
        'accounts/fireworks/models/yi-large',
        'accounts/fireworks/models/firefunction-v1'
      ],
      name: 'Fireworks AI',
      icon: 'fireworks'
    },
    {
      provider: 'cerebras',
      models: [
        'zai-glm-4.7',
        'qwen-3-235b-a22b-instruct-2507',
        'qwen-3-235b-a22b-thinking-2507',
        'zai-glm-4.6',
        'qwen-3-32b',
        'llama-3.3-70b',
        'gpt-oss-120b',
        'llama3.1-8b'
      ],
      name: 'Cerebras',
      icon: 'cerebras'
    },
    {
      provider: 'replicate',
      models: ['meta/meta-llama-3.1-70b-instruct', 'meta/meta-llama-3.1-8b-instruct'],
      name: 'Replicate',
      icon: 'replicate'
    },
    {
      provider: 'perplexity',
      models: [
        'sonar',
        'sonar-pro',
        'sonar-reasoning',
        'sonar-reasoning-pro',
        'sonar-deep-research'
      ],
      name: 'Perplexity',
      icon: 'perplexity'
    },
    {
      provider: 'vercel',
      models: ['v0-1.5-md', 'v0-1.5-lg', 'v0-1.0-md'],
      name: 'Vercel',
      icon: 'vercel'
    },
    {
      provider: 'openrouter',
      models: ['x-ai/grok-4-fast:free', 'openai/gpt-4.1-mini'],
      name: 'OpenRouter',
      icon: 'openrouter'
    },
    {
      provider: 'ollama',
      models: ['gemma3:4b', 'llama3.2:3b'],
      name: 'Ollama',
      icon: 'ollama'
    },
    {
      provider: 'minimax',
      models: [
        'MiniMax-M2.7',
        'MiniMax-M2.7-highspeed',
        'MiniMax-M2.5',
        'MiniMax-M2.5-highspeed',
        'MiniMax-M2.1',
        'MiniMax-M2.1-highspeed',
        'MiniMax-M2',
        'MiniMax-M2-Stable'
      ],
      name: 'MiniMax',
      icon: 'minimax'
    },
    {
      provider: 'alibaba',
      models: [
        'qwen3-max',
        'qwen3.5-plus',
        'qwen3.5-flash',
        'qwen-plus',
        'qwen-flash',
        'qwen-turbo',
        'qwq-plus',
        'qwen3-coder-plus',
        'deepseek-v3.2',
        'deepseek-v3.1',
        'deepseek-r1',
        'deepseek-v3',
        'kimi-k2.5',
        'MiniMax-M2.5',
        'glm-5'
      ],
      name: 'Qwen',
      icon: 'qwen',
      company: 'Alibaba'
    },
    {
      provider: 'moonshotai',
      models: [
        'moonshot-v1-8k',
        'moonshot-v1-32k',
        'moonshot-v1-128k',
        'kimi-k2',
        'kimi-k2.5',
        'kimi-k2-thinking',
        'kimi-k2-thinking-turbo',
        'kimi-k2-turbo'
      ],
      name: 'Kimi',
      icon: 'kimi',
      company: 'Moonshot AI'
    },
    {
      provider: 'huggingface',
      models: [
        'meta-llama/Llama-3.1-8B-Instruct',
        'meta-llama/Llama-3.1-70B-Instruct',
        'meta-llama/Llama-3.3-70B-Instruct',
        'meta-llama/Llama-4-Maverick-17B-128E-Instruct',
        'deepseek-ai/DeepSeek-V3.1',
        'deepseek-ai/DeepSeek-V3-0324',
        'deepseek-ai/DeepSeek-R1',
        'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
        'Qwen/Qwen3-32B',
        'Qwen/Qwen3-Coder-480B-A35B-Instruct',
        'Qwen/Qwen2.5-VL-7B-Instruct',
        'google/gemma-3-27b-it',
        'moonshotai/Kimi-K2-Instruct'
      ],
      name: 'Hugging Face',
      icon: 'huggingface'
    }
  ] as const
).toSorted((a, b) => a.name.localeCompare(b.name));

export const OPENAI_COMPATIBLE_PROVIDER = 'openai-compatible' as const;
export const COMPATIBLE_PROVIDERS = [
  {
    provider: 'siliconflow',
    models: ['Qwen/Qwen3-Next-80B-A3B-Instruct'],
    name: 'SiliconCloud',
    icon: 'siliconcloud'
  },
  // {
  //   provider: 'tensdaq',
  //   models: ['Qwen3-30B-A3B-Instruct-2507', 'deepseek-v3.1'],
  //   name: 'Tensdaq',
  //   icon: 'tensdaq'
  // },
  {
    provider: 'ai302',
    models: ['gpt-4.1-mini', 'qwen3-235b-a22b'],
    name: '302.AI',
    icon: 'ai302'
  },
  {
    provider: 'volcengine',
    models: [
      'doubao-seed-1-6-flash-250828',
      'doubao-seed-1-6-lite-251015',
      'doubao-seed-1-6-251015'
    ],
    name: 'Volcengine',
    icon: 'volcengine',
    company: 'ByteDance'
  }
]
  .toSorted((a, b) => a.name.localeCompare(b.name))
  .concat([
    {
      provider: OPENAI_COMPATIBLE_PROVIDER,
      models: [],
      name: 'Custom Provider',
      icon: 'custom'
    }
  ]);

const OPENAI_GPT5_REASONING_EFFORT_POLICIES: OpenAIGPT5ReasoningEffortPolicy[] = [
  {
    pattern: /^gpt-5\.4-pro$/,
    supportedValues: ['medium', 'high', 'xhigh'],
    recommendedValue: 'medium'
  },
  {
    pattern: /^gpt-5\.2-pro$/,
    supportedValues: ['medium', 'high', 'xhigh'],
    recommendedValue: 'medium'
  },
  {
    pattern: /^gpt-5-pro$/,
    supportedValues: ['high'],
    recommendedValue: 'high'
  },
  {
    pattern: /^(?:gpt-5\.4|gpt-5\.4-mini|gpt-5\.4-nano)$/,
    supportedValues: ['none', 'low', 'medium', 'high', 'xhigh'],
    recommendedValue: 'none'
  },
  {
    pattern: /^gpt-5\.2$/,
    supportedValues: ['none', 'low', 'medium', 'high', 'xhigh'],
    recommendedValue: 'none'
  },
  {
    pattern: /^(?:gpt-5\.1|gpt-5\.1-codex|gpt-5\.1-codex-mini)$/,
    supportedValues: ['none', 'low', 'medium', 'high'],
    recommendedValue: 'none'
  },
  {
    pattern: /^(?:gpt-5|gpt-5-mini|gpt-5-nano|gpt-5-codex)$/,
    supportedValues: ['minimal', 'low', 'medium', 'high'],
    recommendedValue: 'minimal'
  },
  {
    pattern:
      /^(?:gpt-5-chat-latest|gpt-5\.1-chat-latest|gpt-5\.2-chat-latest|gpt-5\.3-chat-latest)$/,
    supportedValues: []
  }
];

const OPENAI_GPT5_RECOMMENDED_MODEL_OPTIONS: Array<{
  pattern: RegExp;
  options: Record<string, JSONValue>;
}> = OPENAI_GPT5_REASONING_EFFORT_POLICIES.flatMap(({ pattern, recommendedValue }) => {
  if (recommendedValue === undefined) {
    return [];
  }

  return [
    {
      pattern,
      options: {
        reasoningEffort: recommendedValue
      } satisfies OpenAIResponsesProviderOptions as Record<string, JSONValue>
    }
  ];
});

// export function getOpenAIGPT5ReasoningEffortPolicy(
//   model: string
// ): OpenAIGPT5ReasoningEffortPolicy | undefined {
//   return OPENAI_GPT5_REASONING_EFFORT_POLICIES.find(({ pattern }) => pattern.test(model));
// }

/**
 * Model options configuration.
 * Flat list design: first match wins, more specific patterns should be placed first.
 * Options are matched by model name, not by provider.
 */
export const MODEL_OPTIONS: Array<{
  pattern: RegExp;
  options: Record<string, JSONValue>;
}> = [
  // Gemini - specific patterns first
  {
    pattern: /^gemini-3(?:\.1)?-.*-preview(?:-customtools)?$/,
    options: {
      thinkingConfig: { thinkingLevel: 'minimal', includeThoughts: false }
    } satisfies GoogleGenerativeAIProviderOptions as Record<string, JSONValue>
  },
  {
    pattern: /^gemini-2\.5-/,
    options: {
      thinkingConfig: { thinkingBudget: 0, includeThoughts: false }
    } satisfies GoogleGenerativeAIProviderOptions as Record<string, JSONValue>
  },
  {
    // Default for all other Gemini models
    pattern: /^gemini-/,
    options: {
      thinkingConfig: { thinkingBudget: 0, includeThoughts: false }
    } satisfies GoogleGenerativeAIProviderOptions as Record<string, JSONValue>
  },

  // Claude - disable thinking
  {
    pattern: /^claude-/,
    options: { thinking: { type: 'disabled' } } satisfies AnthropicProviderOptions as Record<
      string,
      JSONValue
    >
  },

  // OpenAI reasoning models - use the lowest supported reasoning effort
  {
    pattern: /^(?:o1|o3|o4-mini)(?:-|$)/,
    options: { reasoningEffort: 'minimal' } satisfies OpenAIResponsesProviderOptions as Record<
      string,
      JSONValue
    >
  },

  // OpenAI GPT-5 defaults use the lowest supported reasoning effort per model.
  // GPT-5 chat-latest variants are intentionally omitted because their docs do not advertise reasoning.effort.
  ...OPENAI_GPT5_RECOMMENDED_MODEL_OPTIONS,

  // xAI Grok reasoning-capable text models - keep effort at the lowest supported level
  {
    pattern: /^grok-(?:4(?:-1)?(?:-fast-reasoning)?|4(?:-latest|-0709)?|3(?:-mini)?(?:-latest)?)$/,
    options: { reasoningEffort: 'low' } satisfies XaiProviderOptions as Record<string, JSONValue>
  },

  // OpenAI-compatible reasoning models exposed by Groq/Cerebras and similar providers
  {
    pattern: /^(?:openai\/)?gpt-oss-(?:20|120)b$/i,
    options: { reasoningEffort: 'none' } satisfies GroqProviderOptions as Record<string, JSONValue>
  },

  // DeepSeek reasoning model - disable thinking by default
  {
    pattern: /^deepseek-reasoner$/,
    options: { thinking: { type: 'disabled' } } satisfies DeepSeekLanguageModelOptions as Record<
      string,
      JSONValue
    >
  },

  // Cohere reasoning models - disable thinking by default
  {
    pattern: /^command-a-reasoning(?:-.+)?$/,
    options: { thinking: { type: 'disabled' } } satisfies CohereLanguageModelOptions as Record<
      string,
      JSONValue
    >
  },

  // Fireworks reasoning-focused models - disable thinking/history by default
  {
    pattern: /^accounts\/fireworks\/models\/(?:kimi-k2(?:[a-z0-9.-].*)?|minimax-m2(?:[.-].*)?)$/i,
    options: {
      thinking: { type: 'disabled' },
      reasoningHistory: 'disabled'
    } satisfies FireworksProviderOptions as Record<string, JSONValue>
  },

  // Kimi K2 models - disable thinking/history by default.
  // Keep instruct variants untouched; they should not receive Moonshot's `thinking` options.
  // Keep this broad because recommendation matching is model-name based rather than provider-scoped.
  {
    pattern: /(?:^|\/)kimi-k2(?!-instruct(?:[a-z0-9.-].*)?$)(?:[a-z0-9.-].*)?$/i,
    options: {
      thinking: { type: 'disabled' },
      reasoningHistory: 'disabled'
    } satisfies MoonshotAIProviderOptions as Record<string, JSONValue>
  },

  // Qwen models - disable thinking by default.
  // Keep this broad because recommendation matching is model-name based rather than provider-scoped.
  // Exclude Cerebras-style `qwen-3-*` ids; they do not support Alibaba's `enableThinking`.
  // Keep explicit thinking-only variants (for example `qwq-*` and `*-thinking`) untouched.
  {
    pattern: /(?:^|\/)qwen(?!-3-)(?!.*[/.-](?:thinking|qwq)(?:[/.-]|$)).*$/i,
    options: { enableThinking: false } satisfies AlibabaProviderOptions as Record<string, JSONValue>
  },

  // GLM models - disable thinking (compatibility issues)
  {
    pattern: /^GLM-/i,
    options: { thinking: { type: 'disabled' } }
  }
];

// ── Provider icon lookup ──────────────────────────────────────────────────────

/**
 * Icon lookup keyed by display name (covers Free, Go, and Zen preset providers).
 */
export const ICON_BY_NAME: Readonly<Record<string, string | undefined>> = Object.fromEntries([
  ...FREE_PROVIDERS.map((p) => [p.name, p.icon] as const),
  ...GO_PROVIDERS.map((p) => [p.name, p.icon] as const),
  ...ZEN_PROVIDERS.map((p) => [p.name, p.icon] as const)
]);

/**
 * Icon lookup keyed by provider id (covers Builtin and Compatible preset providers).
 */
export const ICON_BY_PROVIDER_ID: Readonly<Record<string, string | undefined>> = Object.fromEntries(
  [
    ...BUILTIN_PROVIDERS.map((p) => [p.provider, p.icon] as const),
    ...COMPATIBLE_PROVIDERS.map((p) => [p.provider, p.icon] as const)
  ]
);

/**
 * Resolve the icon string for any provider.
 * For free/go/zen: looks up by `name`.
 * For custom: looks up by `provider` id, then falls back to `name`.
 */
export function getProviderIcon(
  provider: { name: string; provider?: string } | null | undefined
): string | undefined {
  if (!provider) return undefined;
  if (provider.provider) {
    return ICON_BY_PROVIDER_ID[provider.provider] ?? ICON_BY_NAME[provider.name];
  }
  return ICON_BY_NAME[provider.name];
}

/**
 * Resolve the list of available models for a provider.
 *
 * - **go / zen**: returns a single-model array from the preset data.
 * - **custom**: looks up the model list in BUILTIN_PROVIDERS or
 *   COMPATIBLE_PROVIDERS by the `provider` id.
 * - **free**: returns an empty array (no model selection).
 */
export function getModelsForProvider(provider: {
  type: string;
  name?: string;
  provider?: string;
}): readonly string[] {
  if (provider.type === 'go') {
    const preset = GO_PROVIDERS.find((p) => p.name === provider.name);
    return preset ? [preset.model] : [];
  }
  if (provider.type === 'zen') {
    const preset = ZEN_PROVIDERS.find((p) => p.name === provider.name);
    return preset ? [preset.model] : [];
  }
  if (provider.type === 'custom' && provider.provider) {
    const builtin = BUILTIN_PROVIDERS.find((p) => p.provider === provider.provider);
    if (builtin) return builtin.models;
    const compatible = COMPATIBLE_PROVIDERS.find((p) => p.provider === provider.provider);
    if (compatible) return compatible.models;
  }
  return [];
}

export const ALL_PROVIDER_TYPES = [
  ...FREE_PROVIDERS,
  ...GO_PROVIDERS,
  ...ZEN_PROVIDERS,
  ...BUILTIN_PROVIDERS,
  ...COMPATIBLE_PROVIDERS
].map((p) => p.provider);

export const LLM_PROVIDER_TYPES = [
  ...GO_PROVIDERS,
  ...ZEN_PROVIDERS,
  ...BUILTIN_PROVIDERS,
  ...COMPATIBLE_PROVIDERS
].map((p) => p.provider);
