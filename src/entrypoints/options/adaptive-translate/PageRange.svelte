<script lang="ts">
  import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';

  import SectionRow from '@/components/SectionRow.svelte';
  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import { pageRangeSchema } from '@/types/config';

  const options = [
    { value: 'main', label: i18n('page_range_main', { defaultValue: 'Main Content' }) },
    { value: 'all', label: i18n('page_range_all', { defaultValue: 'All Content' }) }
  ];
</script>

<SectionRow
  title={i18n('translate_page_range', {
    defaultValue: 'Translate page range'
  })}
  description={i18n('translate_page_range_description', {
    defaultValue: 'Select whether to translate only the main content or all content on the page.'
  })}>
  <div slot="controls">
    <Button
      class="w-full justify-between rounded-xl border-none bg-slate-100 px-3 py-2 text-slate-900 shadow hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
      <span>
        {options.find((item) => item.value === $config.quickTranslate.translate.pageRange)?.label ??
          i18n('unsupported_content', { defaultValue: 'Unsupported Content' })}
      </span>
      <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
    </Button>
    <Dropdown simple placement="bottom-end" class="max-h-80 overflow-y-auto shadow-md">
      {#each options as option (option.value)}
        <DropdownItem
          onclick={() =>
            ($config.quickTranslate.translate.pageRange = pageRangeSchema.parse(option.value))}>
          {option.label}
        </DropdownItem>
      {/each}
    </Dropdown>
  </div>
</SectionRow>
