<script lang="ts">
  import { A, Button, Dropdown, DropdownItem, Input, Toggle } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';

  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import ProviderIcon from '@/components/ProviderIcon.svelte';
  import ProvidersDropdown from '@/components/ProvidersDropdown.svelte';
  import FeatureIcon from '@/components/FeatureIcon.svelte';
  import SectionRow from '@/components/SectionRow.svelte';

  import Section from '../Section.svelte';
  import { adaptiveTranslateNav as nav } from '../data';

  import AutoTranslatedSites from './AutoTranslatedSites.svelte';
  import AutoTranslatedLang from './AutoTranslatedLang.svelte';
  import DisplayStyle from './DisplayStyle.svelte';
  import Provider from './Provider.svelte';
</script>

<Section title={nav.title} subtitle={nav.subtitle} description={nav.description}>
  <!-- quick translate icon -->
  <FeatureIcon
    title={i18n('quick_translate_icon', {
      defaultValue: 'Quick translate icon'
    })}
    field="quickTranslateIcon" />

  <!-- quick translate api provider -->
  <Provider
    field="quickTranslateProvider"
    title={i18n('quick_translate_provider', { defaultValue: 'Quick translate provider' })}
    description={i18n('quick_translate_provider_description', {
      defaultValue:
        'Fast and lightweight translation for everyday use. Prioritizes speed over deep contextual understanding, so nuance and precision may be limited in complex content.'
    })} />

  <!-- context translate icon -->
  <FeatureIcon
    title={i18n('context_translate_icon', {
      defaultValue: 'Context translate icon'
    })}
    field="contextTranslateIcon" />

  <!-- context translate api provider -->
  <Provider
    field="contextTranslateProvider"
    title={i18n('context_translate_provider', { defaultValue: 'Context translate provider' })}
    description={i18n('context_translate_provider_description', {
      defaultValue:
        'Go beyond literal conversion with AI-powered translation shaped by context, nuance, and intent.'
    })} />

  <!-- enable auto-translate -->
  <SectionRow
    title={i18n('enable_auto_translate', {
      defaultValue: 'Enable auto-translate feature'
    })}>
    <Toggle
      slot="controls"
      class="ms-auto"
      bind:checked={$config.autoTranslateEnabled}
      size="small"
      classes={{
        span: 'me-0 cursor-pointer bg-slate-200 dark:bg-slate-600'
      }} />
  </SectionRow>

  <!-- always auto-translated sites -->
  <AutoTranslatedSites
    title={i18n('always_auto_translated_sites', { defaultValue: 'Always auto-translated sites' })}
    description={i18n('always_auto_translated_sites_hint', {
      defaultValue:
        'When current site matches these domains, content will auto-translate to target language. This rule has higher priority than language rules.'
    })} />

  <!-- always auto-translated language -->
  <AutoTranslatedLang
    title={i18n('always_auto_translated_lang', { defaultValue: 'Always auto-translate language' })}
    description={i18n('always_auto_translated_lang_hint', {
      defaultValue:
        'When page language is one of these languages, content auto-translates to target language. Site rules still take priority on conflicts.'
    })} />

  <!-- display mode -->
  <SectionRow
    title={i18n('display_mode', {
      defaultValue: 'Display mode'
    })}
    description={i18n('display_mode_description', {
      defaultValue: 'Choose display mode after translation'
    })}>
    <div slot="controls">
      <Button
        class="w-full justify-between rounded-xl border-none bg-slate-100 px-3 py-2 text-slate-900 shadow hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
        <span>{$config.translationMode}</span>
        <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
      </Button>
      <Dropdown simple placement="bottom-end" class="max-h-80 overflow-y-auto shadow-md">
        <DropdownItem onclick={() => ($config.translationMode = 'bilingual')}>
          {i18n('display_mode_bilingual_mode', { defaultValue: 'Bilingual Mode' })}
        </DropdownItem>
        <DropdownItem onclick={() => ($config.translationMode = 'translation_only')}>
          {i18n('display_mode_translation_only', {
            defaultValue: 'Translation only'
          })}
        </DropdownItem>
      </Dropdown>
    </div>
  </SectionRow>

  <!-- translation display style -->
  <DisplayStyle />
</Section>
