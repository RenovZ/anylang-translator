<script lang="ts">
  import { Avatar, Heading } from 'flowbite-svelte';

  import i18n from '@/lib/i18n';
  import type { Provider } from '@/lib/types';
  import ProviderIcon from '@/components/ProviderIcon.svelte';
  import ModalWrapper from '@/components/ModalWrapper.svelte';

  let {
    open = $bindable(false),
    onSelect
  }: {
    open: boolean;
    onSelect: (item: Provider) => void;
  } = $props();

  const allProviders = (
    [
      { type: 'custom', name: 'OpenAI', icon: 'openai' },
      { type: 'custom', name: 'DeepSeek', icon: 'deepseek' },
      { type: 'custom', name: 'Gemini', icon: 'gemini', company: 'Google' },
      { type: 'custom', name: 'Anthropic', icon: 'anthropic' },
      { type: 'custom', name: 'Grok', icon: 'grok' },
      { type: 'custom', name: 'Groq', icon: 'groq' },
      { type: 'custom', name: 'DeepInfra', icon: 'deepinfra' },
      { type: 'custom', name: 'Mistral AI', icon: 'mistral' },
      { type: 'custom', name: 'Together.ai', icon: 'together' },
      { type: 'custom', name: 'Cohere', icon: 'cohere' },
      { type: 'custom', name: 'Fireworks AI', icon: 'fireworks' },
      { type: 'custom', name: 'Cerebras', icon: 'cerebras' },
      { type: 'custom', name: 'Replicate', icon: 'replicate' },
      { type: 'custom', name: 'Perplexity', icon: 'perplexity' },
      { type: 'custom', name: 'Vercel', icon: 'vercel' },
      { type: 'custom', name: 'Hugging Face', icon: 'huggingface' },
      { type: 'custom', name: 'Ollama', icon: 'ollama' },
      { type: 'custom', name: 'MiniMax', icon: 'minimax' },
      { type: 'custom', name: 'Kimi', icon: 'kimi', company: 'Moonshot AI' },
      { type: 'custom', name: 'Qwen', icon: 'qwen', company: 'Alibaba' },
      { type: 'custom', name: 'Bedrock', icon: 'bedrock', company: 'Amazon' },
      { type: 'custom', name: 'OpenRouter', icon: 'openrouter' },
      { type: 'custom', name: 'Z.ai', icon: 'zai' }
    ] as Provider[]
  ).toSorted((a, b) => a.name.localeCompare(b.name));

  const openaiCompatibleProviders = [
    { type: 'custom', name: '302.AI', icon: 'ai302' },
    { type: 'custom', name: 'SiliconCloud', icon: 'siliconcloud' },
    { type: 'custom', name: 'Volcengine', icon: 'volcengine', company: 'ByteDance' },
    { type: 'custom', name: 'Custom Provider' }
  ] as Provider[];

  const sections = [
    {
      titleKey: 'built_in_llm_providers',
      titleDefault: 'Built-in LLM Providers',
      hintKey: 'built_in_llm_providers_hint',
      hintDefault:
        'Built-in large language model providers, no need to fill in most configurations like Base URL',
      providers: allProviders
    },
    {
      titleKey: 'openai_compatible_custom_providers',
      titleDefault: 'OpenAI Compatible Custom Providers',
      hintKey: 'openai_compatible_custom_providers_hint',
      hintDefault:
        "If you can't find your desired AI provider, select Custom Provider to configure any OpenAI-compatible provider, such as Zhipu AI",
      providers: openaiCompatibleProviders
    }
  ];

  function handleSelect(item: Provider) {
    onSelect(item);
    open = false;
  }
</script>

{#snippet providerGrid(providers: Provider[])}
  <div class="mt-4 grid grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-8">
    {#each providers as provider (provider)}
      <button
        type="button"
        class="flex flex-col items-center gap-2 rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-600"
        onclick={() => handleSelect(provider)}>
        <ProviderIcon {provider} avatarClass="h-auto w-10" imgClass="h-auto w-10" />
        <span class="text-center text-xs text-gray-700 dark:text-gray-300">
          {provider.name}
        </span>
      </button>
    {/each}
  </div>
{/snippet}

<ModalWrapper bind:open>
  <div class="space-y-8">
    <Heading tag="h5" class="font-medium">
      {i18n('add_new_provider', { defaultValue: 'Add New Provider' })}
    </Heading>

    {#each sections as section (section.titleKey)}
      <div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">
          {i18n(section.titleKey, { defaultValue: section.titleDefault })}
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {i18n(section.hintKey, { defaultValue: section.hintDefault })}
        </p>
        {@render providerGrid(section.providers)}
      </div>
    {/each}
  </div>
</ModalWrapper>
