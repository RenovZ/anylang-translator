<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import LocalIcon from '@/components/LocalIcon.svelte';
  import ProviderIcon from '@/components/ProviderIcon.svelte';
  import ProvidersDropdown from '@/components/ProvidersDropdown.svelte';
  import config from '@/lib/config';
  import shortcut from '@/lib/shortcut';
  import type { FeatureField } from '@/preset/constants';
  import { getProviderIcon } from '@/preset/provider';

  interface Prop {
    title: string | import('svelte').Snippet;
    field: FeatureField;
    showFreeProviders?: boolean;
    classes?: { main?: string; button?: string };
  }

  const { title, field, showFreeProviders = false, classes = {} }: Prop = $props();
</script>

<div class={twMerge('grid grid-cols-[144px_1fr] items-center gap-2', classes.main)}>
  {#if typeof title === 'string'}
    <div class="flex items-center gap-2 text-xs font-medium">
      <span>{title}</span>
      {#if $config[field].shortcut?.length}
        <span>
          ({shortcut.formatForDisplay($config[field].shortcut).join('')})
        </span>
      {/if}
    </div>
  {:else}
    {@render title()}
  {/if}
  <button type="button" class={twMerge('flex items-center', classes.button)}>
    <div class="flex flex-1 items-center gap-1">
      <ProviderIcon
        name={$config[field].provider?.name ?? ''}
        icon={getProviderIcon($config[field].provider)}
        class="w-4" />
      {#if $config[field].provider}
        <span class="line-clamp-1 w-full text-left">
          {$config[field].provider.name}
          {#if $config[field].provider.type !== 'free' && $config[field].provider.model}
            ({$config[field].provider.model})
          {/if}
        </span>
      {:else}
        <span class="line-clamp-1 w-full text-slate-300 dark:text-slate-500">
          {'-'.repeat(6)}
        </span>
      {/if}
    </div>
    <LocalIcon icon="tabler:chevron-down" class="h-4 w-4" />
  </button>
  <ProvidersDropdown {field} {showFreeProviders} class="max-h-56" />
</div>
