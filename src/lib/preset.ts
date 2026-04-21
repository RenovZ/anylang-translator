import { i18n } from '@/lib/i18n';
import { type Provider } from './config';

export const allProviders: Provider[] = [
  { type: 'api', name: 'Google Translator' },
  { type: 'api', name: 'Bing Translator' },
  { type: 'ai', name: 'OpenAI', models: ['gpt-4.1-mini', 'gpt-4.1', 'gpt-4o-mini'] },
  { type: 'ai', name: 'Anthropic', models: ['claude-3-5-haiku', 'claude-3-7-sonnet'] },
  { type: 'ai', name: 'Google AI', models: ['gemini-2.5-flash', 'gemini-2.5-pro'] },
  { type: 'ai', name: 'AWS', models: ['amazon.nova-lite', 'amazon.nova-pro'] },
  { type: 'ai', name: 'Ollama Cloud', models: ['qwen3.5-2b', 'llama3.2', 'deepseek-r1:7b'] },
  { type: 'ai', name: 'Groq', models: ['llama-3.3-70b', 'deepseek-r1-distill-llama-70b'] },
  {
    type: 'ai',
    name: 'Hugging Face',
    models: ['Qwen/Qwen2.5-7B-Instruct', 'mistralai/Mistral-7B-Instruct-v0.3']
  },
  { type: 'ai', name: 'Mistral AI', models: ['mistral-small-latest', 'ministral-8b-latest'] },
  { type: 'ai', name: 'Cohere', models: ['command-r', 'command-r-plus'] },
  {
    type: 'ai',
    name: 'Fireworks',
    models: ['accounts/fireworks/models/deepseek-v3', 'accounts/fireworks/models/qwen2p5-coder-32b']
  },
  { type: 'ai', name: 'xAI (Grok)', models: ['grok-2-latest', 'grok-2-mini'] },
  { type: 'ai', name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-reasoner'] },
  { type: 'ai', name: 'Perplexity', models: ['sonar', 'sonar-pro'] },
  { type: 'ai', name: 'Azure AI', models: ['gpt-4.1-mini', 'gpt-4o-mini'] },
  {
    type: 'ai',
    name: 'NVIDIA AI',
    models: ['meta/llama-3.1-70b-instruct', 'nvidia/llama-3.1-nemotron-70b-instruct']
  },
  { type: 'ai', name: 'IBM', models: ['granite-3.2-8b-instruct', 'granite-3.1-2b-instruct'] },
  {
    type: 'ai',
    name: 'Together',
    models: ['meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', 'Qwen/Qwen2.5-72B-Instruct-Turbo']
  },
  {
    type: 'ai',
    name: 'OpenRouter',
    models: ['openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet', 'google/gemini-2.0-flash-001']
  }
];

export const promptPresets = [
  { value: 'general', label: i18n('prompt_preset_general', { defaultValue: 'General' }) },
  {
    value: 'smart_select',
    label: i18n('prompt_preset_smart_select', { defaultValue: 'Smart selection' })
  },
  {
    value: 'paraphrase_master',
    label: i18n('prompt_preset_paraphrase_master', { defaultValue: 'Paraphrase master' })
  },
  {
    value: 'paragraph_summary_expert',
    label: i18n('prompt_preset_paragraph_summary', {
      defaultValue: 'Paragraph summary expert'
    })
  },
  {
    value: 'english_simplify_master',
    label: i18n('prompt_preset_english_simplify', {
      defaultValue: 'English simplification master'
    })
  },
  {
    value: 'twitter_enhancer',
    label: i18n('prompt_preset_twitter_enhancer', {
      defaultValue: 'Twitter translation enhancer'
    })
  },
  {
    value: 'tech_translation_master',
    label: i18n('prompt_preset_tech_translation', { defaultValue: 'Tech translation master' })
  },
  {
    value: 'reddit_enhancer',
    label: i18n('prompt_preset_reddit_enhancer', {
      defaultValue: 'Reddit translation enhancer'
    })
  },
  {
    value: 'paper_translation_expert',
    label: i18n('prompt_preset_paper_translation', {
      defaultValue: 'Academic paper translator'
    })
  },
  {
    value: 'news_media_translator',
    label: i18n('prompt_preset_news_media', { defaultValue: 'News media translator' })
  },
  {
    value: 'music_expert',
    label: i18n('prompt_preset_music', { defaultValue: 'Music expert' })
  },
  {
    value: 'medical_translation_master',
    label: i18n('prompt_preset_medical', { defaultValue: 'Medical translation master' })
  },
  {
    value: 'legal_industry_translator',
    label: i18n('prompt_preset_legal', { defaultValue: 'Legal industry translator' })
  },
  {
    value: 'github_enhancer',
    label: i18n('prompt_preset_github_enhancer', {
      defaultValue: 'GitHub translation enhancer'
    })
  },
  {
    value: 'game_translator',
    label: i18n('prompt_preset_game', { defaultValue: 'Game translator' })
  },
  {
    value: 'ecommerce_translation_master',
    label: i18n('prompt_preset_ecommerce', { defaultValue: 'E-commerce translation master' })
  },
  {
    value: 'finance_translation_consultant',
    label: i18n('prompt_preset_finance', { defaultValue: 'Finance translation consultant' })
  },
  {
    value: 'novel_translator',
    label: i18n('prompt_preset_novel', { defaultValue: 'Novel translator' })
  },
  {
    value: 'ao3_translator',
    label: i18n('prompt_preset_ao3', { defaultValue: 'AO3 translator' })
  },
  {
    value: 'ebook_translator',
    label: i18n('prompt_preset_ebook', { defaultValue: 'E-book translator' })
  },
  { value: 'designer', label: i18n('prompt_preset_designer', { defaultValue: 'Designer' }) },
  {
    value: 'mixed_zh_en',
    label: i18n('prompt_preset_mixed_zh_en', { defaultValue: 'Mixed Chinese-English' })
  },
  {
    value: 'web3_translation_master',
    label: i18n('prompt_preset_web3', { defaultValue: 'Web3 translation master' })
  },
  {
    value: 'more_translation_experts',
    label: i18n('prompt_preset_more_experts', { defaultValue: 'More translation experts' })
  }
];
