<script lang="ts">
  import { i18n } from '../../../lib/i18n';
  import { providerOptions } from '../../popup/data';
  import Section from './Section.svelte';
  import SectionRow from './SectionRow.svelte';
  import type { OptionsProviderSectionProps } from './section-props';

  export let config: OptionsProviderSectionProps['config'];
  export let getProviderModels: OptionsProviderSectionProps['getProviderModels'];
  export let updateField: OptionsProviderSectionProps['updateField'];
</script>

<Section
  id="services"
  title={i18n('options_services_title', { defaultValue: 'Translation services' })}
  description={i18n('options_services_description', {
    defaultValue: 'Choose your model provider and default model.'
  })}>
  <SectionRow
    title={i18n('options_services_provider_title', { defaultValue: 'Provider' })}
    description={i18n('options_services_provider_description', {
      defaultValue: 'Choose your preferred AI model provider'
    })}>
    <select
      value={config.provider}
      onchange={(event) =>
        updateField('provider', (event.currentTarget as HTMLSelectElement).value)}
      class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
      {#each providerOptions as option (option)}
        <option value={option}>{option}</option>
      {/each}
    </select>
  </SectionRow>
  <SectionRow
    title={i18n('options_services_default_model_title', { defaultValue: 'Default model' })}
    description={i18n('options_services_default_model_description', {
      defaultValue: 'Choose a model under the selected provider'
    })}>
    <select
      value={config.model}
      onchange={(event) => updateField('model', (event.currentTarget as HTMLSelectElement).value)}
      class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
      {#each getProviderModels(config.provider) as option (option)}
        <option value={option}>{option}</option>
      {/each}
    </select>
  </SectionRow>
</Section>
