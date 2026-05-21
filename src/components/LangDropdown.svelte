<script lang="ts">
  import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';
  import { twMerge } from 'tailwind-merge';

  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import lang from '@/lib/lang';

  interface Props {
    class?: string;
  }

  let { class: className }: Props = $props();
</script>

<Button
  class={twMerge(
    'w-full justify-between rounded-xl border-none bg-slate-100 px-3 py-2 text-slate-900 shadow hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600',
    className
  )}>
  <span>
    {lang.getLangName($config.targetLangCode) ??
      i18n('auto_detect', { defaultValue: 'Auto Detect' })}
  </span>
  <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
</Button>
<Dropdown simple placement="bottom-end" class="max-h-80 overflow-y-auto shadow-md">
  {#each Object.entries(lang.getLangCodeMap()) as [langCode, langName] (langCode)}
    <DropdownItem onclick={() => ($config.targetLangCode = langCode)}>
      {langName}
    </DropdownItem>
  {/each}
</Dropdown>
