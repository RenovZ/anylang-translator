<script lang="ts">
  import { Button, Dropdown, DropdownItem, Tooltip } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';
  import { twMerge } from 'tailwind-merge';

  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import lang from '@/lib/lang';
  import type { LangCode, UILangCode } from '@/types/lang';

  interface Props<T extends LangCode | UILangCode> {
    class?: string;
    langCodeType: 'ui' | 'target';
    langCode?: T | undefined;
    fallbackLangCode?: T;
  }

  let {
    class: className,
    langCodeType,
    langCode = $bindable(),
    fallbackLangCode
  }: Props<LangCode | UILangCode> = $props();

  const displayLangCode = $derived(langCode ?? fallbackLangCode);
  const langCodeOptions = $derived(
    langCodeType === 'ui'
      ? lang.getUILangCodeMap()
      : Object.entries(lang.getLangCodeMap($config.uiLangCode))
  );
</script>

<Button
  class={twMerge(
    'w-full justify-between rounded-xl border-none bg-slate-100 px-3 py-2 text-slate-900 shadow hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600',
    className
  )}>
  <span class="line-clamp-1 text-left break-all">
    {#if displayLangCode}
      {lang.getLangName(displayLangCode, $config.uiLangCode) ??
        i18n('auto_detect', { defaultValue: 'Auto Detect' })}
    {:else}
      {i18n('auto_detect', { defaultValue: 'Auto Detect' })}
    {/if}
  </span>
  <Tooltip class="max-w-80 text-left text-xs">
    {#if displayLangCode}
      {lang.getLangName(displayLangCode, $config.uiLangCode) ??
        i18n('auto_detect', { defaultValue: 'Auto Detect' })}
    {:else}
      {i18n('auto_detect', { defaultValue: 'Auto Detect' })}
    {/if}
  </Tooltip>
  <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
</Button>
<Dropdown simple placement="bottom-end" class="max-h-80 overflow-y-auto shadow-md">
  {#each langCodeOptions as [code, name] (code)}
    <DropdownItem onclick={() => (langCode = code)}>
      {name}
    </DropdownItem>
  {/each}
</Dropdown>
