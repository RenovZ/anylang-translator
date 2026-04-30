<script lang="ts">
  import { Button } from 'flowbite-svelte';

  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import SectionRow from '@/components/SectionRow.svelte';
  import FeatureIcon from '@/components/FeatureIcon.svelte';
  import FeatureProvider from '@/components/FeatureProvider.svelte';
  import FeatureShortcut from '@/components/FeatureShortcut.svelte';

  import Section from './Section.svelte';
  import { instantLookupNav as nav } from './data';

  const field = 'instantLookup';
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
</Section>
