<script lang="ts">
  import { Button, Dropdown, DropdownItem, Toggle } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';
  import { twMerge } from 'tailwind-merge';

  import config from '@/lib/config';
  import type { FeatureField } from '@/preset/feature';
  import { getProviderIcon } from '@/preset/provider';
  import { isCustomProvider, isPaidProvider } from '@/types/provider';

  import ProviderIcon from './ProviderIcon.svelte';
  import ProvidersDropdown from './ProvidersDropdown.svelte';

  interface Prop {
    showFreeProviders?: boolean;
    field: FeatureField;
    class?: string;
  }

  const { field, showFreeProviders = false, class: className }: Prop = $props();
</script>

<Button
  class={twMerge(
    'w-full justify-between rounded-xl border-none bg-slate-100 px-3 py-2 text-slate-900 shadow hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600',
    className
  )}>
  <div class="flex items-center gap-2">
    {#if $config[field].provider}
      <ProviderIcon
        icon={getProviderIcon($config[field].provider)}
        name={$config[field].provider.name}
        class="w-4" />
      <span>
        {$config[field].provider.name}
        {#if isPaidProvider($config[field].provider)}
          ({$config[field].provider.model})
        {:else if isCustomProvider($config[field].provider) && $config[field].provider.model.name}
          ({$config[field].provider.model.name})
        {/if}
      </span>
    {:else}
      <span class="line-clamp-1 text-slate-300 dark:text-slate-500">
        {'-'.repeat(6)}
      </span>
    {/if}
  </div>
  <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
</Button>
<ProvidersDropdown {field} {showFreeProviders} />
