<script lang="ts">
  import { Heading } from 'flowbite-svelte';

  import i18n from '@/lib/i18n';
  import ModalWrapper from '@/components/ModalWrapper.svelte';
  import ProviderIcon from '@/components/ProviderIcon.svelte';
  import { BUILTIN_PROVIDERS, COMPATIBLE_PROVIDERS } from '@/preset/provider';
  import type { PresetItem } from '@/types/provider';

  let {
    open = $bindable(false),
    onSelect
  }: {
    open: boolean;
    onSelect: (item: PresetItem) => void;
  } = $props();

  const sections = [
    {
      titleKey: 'built_in_llm_providers',
      titleDefault: 'Built-in LLM Providers',
      hintKey: 'built_in_llm_providers_hint',
      hintDefault:
        'Built-in large language model providers, no need to fill in most configurations like Base URL',
      providers: BUILTIN_PROVIDERS
    },
    {
      titleKey: 'openai_compatible_custom_providers',
      titleDefault: 'OpenAI Compatible Custom Providers',
      hintKey: 'openai_compatible_custom_providers_hint',
      hintDefault:
        "If you can't find your desired AI provider, select Custom Provider to configure any OpenAI-compatible provider, such as Zhipu AI",
      providers: COMPATIBLE_PROVIDERS
    }
  ];

  function handleSelect(item: PresetItem) {
    onSelect(item);
    open = false;
  }
</script>

{#snippet providerGrid(providers: readonly PresetItem[])}
  <div class="mt-4 grid grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-8">
    {#each providers as item (item.provider)}
      <button
        type="button"
        class="flex flex-col items-center gap-2 rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-600"
        onclick={() => handleSelect(item)}>
        <ProviderIcon name={item.name} icon={item.icon} class="w-10" />
        <span class="text-center text-xs text-gray-700 dark:text-gray-300">
          {item.name}
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
