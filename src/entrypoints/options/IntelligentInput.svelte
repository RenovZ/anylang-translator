<script lang="ts">
  import FeatureAutoAppliedLangs from '@/components/FeatureAutoAppliedLangs.svelte';
  import FeatureAutoAppliedSites from '@/components/FeatureAutoAppliedSites.svelte';
  import FeatureIcon from '@/components/FeatureIcon.svelte';
  import FeatureProvider from '@/components/FeatureProvider.svelte';
  import FeatureShortcut from '@/components/FeatureShortcut.svelte';
  import SectionRow from '@/components/SectionRow.svelte';
  import i18n from '@/lib/i18n';
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
    title={i18n('intelligent_input_auto_apply_sites', {
      defaultValue: 'Automatically apply on sites'
    })}
    description={i18n('intelligent_input_auto_apply_sites_description', {
      defaultValue:
        'When visiting these sites, intelligent input will be automatically applied. Site rules take priority over language rules.'
    })} />

  <!-- always apply intelligent input language -->
  <FeatureAutoAppliedLangs
    {field}
    title={i18n('intelligent_input_auto_apply_langs', {
      defaultValue: 'Automatically apply for languages'
    })}
    description={i18n('intelligent_input_auto_apply_langs_description', {
      defaultValue:
        'When the page language matches one of these, intelligent input will be automatically applied. Site rules take priority on conflicts.'
    })} />
</Section>
