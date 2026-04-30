<script lang="ts">
  import i18n from '@/lib/i18n';
  import SectionRow from '@/components/SectionRow.svelte';
  import FeatureIcon from '@/components/FeatureIcon.svelte';
  import FeatureProvider from '@/components/FeatureProvider.svelte';
  import FeatureAutoAppliedSites from '@/components/FeatureAutoAppliedSites.svelte';
  import FeatureAutoAppliedLang from '@/components/FeatureAutoAppliedLang.svelte';
  import FeatureShortcut from '@/components/FeatureShortcut.svelte';

  import Section from './Section.svelte';
  import { writingCopilotNav as nav } from './data';

  const field = 'writingCopilot';
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
    title={i18n('always_apply_writing_copilot_sites', {
      defaultValue: 'Always apply writing copilot sites'
    })}
    description={i18n('always_apply_writing_copilot_sites_description', {
      defaultValue:
        'When current site matches these domains, content will automatically apply writing copilot to target language. This rule has higher priority than language rules.'
    })} />

  <!-- always apply writing copilot language -->
  <FeatureAutoAppliedLang
    {field}
    title={i18n('always_apply_writing_copilot_lang', {
      defaultValue: 'Always apply writing copilot language'
    })}
    description={i18n('always_apply_writing_copilot_lang_description', {
      defaultValue:
        'When page language is one of these languages, content will automatically apply writing copilot to target language. Site rules still take priority on conflicts.'
    })} />
</Section>
