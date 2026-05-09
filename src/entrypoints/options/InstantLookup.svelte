<script lang="ts">
  import { Button } from 'flowbite-svelte';

  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import FeatureAutoAppliedLangs from '@/components/FeatureAutoAppliedLangs.svelte';
  import FeatureAutoAppliedSites from '@/components/FeatureAutoAppliedSites.svelte';
  import FeatureIcon from '@/components/FeatureIcon.svelte';
  import FeatureProvider from '@/components/FeatureProvider.svelte';
  import FeatureShortcut from '@/components/FeatureShortcut.svelte';
  import SectionRow from '@/components/SectionRow.svelte';
  import { FEAT_INSTANT_LOOKUP } from '@/preset/constants';

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
  <FeatureAutoAppliedSites
    {field}
    title={i18n('available_instant_lookup_sites', {
      defaultValue: 'Available instant lookup sites'
    })}
    description={i18n('available_instant_lookup_sites_description', {
      defaultValue:
        'When current site matches these domains, instant lookup feature could be used. This rule has higher priority than language rules.'
    })} />

  <!-- always apply instant lookup language -->
  <FeatureAutoAppliedLangs
    {field}
    title={i18n('available_instant_lookup_langs', {
      defaultValue: 'Available instant lookup languages'
    })}
    description={i18n('available_instant_lookup_langs_description', {
      defaultValue:
        'When page language is one of these languages, instant lookup feature could be used. Site rules still take priority on conflicts.'
    })} />
</Section>
