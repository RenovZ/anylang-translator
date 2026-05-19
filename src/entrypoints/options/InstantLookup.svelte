<script lang="ts">
  import FeatureIcon from '@/components/FeatureIcon.svelte';
  import FeatureProvider from '@/components/FeatureProvider.svelte';
  import FeatureShortcut from '@/components/FeatureShortcut.svelte';
  import XLangs from '@/components/XLangs.svelte';
  import XSites from '@/components/XSites.svelte';
  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import { FEAT_INSTANT_LOOKUP } from '@/preset/feature';

  import { instantLookupNav as nav } from './data';
  import Section from './Section.svelte';

  const field = FEAT_INSTANT_LOOKUP;
</script>

<Section title={nav.title} subtitle={nav.subtitle} description={nav.description}>
  <!-- icon -->
  <FeatureIcon
    title={i18n('instant_lookup_icon', {
      defaultValue: 'Instant lookup icon'
    })}
    {field} />

  <FeatureShortcut
    title={i18n('instant_lookup_shortcut', { defaultValue: 'Instant lookup shortcut' })}
    {field} />

  <!-- api provider -->
  <FeatureProvider
    {field}
    title={i18n('instant_lookup_provider', { defaultValue: 'Instant lookup provider' })}
    description={i18n('instant_lookup_provider_description', {
      defaultValue: 'Choose from a variety of API providers to power your instant lookup.'
    })} />

  <!-- always apply instant lookup sites -->
  <XSites
    bind:sites={$config[field].disabledSites}
    title={i18n('instant_lookup_disabled_sites', {
      defaultValue: 'Disabled sites'
    })}
    description={i18n('instant_lookup_disabled_sites_description', {
      defaultValue:
        'When visiting these sites, instant lookup will be disabled. Site rules take priority over language rules.'
    })} />

  <!-- always apply instant lookup language -->
  <XLangs
    bind:langs={$config[field].disabledLangs}
    title={i18n('instant_lookup_disabled_langs', {
      defaultValue: 'Disabled languages'
    })}
    description={i18n('instant_lookup_disabled_langs_description', {
      defaultValue:
        'When the page language matches one of these, instant lookup will be disabled. Site rules take priority on conflicts.'
    })} />
</Section>
