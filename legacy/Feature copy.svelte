<script lang="ts">
  import { A, Button, Input, Kbd, Tooltip } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';
  import { twMerge } from 'tailwind-merge';
  import Icon from '@iconify/svelte';

  import ProviderIcon from '@/components/ProviderIcon.svelte';
  import ProvidersDropdown from '@/components/ProvidersDropdown.svelte';
  import config from '@/lib/config';
  import shortcut from '@/lib/shortcut';
  import type { FeatureField } from '@/lib/types';

  interface Prop {
    title: string;
    iconClass?: string;
    field: FeatureField;
    showFreeProviders?: boolean;
    buttonColor:
      | 'primary'
      | 'gray'
      | 'amber'
      | 'yellow'
      | 'lime'
      | 'green'
      | 'cyan'
      | 'blue'
      | 'violet';
  }

  const { title, iconClass, field, showFreeProviders = false, buttonColor }: Prop = $props();
</script>

<div class="grid grid-cols-2 items-center gap-4">
  <Button
    size="xs"
    class="flex w-full items-center gap-1 border-none p-1 text-sm shadow"
    color={buttonColor}>
    <Icon icon={$config[field].icon} class={twMerge('h-auto w-5 shrink-0', iconClass)} />
    <span class="line-clamp-1 text-left">{title}</span>
    {#if $config[field].shortcut?.length}
      <span class="text-xs">
        {#each $config[field].shortcut as key (key)}
          <span>{shortcut.formatKey(key)}</span>
        {/each}
      </span>
    {/if}
  </Button>
  <Tooltip class="text-xs">{title}</Tooltip>
  <button
    type="button"
    class="flex flex-1 items-center justify-between gap-1 rounded-lg border-none bg-slate-100 p-1 text-slate-900 shadow hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
    <div class="flex flex-1 items-center gap-1">
      <ProviderIcon provider={$config[field].provider} class="w-4" />
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
    <!-- <ChevronDownOutline class="h-5 w-5 text-slate-400" /> -->
    <Icon icon="tabler:chevron-down" class="h-4 w-4 shrink-0 text-slate-400" />
  </button>
  <ProvidersDropdown {field} {showFreeProviders} class="max-h-56" />
</div>
