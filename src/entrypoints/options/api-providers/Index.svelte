<script lang="ts">
  import { Select } from 'flowbite-svelte';

  import { i18n } from '@/lib/i18n';
  import Section from '../Section.svelte';
  import SectionRow from '../SectionRow.svelte';
</script>

<!-- Services Settings Section -->
<Section
  id="services"
  title={i18n('api_providers', { defaultValue: 'API Providers' })}
  description={i18n('api_providers_hint', {
    defaultValue: 'Choose your model provider and default model.'
  })}>
  <!-- Provider Selection -->
  <!-- <SectionRow
    title={i18n('options_services_provider_title', { defaultValue: 'Provider' })}
    description={i18n('options_services_provider_description', {
      defaultValue: 'Choose your preferred AI model provider'
    })}>
    <Select
      slot="controls"
      value={config.provider}
      onchange={(event) =>
        updateField('provider', (event.currentTarget as HTMLSelectElement).value)}>
      {#each providerOptions as option (option)}
        <option value={option}>{option}</option>
      {/each}
    </Select>
  </SectionRow> -->

  <!-- Default Model Selection -->
  <!-- <SectionRow
    title={i18n('options_services_default_model_title', { defaultValue: 'Default model' })}
    description={i18n('options_services_default_model_description', {
      defaultValue: 'Choose a model under the selected provider'
    })}>
    <Select
      slot="controls"
      value={config.model}
      onchange={(event) => updateField('model', (event.currentTarget as HTMLSelectElement).value)}>
      {#each getProviderModels(config.provider) as option (option)}
        <option value={option}>{option}</option>
      {/each}
    </Select>
  </SectionRow> -->
</Section>
