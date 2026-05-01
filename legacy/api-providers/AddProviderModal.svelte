<script lang="ts">
  import { Modal } from 'flowbite-svelte';

  import type { Provider } from '@/lib/config';
  import { i18n } from '@/lib/i18n';
  import { paidUserProviders } from '@/lib/preset';

  let {
    open = $bindable(false),
    onSelect
  }: {
    open: boolean;
    onSelect: (provider: Provider) => void;
  } = $props();

  const customProviders: Provider[] = [
    { type: 'ai', name: 'Custom Provider', models: [] },
    { type: 'ai', name: 'Tensdaq', models: [] },
    { type: 'ai', name: 'SiliconFlow', models: [] },
    { type: 'ai', name: '302.AI', models: [] },
    { type: 'ai', name: 'Volcengine', models: [] }
  ];

  function handleSelect(provider: Provider) {
    onSelect(provider);
    open = false;
  }
</script>

<Modal
  bind:open
  title={i18n('add_new_provider', { defaultValue: 'Add New Provider' })}
  size="xl"
  outsideclose={false}>
  <div class="space-y-8">
    <!-- Built-in LLM Providers -->
    <div>
      <h3 class="text-base font-semibold text-gray-900 dark:text-white">
        {i18n('built_in_llm_providers', { defaultValue: 'Built-in LLM Providers' })}
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {i18n('built_in_llm_providers_hint', {
          defaultValue:
            'Built-in large language model providers, no need to fill in most configurations like Base URL'
        })}
      </p>
      <div class="mt-4 grid grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-8">
        {#each paidUserProviders as provider (provider)}
          <button
            type="button"
            class="flex flex-col items-center gap-2 rounded-xl p-3 transition hover:bg-gray-100 dark:hover:bg-gray-700"
            onclick={() => handleSelect(provider)}>
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-sm font-bold text-gray-600 dark:bg-gray-600 dark:text-gray-300">
              {provider.name.charAt(0)}
            </div>
            <span class="text-center text-xs text-gray-700 dark:text-gray-300"
              >{provider.name}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- OpenAI Compatible Custom Providers -->
    <div>
      <h3 class="text-base font-semibold text-gray-900 dark:text-white">
        {i18n('openai_compatible_custom_providers', {
          defaultValue: 'OpenAI Compatible Custom Providers'
        })}
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {i18n('openai_compatible_custom_providers_hint', {
          defaultValue:
            "If you can't find your desired AI provider, select Custom Provider to configure any OpenAI-compatible provider, such as Zhipu AI"
        })}
      </p>
      <div class="mt-4 grid grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-8">
        {#each customProviders as provider (provider)}
          <button
            type="button"
            class="flex flex-col items-center gap-2 rounded-xl p-3 transition hover:bg-gray-100 dark:hover:bg-gray-700"
            onclick={() => handleSelect(provider)}>
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-sm font-bold text-gray-600 dark:bg-gray-600 dark:text-gray-300">
              {provider.name.charAt(0)}
            </div>
            <span class="text-center text-xs text-gray-700 dark:text-gray-300"
              >{provider.name}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>
</Modal>
