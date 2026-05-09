<script lang="ts">
  import { Alert, Button } from 'flowbite-svelte';

  import FeatureAutoAppliedLangs from '@/components/FeatureAutoAppliedLangs.svelte';
  import FeatureAutoAppliedSites from '@/components/FeatureAutoAppliedSites.svelte';
  import FeatureIcon from '@/components/FeatureIcon.svelte';
  import FeatureProvider from '@/components/FeatureProvider.svelte';
  import FeatureShortcut from '@/components/FeatureShortcut.svelte';
  import SectionRow from '@/components/SectionRow.svelte';
  import i18n from '@/lib/i18n';
  import { FEAT_PANORAMA_READING } from '@/preset/constants';

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
  <FeatureAutoAppliedSites
    {field}
    title={i18n('available_panorama_reading_sites', {
      defaultValue: 'Available panorama reading sites'
    })}
    description={i18n('available_panorama_reading_sites_description', {
      defaultValue:
        'When current site matches these domains, panorama reading feature could be used. This rule has higher priority than language rules.'
    })} />

  <!-- always apply panorama reading language -->
  <FeatureAutoAppliedLangs
    {field}
    title={i18n('available_panorama_reading_langs', {
      defaultValue: 'Available panorama reading languages'
    })}
    description={i18n('available_panorama_reading_langs_description', {
      defaultValue:
        'When page language is one of these languages, panorama reading feature could be used. Site rules still take priority on conflicts.'
    })} />
</Section>
