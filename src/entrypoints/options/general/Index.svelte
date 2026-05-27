<script lang="ts">
  import { Avatar, Badge, Button, Radio } from 'flowbite-svelte';

  import LangDropdown from '@/components/LangDropdown.svelte';
  import Provider from '@/components/Provider.svelte';
  import SectionRow from '@/components/SectionRow.svelte';
  import avatar from '@/lib/avatar';
  import config from '@/lib/config';
  import i18n from '@/lib/i18n';

  import { generalNav } from '../data';
  import Section from '../Section.svelte';
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
    <LangDropdown langCodeType="target" bind:langCode={$config.targetLangCode} slot="controls" />
  </SectionRow>

  <!-- UI language -->
  <SectionRow
    title={i18n('ui_language', { defaultValue: 'UI language' })}
    description={i18n('ui_language_hint', {
      defaultValue:
        'UI language affects panel display language and does not change translation target language'
    })}>
    <LangDropdown langCodeType="ui" bind:langCode={$config.uiLangCode} slot="controls" />
  </SectionRow>

  <!-- language detection -->
  <SectionRow
    title={i18n('language_detection', { defaultValue: 'Language detection' })}
    description={i18n('language_detection_description', {
      defaultValue: 'Global language detection setting applied to all features'
    })}>
    <div slot="controls" class="flex w-full flex-col items-end space-y-3">
      <div class="flex flex-col gap-3">
        <Radio bind:group={$config.langDetection.mode} value="basic">
          <div class="flex flex-col">
            <span class="font-medium">{i18n('basic', { defaultValue: 'Basic' })}</span>
            <span class="text-xs text-slate-500">
              {i18n('basic_detection_desc', { defaultValue: 'Fast heuristic detection' })}
            </span>
          </div>
        </Radio>
        <Radio bind:group={$config.langDetection.mode} value="llm">
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <span class="font-medium">{i18n('llm', { defaultValue: 'LLM' })}</span>
              <Badge size="small">
                {i18n('recommended', { defaultValue: 'Recommended' })}
              </Badge>
            </div>
            <span class="text-xs text-slate-500">
              {i18n('llm_detection_desc', { defaultValue: 'Higher accuracy AI detection' })}
            </span>
          </div>
        </Radio>
      </div>
      {#if $config.langDetection.mode === 'llm'}
        <Provider field="langDetection" showFreeProviders={false} />
      {/if}
    </div>
  </SectionRow>
</Section>
