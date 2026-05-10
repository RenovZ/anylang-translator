<script lang="ts">
  import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';

  import SectionRow from '@/components/SectionRow.svelte';
  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import { translateModeSchema } from '@/types/config';

  const options = [
    {
      value: 'bilingual',
      label: i18n('display_mode_bilingual_mode', { defaultValue: 'Bilingual Mode' })
    },
    {
      value: 'translation_only',
      label: i18n('display_mode_translation_only', { defaultValue: 'Translation only' })
    }
  ];
</script>

<SectionRow
  title={i18n('translate_display_mode', {
    defaultValue: 'Translate Display Mode'
  })}
  description={i18n('translate_display_mode_description', {
    defaultValue: 'Choose how the translated text is displayed: bilingual or translation only.'
  })}>
  <div slot="controls">
    <Button
      class="w-full justify-between rounded-xl border-none bg-slate-100 px-3 py-2 text-slate-900 shadow hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
      <span>
        {options.find((item) => item.value === $config.quickTranslate.translate.mode)?.label ??
          i18n('unsupported_content', { defaultValue: 'Unsupported Content' })}
      </span>
      <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
    </Button>
    <Dropdown simple placement="bottom-end" class="max-h-80 overflow-y-auto shadow-md">
      {#each options as option (option.value)}
        <DropdownItem
          onclick={() =>
            ($config.quickTranslate.translate.mode = translateModeSchema.parse(option.value))}>
          {option.label}
        </DropdownItem>
      {/each}
    </Dropdown>
  </div>
</SectionRow>
