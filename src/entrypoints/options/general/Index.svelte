<script lang="ts">
  import { Avatar, Button, Dropdown, DropdownItem, Toggle } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';

  import config from '@/lib/config';
  import lang from '@/lib/lang';
  import avatar from '@/lib/avatar';
  import i18n from '@/lib/i18n';
  import ProvidersDropdown from '@/components/ProvidersDropdown.svelte';
  import ProviderIcon from '@/components/ProviderIcon.svelte';

  import Section from '../Section.svelte';
  import SectionRow from '../SectionRow.svelte';
  import AutoTranslatedSites from './AutoTranslatedSites.svelte';
  import AutoTranslatedLang from './AutoTranslatedLang.svelte';
  import TranslationDisplayStyle from './TranslationDisplayStyle.svelte';
</script>

<Section id="general" title={i18n('general_settings', { defaultValue: 'General settings' })}>
  <!-- header buttons -->
  <svelte:fragment slot="header-actions">
    <div class="text-primary-600 flex items-center gap-4 text-sm">
      <button type="button" onclick={() => config.reset()}>
        {i18n('reset_settings', { defaultValue: 'Reset settings' })}
      </button>
    </div>
  </svelte:fragment>

  <!-- login state -->
  <div
    class="flex items-center justify-between rounded-2xl bg-gray-50 p-6 shadow-inner dark:bg-gray-700">
    <div class="flex items-center gap-4">
      <Avatar
        class="h-14 w-14"
        src={avatar.anylang({
          chars: 1,
          backgroundType: ['gradientLinear']
        })}
        size="lg" />
      <Button class="font-medium">
        {i18n('login', { defaultValue: 'Login' })}
      </Button>
    </div>
    <button type="button" class="text-primary-600 text-sm hover:underline">
      {i18n('login_hint', {
        defaultValue: 'Unlock membership after login'
      })}
    </button>
  </div>

  <!-- target language -->
  <SectionRow
    title={i18n('target_language', { defaultValue: 'Target language' })}
    description={i18n('target_language_hint', {
      defaultValue: 'Set the language you want content translated into'
    })}>
    <div slot="controls">
      <Button
        class="w-full justify-between rounded-xl bg-slate-100 px-3 py-2 text-slate-900 hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
        <span>
          {lang.codeToLang($config.targetLanguage) ??
            i18n('auto_detect', { defaultValue: 'Auto Detect' })}
        </span>
        <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
      </Button>
      <Dropdown simple placement="bottom-end" class="max-h-80 overflow-y-auto shadow-md">
        {#each Object.entries(lang.all()) as [langCode, langName] (langCode)}
          <DropdownItem onclick={() => ($config.targetLanguage = langCode)}>
            {langName}
          </DropdownItem>
        {/each}
      </Dropdown>
    </div>
  </SectionRow>

  <!-- translation provider -->
  <SectionRow
    title={i18n('translation_provider', { defaultValue: 'Translation provider' })}
    description={i18n('translation_provider_hint', {
      defaultValue: 'Choose a translation provider'
    })}>
    <div class="flex w-full flex-col items-end space-y-3" slot="controls">
      <Button
        class="w-full justify-between rounded-xl bg-slate-100 px-3 py-2 text-slate-900 hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
        <div class="flex items-center gap-2">
          <ProviderIcon
            provider={$config.pageTranslationProvider}
            avatarClass="w-4 h-4"
            imgClass="w-4 h-4" />
          <span>
            {$config.pageTranslationProvider.name}
            {#if $config.pageTranslationProvider.type !== 'free' && $config.pageTranslationProvider.model}
              ({$config.pageTranslationProvider.model})
            {/if}
          </span>
        </div>
        <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
      </Button>
      <ProvidersDropdown />
      <button class="text-primary-600 w-fit text-sm">
        {i18n('provider_test', { defaultValue: 'Test this provider' })}
      </button>
    </div>
  </SectionRow>

  <!-- UI language -->
  <SectionRow
    title={i18n('ui_language', { defaultValue: 'UI language' })}
    description={i18n('ui_language_hint', {
      defaultValue:
        'UI language affects panel display language and does not change translation target language'
    })}>
    <div slot="controls">
      <Button
        class="w-full justify-between rounded-xl bg-slate-100 px-3 py-2 text-slate-900 hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
        <span>
          {lang.codeToLang($config.uiLanguage) ??
            i18n('default_language', { defaultValue: 'Default Language' })}
        </span>
        <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
      </Button>
      <Dropdown simple placement="bottom-end" class="max-h-80 overflow-y-auto shadow-md">
        {#each Object.entries(lang.all()) as [langCode, langName] (langCode)}
          <DropdownItem onclick={() => ($config.uiLanguage = langCode)}>
            {langName}
          </DropdownItem>
        {/each}
      </Dropdown>
    </div>
  </SectionRow>

  <!-- translation mode -->
  <SectionRow
    title={i18n('translation_mode', {
      defaultValue: 'Translation mode'
    })}
    description={i18n('translation_mode_hint', {
      defaultValue: 'Choose display mode after translation: bilingual or translation-only'
    })}>
    <div slot="controls">
      <Button
        class="w-full justify-between rounded-xl bg-slate-100 px-3 py-2 text-slate-900 hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
        <span>{$config.translationMode}</span>
        <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
      </Button>
      <Dropdown simple placement="bottom-end" class="max-h-80 overflow-y-auto shadow-md">
        <DropdownItem onclick={() => ($config.translationMode = 'bilingual')}>
          {i18n('translation_mode_bilingual', { defaultValue: 'Bilingual' })}
        </DropdownItem>
        <DropdownItem onclick={() => ($config.translationMode = 'translation_only')}>
          {i18n('translation_mode_translation_only', {
            defaultValue: 'Translation only'
          })}
        </DropdownItem>
      </Dropdown>
    </div>
  </SectionRow>

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

  <!-- translation display style -->
  <TranslationDisplayStyle />
</Section>
