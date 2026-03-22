<script lang="ts">
  import { Toggle } from 'flowbite-svelte';

  import { i18n } from '../../../lib/i18n';
  import Section from './Section.svelte';
  import SectionRow from './SectionRow.svelte';
  import type { OptionsSectionSharedProps } from './section-props';

  export let config: OptionsSectionSharedProps['config'];
  export let toggleItems: OptionsSectionSharedProps['toggleItems'];
  export let getToggleConfig: OptionsSectionSharedProps['getToggleConfig'];
  export let updateToggleMode: OptionsSectionSharedProps['updateToggleMode'];
</script>

<Section
  id="selection-transiation"
  title={i18n('options_selection_title', { defaultValue: 'Selection translation' })}
  description={i18n('options_selection_description', {
    defaultValue: 'Quickly view translations after selecting text.'
  })}>
  <SectionRow
    title={i18n('options_selection_trigger_title', { defaultValue: 'Trigger mode' })}
    description={i18n('options_selection_trigger_description', {
      defaultValue: 'Choose how selection translation is triggered'
    })}>
    <select
      value={config.toggleModes.selectionTrigger}
      onchange={(event) =>
        updateToggleMode('selectionTrigger', (event.currentTarget as HTMLSelectElement).value)}
      class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
      {#each getToggleConfig('selectionTrigger')?.options ?? [] as option (option.value)}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </SectionRow>
  <SectionRow
    title={i18n('options_selection_enabled_title', { defaultValue: 'Enabled status' })}
    description={i18n('options_selection_enabled_description', {
      defaultValue: 'Control whether the selection translation entry is shown'
    })}>
    <div class="flex items-center justify-end">
      <Toggle
        bind:checked={toggleItems[2].enabled}
        size="small"
        classes={{ span: 'me-0 cursor-pointer bg-gray-300' }}
        aria-label={toggleItems[2].label} />
    </div>
  </SectionRow>
</Section>
