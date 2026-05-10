<script lang="ts">
  import FeatureAutoAppliedLangs from '@/components/FeatureAutoAppliedLangs.svelte';
  import FeatureAutoAppliedSites from '@/components/FeatureAutoAppliedSites.svelte';
  import FeatureIcon from '@/components/FeatureIcon.svelte';
  import FeatureProvider from '@/components/FeatureProvider.svelte';
  import FeatureShortcut from '@/components/FeatureShortcut.svelte';
  import i18n from '@/lib/i18n';
  import { FEAT_CONTEXT_TRANSLATE, FEAT_QUICK_TRANSLATE } from '@/preset/constants';

  import { adaptiveTranslateNav as nav } from '../data';
  import Section from '../Section.svelte';

  import DisplayMode from './DisplayMode.svelte';
  import DisplayStyle from './DisplayStyle.svelte';
  import PageRange from './PageRange.svelte';
  import TriggerOnHover from './TriggerOnHover.svelte';
</script>

<Section title={nav.title} subtitle={nav.subtitle} description={nav.description}>
  <!-- quick translate icon -->
  <FeatureIcon
    title={i18n('quick_translate_icon', {
      defaultValue: 'Quick translate icon'
    })}
    field={FEAT_QUICK_TRANSLATE} />

  <FeatureShortcut
    title={i18n('quick_translate_shortcut', { defaultValue: 'Quick translate shortcut' })}
    field={FEAT_QUICK_TRANSLATE} />

  <!-- quick translate api provider -->
  <FeatureProvider
    field={FEAT_QUICK_TRANSLATE}
    title={i18n('quick_translate_provider', { defaultValue: 'Quick translate provider' })}
    description={i18n('quick_translate_provider_description', {
      defaultValue:
        'Fast and lightweight translation for everyday use. Prioritizes speed over deep contextual understanding, so nuance and precision may be limited in complex content.'
    })}
    showFreeProviders={true} />

  <!-- context translate icon -->
  <FeatureIcon
    title={i18n('context_translate_icon', {
      defaultValue: 'Context translate icon'
    })}
    field={FEAT_CONTEXT_TRANSLATE} />

  <FeatureShortcut
    title={i18n('context_translate_shortcut', { defaultValue: 'Context translate shortcut' })}
    field={FEAT_CONTEXT_TRANSLATE} />

  <!-- context translate api provider -->
  <FeatureProvider
    field={FEAT_CONTEXT_TRANSLATE}
    title={i18n('context_translate_provider', { defaultValue: 'Context translate provider' })}
    description={i18n('context_translate_provider_description', {
      defaultValue:
        'Go beyond literal conversion with AI-powered translation shaped by context, nuance, and intent.'
    })} />

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
    field={FEAT_QUICK_TRANSLATE}
    title={i18n('always_auto_translated_sites', { defaultValue: 'Always auto-translated sites' })}
    description={i18n('always_auto_translated_sites_description', {
      defaultValue:
        'When current site matches these domains, content will auto-translate to target language. This rule has higher priority than language rules.'
    })} />

  <!-- always auto-translated language -->
  <FeatureAutoAppliedLangs
    field={FEAT_QUICK_TRANSLATE}
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
