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
  id="mouse-hover"
  title={i18n('options_hover_title', { defaultValue: 'Mouse hover' })}
  description={i18n('options_hover_description', {
    defaultValue: 'Automatically translate when hovering over paragraphs.'
  })}>
  <SectionRow
    title={i18n('options_hover_shortcut_title', { defaultValue: 'Trigger shortcut' })}
    description={i18n('options_hover_shortcut_description', {
      defaultValue: 'Choose the shortcut combination for hover translation'
    })}>
    <select
      value={config.toggleModes.hoverTrigger}
      onchange={(event) =>
        updateToggleMode('hoverTrigger', (event.currentTarget as HTMLSelectElement).value)}
      class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
      {#each getToggleConfig('hoverTrigger')?.options ?? [] as option (option.value)}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </SectionRow>
  <SectionRow
    title={i18n('options_hover_enabled_title', { defaultValue: 'Enabled status' })}
    description={i18n('options_hover_enabled_description', {
      defaultValue: 'Control whether hover can quickly translate current paragraph'
    })}>
    <div class="flex items-center justify-end">
      <Toggle
        bind:checked={toggleItems[1].enabled}
        size="small"
        classes={{ span: 'me-0 cursor-pointer bg-gray-300' }}
        aria-label={toggleItems[1].label} />
    </div>
  </SectionRow>
</Section>
