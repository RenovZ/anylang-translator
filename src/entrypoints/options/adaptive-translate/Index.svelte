<script lang="ts">
  import FeatureAutoAppliedLangs from '@/components/FeatureAutoAppliedLangs.svelte';
  import FeatureAutoAppliedSites from '@/components/FeatureAutoAppliedSites.svelte';
  import FeatureIcon from '@/components/FeatureIcon.svelte';
  import FeatureProvider from '@/components/FeatureProvider.svelte';
  import FeatureShortcut from '@/components/FeatureShortcut.svelte';
  import i18n from '@/lib/i18n';
  import { FEAT_ADAPTIVE_TRANSLATE } from '@/preset/constants';

  import { adaptiveTranslateNav as nav } from '../data';
  import Section from '../Section.svelte';

  import DisplayMode from './DisplayMode.svelte';
  import DisplayStyle from './DisplayStyle.svelte';
  import PageRange from './PageRange.svelte';
  import TriggerOnHover from './TriggerOnHover.svelte';
</script>

<Section title={nav.title} subtitle={nav.subtitle} description={nav.description}>
  <!-- adaptive translate icon -->
  <FeatureIcon
    title={i18n('adaptive_translate_icon', {
      defaultValue: 'Adaptive translate icon'
    })}
    field={FEAT_ADAPTIVE_TRANSLATE} />

  <FeatureShortcut
    title={i18n('adaptive_translate_shortcut', { defaultValue: 'Adaptive translate shortcut' })}
    field={FEAT_ADAPTIVE_TRANSLATE} />

  <!-- adaptive translate api provider -->
  <FeatureProvider
    field={FEAT_ADAPTIVE_TRANSLATE}
    title={i18n('adaptive_translate_provider', { defaultValue: 'Adaptive translate provider' })}
    description={i18n('adaptive_translate_provider_description', {
      defaultValue:
        'Choose from a variety of API providers to power your adaptive translate experience.'
    })}
    showFreeProviders={true} />

  <!-- enable auto-translate -->
  <!-- <SectionRow
    title={i18n('enable_auto_translate', {
      defaultValue: 'Enable auto-translate feature'
    })}>
    <Toggle
      slot="controls"
      class="ms-auto"
      bind:checked={$config.quickTranslate.autoAppliedEnabled}
      size="small"
      classes={{
        span: 'me-0 cursor-pointer bg-slate-200 dark:bg-slate-600'
      }} />
  </SectionRow> -->

  <!-- always auto-translated sites -->
  <FeatureAutoAppliedSites
    field={FEAT_ADAPTIVE_TRANSLATE}
    title={i18n('always_auto_translated_sites', { defaultValue: 'Always auto-translated sites' })}
    description={i18n('always_auto_translated_sites_description', {
      defaultValue:
        'When current site matches these domains, content will auto-translate to target language. This rule has higher priority than language rules.'
    })} />

  <!-- always auto-translated language -->
  <FeatureAutoAppliedLangs
    field={FEAT_ADAPTIVE_TRANSLATE}
    title={i18n('always_auto_translated_langs', {
      defaultValue: 'Always auto-translate languages'
    })}
    description={i18n('always_auto_translated_langs_description', {
      defaultValue:
        'When page language is one of these languages, content auto-translates to target language. Site rules still take priority on conflicts.'
    })} />

  <!-- translate page range -->
  <PageRange />

  <!-- translate selection trigger -->
  <TriggerOnHover />

  <!-- translate display mode -->
  <DisplayMode />

  <!-- translation display style -->
  <DisplayStyle />
</Section>
