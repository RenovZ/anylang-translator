<script lang="ts">
  import FeatureIcon from '@/components/FeatureIcon.svelte';
  import FeatureProvider from '@/components/FeatureProvider.svelte';
  import FeatureShortcut from '@/components/FeatureShortcut.svelte';
  import XLangs from '@/components/XLangs.svelte';
  import XSites from '@/components/XSites.svelte';
  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import { FEAT_PANORAMA_READING } from '@/preset/feature';

  import { panoramaReadingNav as nav } from './data';
  import Section from './Section.svelte';

  const field = FEAT_PANORAMA_READING;
</script>

<Section title={nav.title} subtitle={nav.subtitle} description={nav.description}>
  <!-- icon -->
  <FeatureIcon
    title={i18n('panorama_reading_icon', {
      defaultValue: 'Panorama reading icon'
    })}
    {field} />

  <FeatureShortcut
    title={i18n('panorama_reading_shortcut', { defaultValue: 'Panorama reading shortcut' })}
    {field} />

  <!-- api provider -->
  <FeatureProvider
    {field}
    title={i18n('panorama_reading_provider', { defaultValue: 'Panorama reading provider' })}
    description={i18n('panorama_reading_provider_description', {
      defaultValue: 'Choose from a variety of API providers to power your panorama reading.'
    })} />

  <!-- always apply panorama reading sites -->
  <XSites
    bind:sites={$config[field].disabledSites}
    title={i18n('panorama_reading_disabled_sites', {
      defaultValue: 'Disabled sites'
    })}
    description={i18n('panorama_reading_disabled_sites_description', {
      defaultValue:
        'When visiting these sites, panorama reading will be disabled. Site rules take priority over language rules.'
    })} />

  <!-- always apply panorama reading language -->
  <XLangs
    bind:langs={$config[field].disabledLangs}
    title={i18n('panorama_reading_disabled_langs', {
      defaultValue: 'Disabled languages'
    })}
    description={i18n('panorama_reading_disabled_langs_description', {
      defaultValue:
        'When the page language matches one of these, panorama reading will be disabled. Site rules take priority on conflicts.'
    })} />
</Section>
