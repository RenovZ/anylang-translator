<script lang="ts">
  import FeatureAutoAppliedLangs from '@/components/FeatureAutoAppliedLangs.svelte';
  import FeatureAutoAppliedSites from '@/components/FeatureAutoAppliedSites.svelte';
  import FeatureIcon from '@/components/FeatureIcon.svelte';
  import FeatureProvider from '@/components/FeatureProvider.svelte';
  import FeatureShortcut from '@/components/FeatureShortcut.svelte';
  import i18n from '@/lib/i18n';
  import { FEAT_WRITING_COPILOT } from '@/preset/constants';

  import { writingCopilotNav as nav } from './data';
  import Section from './Section.svelte';

  const field = FEAT_WRITING_COPILOT;
</script>

<Section title={nav.title} subtitle={nav.subtitle} description={nav.description}>
  <!-- icon -->
  <FeatureIcon
    title={i18n('writing_copilot_icon', {
      defaultValue: 'Writing copilot icon'
    })}
    {field} />

  <FeatureShortcut
    title={i18n('writing_copilot_shortcut', { defaultValue: 'Writing copilot shortcut' })}
    {field} />

  <!-- api provider -->
  <FeatureProvider
    {field}
    title={i18n('writing_copilot_provider', { defaultValue: 'Writing copilot provider' })}
    description={i18n('writing_copilot_provider_description', {
      defaultValue: 'Choose from a variety of API providers to power your writing copilot.'
    })} />

  <!-- always apply writing copilot sites -->
  <FeatureAutoAppliedSites
    {field}
    title={i18n('available_writing_copilot_sites', {
      defaultValue: 'Available writing copilot sites'
    })}
    description={i18n('available_writing_copilot_sites_description', {
      defaultValue:
        'When current site matches these domains, writing copilot feature could be used. This rule has higher priority than language rules.'
    })} />

  <!-- always apply writing copilot languages -->
  <FeatureAutoAppliedLangs
    {field}
    title={i18n('available_writing_copilot_langs', {
      defaultValue: 'Available writing copilot languages'
    })}
    description={i18n('available_writing_copilot_langs_description', {
      defaultValue:
        'When page language is one of these languages, writing copilot feature could be used. Site rules still take priority on conflicts.'
    })} />
</Section>
