<script lang="ts">
  import { Select } from 'flowbite-svelte';
  import { i18n } from '../../../lib/i18n';
  import { promptPresetOptions } from '../../popup/data';
  import Section from './Section.svelte';
  import SectionRow from './SectionRow.svelte';
  import type { OptionsProviderSectionProps } from './section-props';

  export let config: OptionsProviderSectionProps['config'];
  export let updateField: OptionsProviderSectionProps['updateField'];
</script>

<!-- AI Experts Section -->
<Section
  id="ai"
  title={i18n('options_ai_title', { defaultValue: 'AI experts' })}
  description={i18n('options_ai_description', {
    defaultValue: 'Choose default prompt preset and AI expert mode.'
  })}>
  <!-- Prompt Preset Selection -->
  <SectionRow
    title={i18n('options_ai_prompt_preset_title', { defaultValue: 'Prompt preset' })}
    description={i18n('options_ai_prompt_preset_description', {
      defaultValue: 'Choose the prompt preset for your current scenario'
    })}>
    <Select
      slot="controls"
      value={config.promptPreset}
      onchange={(event) =>
        updateField('promptPreset', (event.currentTarget as HTMLSelectElement).value)}>
      {#each promptPresetOptions as option (option.value)}
        <option value={option.value}>{option.label}</option>
      {/each}
    </Select>
  </SectionRow>
</Section>
