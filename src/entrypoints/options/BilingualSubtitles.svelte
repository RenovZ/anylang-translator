<script lang="ts">
  import FeatureIcon from '@/components/FeatureIcon.svelte';
  import FeatureProvider from '@/components/FeatureProvider.svelte';
  import FeatureShortcut from '@/components/FeatureShortcut.svelte';
  import XLangs from '@/components/XLangs.svelte';
  import XSites from '@/components/XSites.svelte';
  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import { FEAT_BILINGUAL_SUBTITLES } from '@/preset/feature';

  import { bilingualSubtitlesNav as nav } from './data';
  import Section from './Section.svelte';

  const field = FEAT_BILINGUAL_SUBTITLES;
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
  <XSites
    bind:sites={$config[field].autoEnabledSites}
    title={i18n('bilingual_subtitles_auto_enabled_sites', {
      defaultValue: 'Auto-enabled sites'
    })}
    description={i18n('bilingual_subtitles_auto_enabled_sites_description', {
      defaultValue:
        'When visiting these sites, bilingual subtitles will be automatically enabled. Site rules take priority over language rules.'
    })} />

  <!-- always apply bilingual subtitles language -->
  <XLangs
    bind:langs={$config[field].autoEnabledLangs}
    title={i18n('bilingual_subtitles_auto_enabled_langs', {
      defaultValue: 'Auto-enabled languages'
    })}
    description={i18n('bilingual_subtitles_auto_enabled_langs_description', {
      defaultValue:
        'When the page language matches one of these, bilingual subtitles will be automatically enabled. Site rules take priority on conflicts.'
    })} />
</Section>
