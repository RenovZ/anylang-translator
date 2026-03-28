<script lang="ts">
  import { Toggle, Select } from 'flowbite-svelte';

  import { i18n } from '../../../lib/i18n';
  import Section from './Section.svelte';
  import SectionRow from './SectionRow.svelte';
  import type { OptionsSectionSharedProps } from './section-props';

  export let config: OptionsSectionSharedProps['config'];
  export let toggleItems: OptionsSectionSharedProps['toggleItems'];
  export let getToggleConfig: OptionsSectionSharedProps['getToggleConfig'];
  export let updateToggleMode: OptionsSectionSharedProps['updateToggleMode'];
</script>

<!-- Selection Translation Section -->
<Section
  id="selection-transiation"
  title={i18n('options_selection_title', { defaultValue: 'Selection translation' })}
  description={i18n('options_selection_description', {
    defaultValue: 'Quickly view translations after selecting text.'
  })}>
  <!-- Trigger Mode Selection -->
  <SectionRow
    title={i18n('options_selection_trigger_title', { defaultValue: 'Trigger mode' })}
    description={i18n('options_selection_trigger_description', {
      defaultValue: 'Choose how selection translation is triggered'
    })}>
    <Select
      slot="controls"
      value={config.toggleModes.selectionTrigger}
      onchange={(event) =>
        updateToggleMode('selectionTrigger', (event.currentTarget as HTMLSelectElement).value)}>
      {#each getToggleConfig('selectionTrigger')?.options ?? [] as option (option.value)}
        <option value={option.value}>{option.label}</option>
      {/each}
    </Select>
  </SectionRow>

  <!-- Enabled Status Toggle -->
  <SectionRow
    title={i18n('options_selection_enabled_title', { defaultValue: 'Enabled status' })}
    description={i18n('options_selection_enabled_description', {
      defaultValue: 'Control whether the selection translation entry is shown'
    })}>
    <div slot="controls" class="flex items-center justify-end">
      <Toggle
        bind:checked={toggleItems[2].enabled}
        size="small"
        classes={{ span: 'me-0 cursor-pointer bg-gray-300' }}
        aria-label={toggleItems[2].label} />
    </div>
  </SectionRow>
</Section>
