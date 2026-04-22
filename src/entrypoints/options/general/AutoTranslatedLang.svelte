<script lang="ts">
  import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';

  import { config } from '@/lib/config';
  import { lang } from '@/lib/lang';
  import { i18n } from '@/lib/i18n';
  import SectionRow from '../SectionRow.svelte';

  interface Props {
    position: 'alwaysAutoTranslatedLang' | 'dontAutoTranslatedLang';
    title: string;
    description: string;
  }

  const { position, title, description }: Props = $props();
</script>

<SectionRow {title} {description}>
  <div slot="controls">
    <Button
      class="w-full justify-between rounded-xl bg-slate-100 px-3 py-2 text-slate-900 hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
      <span>
        {lang.codeToLang($config[position]) ??
          i18n('not_selected', { defaultValue: 'Not Selected' })}
      </span>
      <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
    </Button>
    <Dropdown simple placement="bottom-end" class="max-h-80 overflow-y-auto shadow-md">
      <DropdownItem onclick={() => ($config[position] = null)}>
        {i18n('not_selected', { defaultValue: 'Not Selected' })}
      </DropdownItem>
      {#each Object.entries(lang.all()) as [langCode, langName] (langCode)}
        <DropdownItem onclick={() => ($config[position] = langCode)}>
          {langName}
        </DropdownItem>
      {/each}
    </Dropdown>
  </div>
</SectionRow>
