<script lang="ts">
  import { Toggle } from 'flowbite-svelte';

  import i18n from '@/lib/i18n';
  import SectionRow from '@/components/SectionRow.svelte';
  import FeatureIcon from '@/components/FeatureIcon.svelte';
  import FeatureProvider from '@/components/FeatureProvider.svelte';
  import FeatureAutoAppliedSites from '@/components/FeatureAutoAppliedSites.svelte';
  import FeatureAutoAppliedLang from '@/components/FeatureAutoAppliedLang.svelte';
  import FeatureShortcut from '@/components/FeatureShortcut.svelte';

  import Section from './Section.svelte';
  import { bilingualSubtitlesNav as nav } from './data';

  const field = 'bilingualSubtitles';
</script>

<Section title={nav.title} subtitle={nav.subtitle} description={nav.description}>
  <!-- icon -->
  <FeatureIcon
    title={i18n('bilingual_subtitles_icon', {
      defaultValue: 'Bilingual subtitles icon'
    })}
    {field} />

  <FeatureShortcut
    title={i18n('bilingual_subtitles_shortcut', { defaultValue: 'Bilingual subtitles shortcut' })}
    {field} />

  <!-- api provider -->
  <FeatureProvider
    {field}
    title={i18n('bilingual_subtitles_provider', { defaultValue: 'Bilingual subtitles provider' })}
    description={i18n('bilingual_subtitles_provider_description', {
      defaultValue: 'Choose from a variety of API providers to power your bilingual subtitles.'
    })}
    showFreeProviders={true} />

  <!-- always apply bilingual subtitles sites -->
  <FeatureAutoAppliedSites
    {field}
    title={i18n('always_apply_bilingual_subtitles_sites', {
      defaultValue: 'Always apply bilingual subtitles sites'
    })}
    description={i18n('always_apply_bilingual_subtitles_sites_description', {
      defaultValue:
        'When current site matches these domains, content will automatically apply bilingual subtitles to target language. This rule has higher priority than language rules.'
    })} />

  <!-- always apply bilingual subtitles language -->
  <FeatureAutoAppliedLang
    {field}
    title={i18n('always_apply_bilingual_subtitles_lang', {
      defaultValue: 'Always apply bilingual subtitles language'
    })}
    description={i18n('always_apply_bilingual_subtitles_lang_description', {
      defaultValue:
        'When page language is one of these languages, content will automatically apply bilingual subtitles to target language. Site rules still take priority on conflicts.'
    })} />
</Section>
