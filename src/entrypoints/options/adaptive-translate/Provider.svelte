<script lang="ts">
  import { Button, Dropdown, DropdownItem, Toggle } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';

  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import type { Provider } from '@/lib/types';
  import ProviderIcon from '@/components/ProviderIcon.svelte';
  import ProvidersDropdown from '@/components/ProvidersDropdown.svelte';

  import SectionRow from '../SectionRow.svelte';

  interface Prop {
    title: string;
    description: string;
    field: 'quickTranslateProvider' | 'contextTranslateProvider';
  }

  const { title, description, field }: Prop = $props();
</script>

<SectionRow {title} {description}>
  <div class="flex w-full flex-col items-end space-y-3" slot="controls">
    <Button
      class="w-full justify-between rounded-xl border-none bg-slate-100 px-3 py-2 text-slate-900 shadow hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
      <div class="flex items-center gap-2">
        <ProviderIcon provider={$config[field]} class="w-4" />
        <span>
          {$config[field]?.name || '—'}
          {#if $config[field] && $config[field].type !== 'free' && $config[field].model}
            ({$config[field].model})
          {/if}
        </span>
      </div>
      <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
    </Button>
    <ProvidersDropdown />
    <button class="text-primary-600 w-fit text-sm">
      {i18n('provider_test', { defaultValue: 'Test this provider' })}
    </button>
  </div>
</SectionRow>
