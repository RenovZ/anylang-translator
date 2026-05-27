<script lang="ts">
  // import FeatureIcon from '@/components/FeatureIcon.svelte';
  import FeatureProvider from '@/components/FeatureProvider.svelte';
  import FeatureShortcut from '@/components/FeatureShortcut.svelte';
  import XLangs from '@/components/XLangs.svelte';
  import XSites from '@/components/XSites.svelte';
  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import { FEAT_INTELLIGENT_INPUT } from '@/preset/feature';

  import { intelligentInputNav as nav } from './data';
  import Section from './Section.svelte';

  const field = FEAT_INTELLIGENT_INPUT;
</script>

<Section title={nav.title} subtitle={nav.subtitle} description={nav.description}>
  <!-- icon -->
  <!-- <FeatureIcon
    title={i18n('intelligent_input_icon', {
      defaultValue: 'Intelligent input icon'
    })}
    {field} /> -->

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
  <XSites
    bind:sites={$config[field].disabledSites}
    title={i18n('intelligent_input_disabled_sites', {
      defaultValue: 'Disabled sites'
    })}
    description={i18n('intelligent_input_disabled_sites_description', {
      defaultValue:
        'When visiting these sites, intelligent input will be disabled. Site rules take priority over language rules.'
    })} />

  <!-- always apply intelligent input language -->
  <XLangs
    bind:langs={$config[field].disabledLangs}
    title={i18n('intelligent_input_disabled_langs', {
      defaultValue: 'Disabled languages'
    })}
    description={i18n('intelligent_input_disabled_langs_description', {
      defaultValue:
        'When the page language matches one of these, intelligent input will be disabled. Site rules take priority on conflicts.'
    })} />
</Section>
