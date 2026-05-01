<script lang="ts">
  import { A, Input } from 'flowbite-svelte';
  import { twMerge } from 'tailwind-merge';
  import Icon from '@iconify/svelte';

  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import type { FeatureField } from '@/lib/types';

  import SectionRow from './SectionRow.svelte';

  interface Prop {
    title: string;
    description?: string;
    iconClass?: string;
    field: FeatureField;
  }

  const { title, description, iconClass, field }: Prop = $props();
</script>

<SectionRow {title} {description}>
  <div class="flex flex-col space-y-3" slot="controls">
    <div class="flex gap-2">
      <span class="content-center rounded-lg border-none p-2 shadow">
        <Icon icon={$config[field].icon} class={twMerge('h-auto w-6', iconClass)} />
      </span>
      <Input
        type="text"
        class="border-none bg-gray-50 shadow placeholder:text-slate-400 dark:bg-gray-600"
        bind:value={$config[field].icon} />
    </div>
    <A href="https://icon-sets.iconify.design/" target="_blank" class="self-end text-sm">
      {i18n('find_more_icons', { defaultValue: 'Find more icons' })}
    </A>
  </div>
</SectionRow>
