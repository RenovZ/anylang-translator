<script lang="ts">
  import { Button, Alert } from 'flowbite-svelte';

  import i18n from '@/lib/i18n';
  import SectionRow from '@/components/SectionRow.svelte';
  import FeatureIcon from '@/components/FeatureIcon.svelte';
  import FeatureProvider from '@/components/FeatureProvider.svelte';
  import FeatureAutoAppliedSites from '@/components/FeatureAutoAppliedSites.svelte';
  import FeatureAutoAppliedLang from '@/components/FeatureAutoAppliedLang.svelte';
  import FeatureShortcut from '@/components/FeatureShortcut.svelte';

  import Section from './Section.svelte';
  import { panoramaReadingNav as nav } from './data';

  const field = 'panoramaReading';
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
    title={i18n('always_apply_panorama_reading_sites', {
      defaultValue: 'Always apply panorama reading sites'
    })}
    description={i18n('always_apply_panorama_reading_sites_description', {
      defaultValue:
        'When current site matches these domains, content will automatically apply panorama reading to target language. This rule has higher priority than language rules.'
    })} />

  <!-- always apply panorama reading language -->
  <FeatureAutoAppliedLang
    {field}
    title={i18n('always_apply_panorama_reading_lang', {
      defaultValue: 'Always apply panorama reading language'
    })}
    description={i18n('always_apply_panorama_reading_lang_description', {
      defaultValue:
        'When page language is one of these languages, content will automatically apply panorama reading to target language. Site rules still take priority on conflicts.'
    })} />
</Section>
