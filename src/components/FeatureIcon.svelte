<script lang="ts">
  import { A, Input } from 'flowbite-svelte';
  import { twMerge } from 'tailwind-merge';

  import IconWrapper from '@/components/IconWrapper.svelte';
  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import type { FEAT_LANG_DETECTION, FeatureField } from '@/preset/feature';

  import SectionRow from './SectionRow.svelte';

  interface Prop {
    title: string;
    description?: string;
    iconClass?: string;
    field: Exclude<FeatureField, typeof FEAT_LANG_DETECTION>;
  }

  const { title, description, iconClass, field }: Prop = $props();
</script>

<SectionRow {title} {description}>
  <div class="flex flex-col space-y-3" slot="controls">
    <div class="flex gap-2">
      <span class="content-center rounded-lg border-none p-2 shadow">
        <IconWrapper icon={$config[field].icon} class={twMerge('h-auto w-6 shrink-0', iconClass)} />
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
