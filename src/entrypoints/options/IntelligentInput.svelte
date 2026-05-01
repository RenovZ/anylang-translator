<script lang="ts">
  import i18n from '@/lib/i18n';
  import { FEAT_INTELLIGENT_INPUT } from '@/lib/preset/constants';
  import FeatureAutoAppliedLang from '@/components/FeatureAutoAppliedLang.svelte';
  import FeatureAutoAppliedSites from '@/components/FeatureAutoAppliedSites.svelte';
  import FeatureIcon from '@/components/FeatureIcon.svelte';
  import FeatureProvider from '@/components/FeatureProvider.svelte';
  import FeatureShortcut from '@/components/FeatureShortcut.svelte';
  import SectionRow from '@/components/SectionRow.svelte';

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
    title={i18n('always_apply_intelligent_input_sites', {
      defaultValue: 'Always apply intelligent input sites'
    })}
    description={i18n('always_apply_intelligent_input_sites_description', {
      defaultValue:
        'When current site matches these domains, content will automatically apply intelligent input to target language. This rule has higher priority than language rules.'
    })} />

  <!-- always apply intelligent input language -->
  <FeatureAutoAppliedLang
    {field}
    title={i18n('always_apply_intelligent_input_lang', {
      defaultValue: 'Always apply intelligent input language'
    })}
    description={i18n('always_auto_intelligent_input_lang_description', {
      defaultValue:
        'When page language is one of these languages, content will automatically apply intelligent input to target language. Site rules still take priority on conflicts.'
    })} />
</Section>
