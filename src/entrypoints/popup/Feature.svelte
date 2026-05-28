<script lang="ts">
  import { Tooltip } from 'flowbite-svelte';
  import { twMerge } from 'tailwind-merge';

  import LocalIcon from '@/components/LocalIcon.svelte';
  import ProviderIcon from '@/components/ProviderIcon.svelte';
  import ProvidersDropdown from '@/components/ProvidersDropdown.svelte';
  import config from '@/lib/config';
  import shortcut from '@/lib/shortcut';
  import { FEAT_INSTANT_LOOKUP, FEAT_LANG_DETECTION, type FeatureField } from '@/preset/feature';
  import { getProviderIcon } from '@/preset/provider';
  import { isCustomProvider, isPaidProvider } from '@/types/provider';

  interface Prop {
    title: string | import('svelte').Snippet;
    field: Exclude<FeatureField, typeof FEAT_LANG_DETECTION>;
    showFreeProviders?: boolean;
    showShortcut?: boolean;
    classes?: { main?: string; button?: string };
    children?: import('svelte').Snippet;
  }

  const {
    title,
    field,
    showFreeProviders = false,
    showShortcut = true,
    classes = {},
    children
  }: Prop = $props();
</script>

<div class={twMerge('grid grid-cols-[1fr_auto] items-center gap-4', classes.main)}>
  {#if typeof title === 'string'}
    <div class="flex flex-nowrap items-center gap-2 text-xs">
      <span class="text-nowrap">{title}</span>
      {#if field !== FEAT_INSTANT_LOOKUP && showShortcut && $config[field].shortcut?.length}
        <span class="text-nowrap">
          ({shortcut.formatForDisplay($config[field].shortcut).join('')})
        </span>
      {/if}
    </div>
  {:else}
    {@render title()}
  {/if}
  {#if children}
    {@render children()}
  {:else}
    <button type="button" class={twMerge('flex items-center font-semibold', classes.button)}>
      <div class="flex flex-1 items-center gap-1">
        <ProviderIcon
          name={$config[field].provider?.name ?? ''}
          icon={getProviderIcon($config[field].provider)}
          class="w-4" />
        {#if $config[field].provider}
          <span class="line-clamp-1 w-full text-left break-all">
            {$config[field].provider.name}
            {#if isPaidProvider($config[field].provider)}
              ({$config[field].provider.model})
            {:else if isCustomProvider($config[field].provider) && $config[field].provider.model.name}
              ({$config[field].provider.model.name})
            {/if}
          </span>
          <Tooltip class="max-w-80 text-left text-xs">
            {$config[field].provider.name}
            {#if isPaidProvider($config[field].provider)}
              ({$config[field].provider.model})
            {:else if isCustomProvider($config[field].provider) && $config[field].provider.model.name}
              ({$config[field].provider.model.name})
            {/if}
          </Tooltip>
        {:else}
          <span class="line-clamp-1 w-full text-slate-300 dark:text-slate-500">
            {'-'.repeat(6)}
          </span>
        {/if}
      </div>
      <LocalIcon icon="tabler:chevron-down" class="h-4 w-4" />
    </button>
    <ProvidersDropdown {field} {showFreeProviders} class="max-h-56" />
  {/if}
</div>
