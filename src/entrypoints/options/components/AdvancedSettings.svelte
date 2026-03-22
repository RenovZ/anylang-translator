<script lang="ts">
  import { Toggle } from 'flowbite-svelte';

  import { i18n } from '../../../lib/i18n';
  import Section from './Section.svelte';
  import SectionRow from './SectionRow.svelte';
  import type { OptionsSectionSharedProps } from './section-props';

  export let toggleItems: OptionsSectionSharedProps['toggleItems'];
</script>

<Section
  id="advanced"
  title={i18n('options_advanced_title', { defaultValue: 'Advanced settings' })}
  description={i18n('options_advanced_description', {
    defaultValue: 'More low-level and experimental feature settings.'
  })}>
  <SectionRow
    title={i18n('options_advanced_chinese_page_title', { defaultValue: 'Chinese pages' })}
    description={i18n('options_advanced_chinese_page_description', {
      defaultValue: 'Control whether Chinese (Simplified) pages are translated by default.'
    })}>
    <div class="flex items-center justify-end">
      <Toggle
        bind:checked={toggleItems[3].enabled}
        size="small"
        classes={{ span: 'me-0 cursor-pointer bg-gray-300' }}
        aria-label={toggleItems[3].label} />
    </div>
  </SectionRow>
  <SectionRow
    title={i18n('options_advanced_experimental_title', {
      defaultValue: 'Experimental features'
    })}
    description={i18n('options_advanced_experimental_description', {
      defaultValue: 'More experimental toggles will be added gradually in future versions.'
    })}>
    <div
      class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
      {i18n('options_advanced_experimental_body', {
        defaultValue:
          'Only advanced options already wired to storage are kept to avoid showing unsavable temporary switches.'
      })}
    </div>
  </SectionRow>
</Section>
