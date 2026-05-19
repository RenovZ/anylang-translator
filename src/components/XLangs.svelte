<script lang="ts">
  import { MultiSelect } from 'flowbite-svelte';

  import i18n from '@/lib/i18n';
  import lang from '@/lib/lang';
  import type { LangCode } from '@/types/lang';

  import SectionRow from './SectionRow.svelte';

  interface Props {
    title: string;
    description: string;
    langs: LangCode[];
  }

  let { title, description, langs = $bindable([]) }: Props = $props();

  const languageOptions = Object.entries(lang.getLangCodeMap()).map(([langCode, langName]) => ({
    value: langCode,
    name: langName
  }));

  let selectedLanguages = $derived(langs ?? []);

  function handleChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    const values = Object.values(value);
    langs = values.length > 0 ? values : [];
  }
</script>

<SectionRow {title} {description}>
  <MultiSelect
    slot="controls"
    items={languageOptions}
    value={selectedLanguages}
    onchange={handleChange}
    placeholder={i18n('select_languages', { defaultValue: 'Select languages' })}
    class="w-full justify-between rounded-xl border-none bg-slate-100 px-3 py-2 text-slate-900 shadow hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600"
    classes={{
      svg: 'h-3 w-3 stroke-1 text-slate-400',
      close: 'text-slate-400',
      dropdown: 'border-none shadow py-2 px-0 rounded-lg top-[calc(100%+0.5rem)]',
      item: 'rounded-none'
    }} />

  <!-- <div
    class="max-h-80 space-y-1 overflow-y-auto rounded-xl bg-gray-50 p-4 shadow-inner dark:bg-gray-700">
    {#if selectedLanguages.length > 0}
      <div class="flex gap-2">
        {#each selectedLanguages as langCode (langCode)}
          <Badge
            dismissable
            large
            onclose={() => {
              const newValues = selectedLanguages.filter((code) => code !== langCode);
              $config[field][langsField] = newValues.length > 0 ? newValues : undefined;
            }}>
            {lang.codeToLang(langCode) ?? langCode}
          </Badge>
        {/each}
      </div>
    {:else}
      <p class="text-center text-sm text-gray-500 dark:text-gray-400">
        {i18n('no_language_configured', { defaultValue: 'No language configured' })}
      </p>
    {/if}
  </div> -->
</SectionRow>
