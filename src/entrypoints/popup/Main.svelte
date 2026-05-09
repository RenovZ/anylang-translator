<script lang="ts">
  import {
    Avatar,
    Button,
    Dropdown,
    DropdownItem,
    GradientButton,
    Toggle,
    Tooltip
  } from 'flowbite-svelte';
  import {
    ArrowRightOutline,
    ChevronDownOutline,
    CogOutline,
    LanguageOutline
  } from 'flowbite-svelte-icons';
  import { browser } from 'wxt/browser';

  import '@/assets/app.css';

  import avatar from '@/lib/avatar';
  import config from '@/lib/config';
  import { languageOptions } from '@/lib/data';
  import i18n from '@/lib/i18n';
  import lang from '@/lib/lang';
  import logger, { formatError } from '@/lib/logger';
  import { sendMessage } from '@/lib/protocol';
  import shortcut from '@/lib/shortcut';
  import LocalIcon from '@/components/LocalIcon.svelte';
  import {
    CMD_QUICK_TRANSLATE,
    FEAT_BILINGUAL_SUBTITLES,
    FEAT_CONTEXT_TRANSLATE,
    FEAT_INSTANT_LOOKUP,
    FEAT_INTELLIGENT_INPUT,
    FEAT_PANORAMA_READING,
    FEAT_QUICK_TRANSLATE,
    FEAT_WRITING_COPILOT
  } from '@/preset/constants';

  import { moreItems, quickActions, selectionTranslateToggle } from './data';
  import Feature from './Feature.svelte';

  let currentSite = $state('');
  let isTranslating = $state(false);

  $effect(() => {
    shortcut.syncFromBrowser();
    browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      currentSite = tab.url ? new URL(tab.url).origin : window.location.origin;
    });
  });

  // // Trigger quick translate on active tab
  // async function triggerQuickTranslate() {
  //   try {
  //     isTranslating = true;
  //     const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  //     const activeTab = tabs[0];

  //     if (!activeTab?.id) {
  //       logger.error('No active tab found');
  //       return;
  //     }

  //     // Check if we can inject into this tab
  //     if (
  //       activeTab.url?.startsWith('chrome://') ||
  //       activeTab.url?.startsWith('edge://') ||
  //       activeTab.url?.startsWith('about:') ||
  //       activeTab.url?.startsWith('moz-extension://')
  //     ) {
  //       logger.error('Cannot translate browser internal pages');
  //       return;
  //     }

  //     await browser.tabs.sendMessage(activeTab.id, {
  //       type: MSG_QUICK_TRANSLATE,
  //       action: CMD_QUICK_TRANSLATE
  //     });

  //     // Close popup after triggering
  //     window.close();
  //   } catch (error) {
  //     logger.error('Failed to trigger quick translate', {
  //       error: formatError(error)
  //     });
  //     // Try to inject content script first
  //     try {
  //       const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  //       const activeTab = tabs[0];
  //       if (activeTab?.id) {
  //         await browser.scripting.executeScript({
  //           target: { tabId: activeTab.id },
  //           files: ['/content-scripts/content.js']
  //         });
  //         await browser.tabs.sendMessage(activeTab.id, {
  //           type: MSG_QUICK_TRANSLATE,
  //           action: CMD_QUICK_TRANSLATE
  //         });
  //         window.close();
  //       }
  //     } catch (injectError) {
  //       logger.error('Failed to inject content script', {
  //         error: injectError instanceof Error ? injectError.message : String(injectError)
  //       });
  //     }
  //   } finally {
  //     isTranslating = false;
  //   }
  // }
</script>

<main class="min-w-80 bg-slate-100 text-sm dark:bg-slate-950/80">
  <section class="space-y-6 rounded-b-2xl bg-white p-4 dark:bg-slate-900">
    <!-- header -->
    <header class="flex items-center justify-between">
      <div class="flex items-center justify-between gap-2">
        <Avatar
          class="flex h-6 w-6 items-center justify-center"
          src={avatar.dicebear('RenovZ', {
            chars: 1,
            backgroundType: ['gradientLinear']
          })}
          size="xs" />
        <span class="text-xs">{i18n('guest', { defaultValue: 'Guest' })}</span>
        <GradientButton color="purpleToBlue" pill class="px-2 py-1 text-xs">
          <span>⚡</span>
          <span>{i18n('upgrade', { defaultValue: 'Upgrade' })}</span>
        </GradientButton>
      </div>
    </header>

    {#snippet languageDropdown(position: 'source' | 'target')}
      {@const currentLang = position === 'source' ? $config.sourceLanguage : $config.targetLanguage}
      <Button
        class="rounded-xl border-none bg-slate-100 p-1 text-slate-900 shadow hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
        <div class="flex flex-col text-left">
          <span class="line-clamp-1 font-medium">
            {currentLang
              ? lang.getLangName(currentLang)
              : i18n('auto_detect', { defaultValue: 'Auto Detect' })}
          </span>
          <span class="line-clamp-1 text-xs text-slate-400">
            {languageOptions[position === 'source' ? 0 : 1]}
          </span>
          <Tooltip class="text-xs">{languageOptions[position === 'source' ? 0 : 1]}</Tooltip>
        </div>
        <!-- <ChevronDownOutline class="h-5 w-5 text-slate-400" /> -->
        <LocalIcon icon="tabler:chevron-down" class="h-4 w-4" />
      </Button>
      <Dropdown
        simple
        placement={position === 'source' ? 'bottom-start' : 'bottom-end'}
        class="max-h-80 overflow-y-auto shadow-md">
        <DropdownItem
          onclick={() => {
            if (position === 'source') {
              $config.sourceLanguage = undefined;
            } else {
              $config.targetLanguage = 'en';
            }
          }}>
          {i18n('auto_detect', { defaultValue: 'Auto Detect' })}
        </DropdownItem>
        {#each Object.entries(lang.getUILangCodeMap()) as [langCode, langName] (langCode)}
          <DropdownItem
            onclick={() =>
              ($config[position === 'source' ? 'sourceLanguage' : 'targetLanguage'] = langCode)}>
            {langName}
          </DropdownItem>
        {/each}
      </Dropdown>
    {/snippet}

    <!-- languages -->
    <section class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      {@render languageDropdown('source')}
      <!-- <ArrowRightOutline class="h-6 w-6 text-slate-400" /> -->
      <LocalIcon icon="tabler:arrow-right" class="h-5 w-5" />
      {@render languageDropdown('target')}
    </section>

    <!-- adaptive-translate feature -->
    <section class="space-y-4">
      <Feature
        field={FEAT_QUICK_TRANSLATE}
        showFreeProviders={true}
        classes={{
          button:
            'rounded-lg border-none bg-slate-100 p-1 text-slate-900 shadow hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600'
        }}>
        {#snippet title()}
          <Button
            color="secondary"
            size="xs"
            class="flex items-center border-none px-1 py-1.5 font-medium shadow">
            <span>{i18n('quick_translate', { defaultValue: 'Quick Translate' })}</span>
            {#if $config.quickTranslate.shortcut?.length}
              <span>
                ({shortcut.formatForDisplay($config.quickTranslate.shortcut).join('')})
              </span>
            {/if}
          </Button>
        {/snippet}
      </Feature>
      <Feature
        field={FEAT_CONTEXT_TRANSLATE}
        classes={{
          button:
            'rounded-lg border-none bg-slate-100 p-1 text-slate-900 shadow hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600'
        }}>
        {#snippet title()}
          <Button size="xs" class="flex items-center border-none px-1 py-1.5 font-medium shadow">
            <span>{i18n('context_translate', { defaultValue: 'Context Translate' })}</span>
            {#if $config.contextTranslate.shortcut?.length}
              <span>
                ({shortcut.formatForDisplay($config.contextTranslate.shortcut).join('')})
              </span>
            {/if}
          </Button>
        {/snippet}
      </Feature>
      <div class="flex items-center justify-between gap-2">
        <span class="line-clamp-1 font-medium">
          {i18n('always_auto_translate_this_site', {
            defaultValue: 'Always auto-translate this site'
          })}
        </span>
        <Toggle
          checked={currentSite
            ? $config.quickTranslate.autoAppliedSites?.includes(currentSite)
            : false}
          onchange={() => {
            const { autoAppliedSites } = $config.quickTranslate;
            if (autoAppliedSites?.includes(currentSite)) {
              $config.quickTranslate.autoAppliedSites = autoAppliedSites.filter(
                (s) => s !== currentSite
              );
            } else {
              $config.quickTranslate.autoAppliedSites = [...(autoAppliedSites ?? []), currentSite];
            }
          }}
          size="small"
          classes={{
            span: 'cursor-pointer bg-slate-200 dark:bg-slate-600 m-0'
          }} />
      </div>
    </section>

    <!-- features -->
    <section class="rounded-xl bg-slate-100 shadow dark:bg-slate-700">
      <Feature
        classes={{ main: 'rounded-t-xl px-3 py-2 hover:bg-slate-200/70 hover:dark:bg-slate-600' }}
        title={i18n('instant_lookup', { defaultValue: 'Instant Lookup' })}
        field={FEAT_INSTANT_LOOKUP} />
      <Feature
        classes={{ main: 'px-3 py-2 hover:bg-slate-200/70 hover:dark:bg-slate-600' }}
        title={i18n('intelligent_input', { defaultValue: 'Intelligent Input' })}
        field={FEAT_INTELLIGENT_INPUT} />
      <Feature
        classes={{ main: 'px-3 py-2 hover:bg-slate-200/70 hover:dark:bg-slate-600' }}
        title={i18n('bilingual_subtitles', { defaultValue: 'Bilingual Subtitles' })}
        field={FEAT_BILINGUAL_SUBTITLES} />
      <Feature
        classes={{ main: 'px-3 py-2 hover:bg-slate-200/70 hover:dark:bg-slate-600' }}
        title={i18n('panorama_reading', { defaultValue: 'Panorama Reading' })}
        field={FEAT_PANORAMA_READING} />
      <Feature
        classes={{ main: 'rounded-b-xl px-3 py-2 hover:bg-slate-200/70 hover:dark:bg-slate-600' }}
        title={i18n('writing_copilot', { defaultValue: 'Writing Copilot' })}
        field={FEAT_WRITING_COPILOT} />
    </section>

    <!-- <section class="flex items-center gap-3">
      <Button
        pill
        class="bg-slate-100 p-2 hover:bg-slate-200/70 dark:bg-slate-700 hover:dark:bg-slate-600"
        title={i18n('page_translate', { defaultValue: 'Translate page' })}>
        <LanguageOutline class="text-primary-500 h-6 w-6 shrink-0" />
      </Button>
      <Button
        class="flex-1 rounded-xl text-base"
        onclick={triggerQuickTranslate}
        disabled={isTranslating}>
        {#if isTranslating}
          <span class="inline-flex items-center gap-2">
            <span
              class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            ></span>
            {i18n('translating', { defaultValue: 'Translating...' })}
          </span>
        {:else}
          {i18n('translate', { defaultValue: 'Translate' })}
          {#if $config.quickTranslate.shortcut?.length}
            <span class="ml-1 text-xs opacity-70">
              ({shortcut.formatForDisplay($config.quickTranslate.shortcut).join(' ')})
            </span>
          {/if}
        {/if}
      </Button>
    </section> -->

    <!--
    TODO:
    <section class="flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3">
        <span class="line-clamp-1 font-medium">
          {i18n('enable_auto_translate', {
            defaultValue: 'Enable auto-translate feature'
          })}
        </span>
        <Toggle
          bind:checked={$config.autoTranslateEnabled}
          size="small"
          classes={{
            span: 'me-0 cursor-pointer bg-slate-200 dark:bg-slate-600'
          }} />
      </div>
      <div class="flex items-center justify-between gap-3">
        <span class="line-clamp-1 font-medium">
          {i18n('always_auto_translate_this_site', {
            defaultValue: 'Always auto-translate this site'
          })}
        </span>
        <Toggle
          checked={currentSite ? $config.alwaysAutoTranslatedSites.includes(currentSite) : false}
          onchange={() => {
            const { alwaysAutoTranslatedSites } = $config;
            if (alwaysAutoTranslatedSites.includes(currentSite)) {
              $config.alwaysAutoTranslatedSites = alwaysAutoTranslatedSites.filter(
                (s) => s !== currentSite
              );
            } else {
              $config.alwaysAutoTranslatedSites = [...alwaysAutoTranslatedSites, currentSite];
            }
          }}
          size="small"
          classes={{
            span: 'me-0 cursor-pointer bg-slate-200 dark:bg-slate-600'
          }} />
      </div>
      <div class="flex items-center justify-between gap-3">
        <button type="button" class="flex min-w-0 flex-nowrap items-center text-left">
          <span class="line-clamp-1 font-medium">
            <span>{selectionTranslateToggle.label}:</span>
            <span>
              {selectionTranslateToggle.options?.find(
                (item) => item.value === $config.selectionTriggerTranslate
              )?.label || selectionTranslateToggle.options![0].label}
            </span>
          </span>
          {#if selectionTranslateToggle.options}
            <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
          {/if}
        </button>
        {#if selectionTranslateToggle.options}
          <Dropdown simple placement="bottom-end" class="shadow-md">
            {#each selectionTranslateToggle.options as option (option.value)}
              <DropdownItem
                onclick={() =>
                  ($config.selectionTriggerTranslate = option.value as SelectionTriggerValue)}
                >{option.label}</DropdownItem>
            {/each}
          </Dropdown>
        {/if}
        <Toggle
          bind:checked={$config.selectionTranslateEnabled}
          size="small"
          classes={{
            span: 'me-0 cursor-pointer bg-slate-200 dark:bg-slate-600'
          }}
          aria-label={selectionTranslateToggle.label} />
      </div>
    </section>
    -->

    <!--
    <section class="grid grid-cols-3 gap-3 text-sm">
      {#each quickActions as action (action.label)}
        <Button
          class="flex-col justify-between gap-1 rounded-xl bg-slate-100 px-1 py-2 text-slate-900 hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
          <span>{action.icon}</span>
          <span class="text-sm">{action.label}</span>
        </Button>
        {#if action.description}
          <Tooltip class="text-xs">{action.description}</Tooltip>
        {/if}
      {/each}
    </section>
    -->
  </section>

  <footer class="flex items-center justify-between p-2 text-sm">
    <button
      type="button"
      class="flex items-center gap-1"
      onclick={() => sendMessage('openOptionsPage')}>
      <CogOutline class="h-4 w-4 shrink-0" />
      <span>{i18n('settings', { defaultValue: 'Settings' })}</span>
    </button>
    <div class="text-slate-400">v0.0.1</div>
    <div>
      <button type="button" class="flex min-w-0 items-center">
        <span class="font-medium">{i18n('more', { defaultValue: 'More' })}</span>
        <ChevronDownOutline class="h-6 w-6 text-slate-400" />
      </button>
      <Dropdown simple placement="bottom-end" class="max-h-96 overflow-y-auto shadow-md">
        {#each moreItems as item (item.label)}
          <DropdownItem>
            <span class="flex items-center gap-2">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </span>
          </DropdownItem>
        {/each}
      </Dropdown>
    </div>
  </footer>
</main>
