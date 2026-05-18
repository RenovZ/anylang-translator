<script lang="ts">
  import { Button } from 'flowbite-svelte';

  import FeatureAutoAppliedLangs from '@/components/FeatureAutoAppliedLangs.svelte';
  import FeatureAutoAppliedSites from '@/components/FeatureAutoAppliedSites.svelte';
  import FeatureIcon from '@/components/FeatureIcon.svelte';
  import FeatureProvider from '@/components/FeatureProvider.svelte';
  import FeatureShortcut from '@/components/FeatureShortcut.svelte';
  import SectionRow from '@/components/SectionRow.svelte';
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
  <FeatureAutoAppliedSites
    {field}
    title={i18n('instant_lookup_auto_apply_sites', {
      defaultValue: 'Automatically apply on sites'
    })}
    description={i18n('instant_lookup_auto_apply_sites_description', {
      defaultValue:
        'When visiting these sites, instant lookup will be automatically applied. Site rules take priority over language rules.'
    })} />

  <!-- always apply instant lookup language -->
  <FeatureAutoAppliedLangs
    {field}
    title={i18n('instant_lookup_auto_apply_langs', {
      defaultValue: 'Automatically apply for languages'
    })}
    description={i18n('instant_lookup_auto_apply_langs_description', {
      defaultValue:
        'When the page language matches one of these, instant lookup will be automatically applied. Site rules take priority on conflicts.'
    })} />
</Section>
