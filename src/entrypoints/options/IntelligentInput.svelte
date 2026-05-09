<script lang="ts">
  import i18n from '@/lib/i18n';
  import FeatureAutoAppliedLangs from '@/components/FeatureAutoAppliedLangs.svelte';
  import FeatureAutoAppliedSites from '@/components/FeatureAutoAppliedSites.svelte';
  import FeatureIcon from '@/components/FeatureIcon.svelte';
  import FeatureProvider from '@/components/FeatureProvider.svelte';
  import FeatureShortcut from '@/components/FeatureShortcut.svelte';
  import SectionRow from '@/components/SectionRow.svelte';
  import { FEAT_INTELLIGENT_INPUT } from '@/preset/constants';

  import { intelligentInputNav as nav } from './data';
  import Section from './Section.svelte';

  const field = FEAT_INTELLIGENT_INPUT;
</script>

<Section title={nav.title} subtitle={nav.subtitle} description={nav.description}>
  <!-- icon -->
  <FeatureIcon
    title={i18n('intelligent_input_icon', {
      defaultValue: 'Intelligent input icon'
    })}
    {field} />

  <FeatureShortcut
    title={i18n('intelligent_input_shortcut', { defaultValue: 'Intelligent input shortcut' })}
    {field} />

  <!-- api provider -->
  <FeatureProvider
    {field}
    title={i18n('intelligent_input_provider', { defaultValue: 'Intelligent input provider' })}
    description={i18n('intelligent_input_provider_description', {
      defaultValue: 'Choose from a variety of API providers to power your intelligent input.'
    })} />

  <!-- always apply intelligent input sites -->
  <FeatureAutoAppliedSites
    {field}
    title={i18n('available_intelligent_input_sites', {
      defaultValue: 'Available intelligent input sites'
    })}
    description={i18n('available_intelligent_input_sites_description', {
      defaultValue:
        'When current site matches these domains, intelligent input feature could be used. This rule has higher priority than language rules.'
    })} />

  <!-- always apply intelligent input language -->
  <FeatureAutoAppliedLangs
    {field}
    title={i18n('available_intelligent_input_langs', {
      defaultValue: 'Available intelligent input languages'
    })}
    description={i18n('available_intelligent_input_langs_description', {
      defaultValue:
        'When page language is one of these languages, intelligent input feature could be used. Site rules still take priority on conflicts.'
    })} />
</Section>
