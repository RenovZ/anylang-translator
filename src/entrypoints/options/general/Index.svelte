<script lang="ts">
  import { Avatar, Button, Dropdown, DropdownItem, Toggle } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';

  import config from '@/lib/config';
  import lang from '@/lib/lang';
  import avatar from '@/lib/avatar';
  import i18n from '@/lib/i18n';
  import SectionRow from '@/components/SectionRow.svelte';

  import Section from '../Section.svelte';
  import { generalNav } from '../data';
</script>

<Section title={generalNav.title}>
  <!-- header buttons -->
  {#snippet headerActions()}
    <div class="text-primary-600 flex items-center gap-4 text-sm">
      <button type="button" onclick={() => config.reset()}>
        {i18n('reset_settings', { defaultValue: 'Reset settings' })}
      </button>
    </div>
  {/snippet}

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
        class="w-full justify-between rounded-xl border-none bg-slate-100 px-3 py-2 text-slate-900 shadow hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
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

  <!-- UI language -->
  <SectionRow
    title={i18n('ui_language', { defaultValue: 'UI language' })}
    description={i18n('ui_language_hint', {
      defaultValue:
        'UI language affects panel display language and does not change translation target language'
    })}>
    <div slot="controls">
      <Button
        class="w-full justify-between rounded-xl border-none bg-slate-100 px-3 py-2 text-slate-900 shadow hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
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
</Section>
