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
  import { ChevronDownOutline, CogOutline } from 'flowbite-svelte-icons';
  import { onMount } from 'svelte';
  import { browser } from 'wxt/browser';

  import '@/assets/app.css';

  import LocalIcon from '@/components/LocalIcon.svelte';
  import TranslateModeDropdown, {
    translateModeOptions
  } from '@/components/TranslateModeDropdown.svelte';
  import analyticsManager from '@/lib/analytics';
  import avatar from '@/lib/avatar';
  import config from '@/lib/config';
  import { languageOptions } from '@/lib/data';
  import i18n from '@/lib/i18n';
  import lang from '@/lib/lang';
  import logger, { formatError } from '@/lib/logger';
  import { sendMessage } from '@/lib/protocol';
  import { adaptiveTranslateSession } from '@/lib/session';
  import shortcut from '@/lib/shortcut';
  import { ANALYTICS_FEATURE, ANALYTICS_SURFACE } from '@/preset/analytics';
  import {
    FEAT_ADAPTIVE_TRANSLATE,
    FEAT_BILINGUAL_SUBTITLES,
    FEAT_INSTANT_LOOKUP,
    FEAT_INTELLIGENT_INPUT,
    FEAT_PANORAMA_READING,
    FEAT_WRITING_COPILOT
  } from '@/preset/constants';

  import { moreItems, quickActions, selectionTranslateToggle } from './data';
  import Feature from './Feature.svelte';

  let currentSite = $state('');
  let isTranslating = $state(false);
  let currentTabId = $state<number | null>(null);

  $effect(() => {
    if (currentTabId === null) return;
    return adaptiveTranslateSession.subscribe(currentTabId, (state) => {
      isTranslating = state.enabled;
    });
  });

  onMount(async () => {
    await shortcut.main();
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    currentSite = tab?.url ? new URL(tab.url).origin : window.location.origin;
    const currentTabId = tab?.id;
    if (currentTabId) {
      isTranslating = await sendMessage('getAdaptiveTranslateState', { tabId: currentTabId });
    }
  });

  const toggleTranslate = async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    const tabId = tab?.id;
    if (!tabId) {
      logger.error('No active tab found');
      return;
    }

    isTranslating = !isTranslating;
    logger.debug({ isTranslating, tabId, tab });
    void sendMessage('tryAdaptiveTranslate', {
      tabId,
      enabled: isTranslating,
      analyticsContext: isTranslating
        ? analyticsManager.createFeatureUsageContext(
            ANALYTICS_FEATURE[FEAT_ADAPTIVE_TRANSLATE],
            ANALYTICS_SURFACE.POPUP
          )
        : undefined
    });
  };
</script>

<main class="space-y-6 rounded-b-2xl bg-white p-4 dark:bg-slate-900">
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
    {@const currentLang = position === 'source' ? $config.sourceLangCode : $config.targetLangCode}
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
            $config.sourceLangCode = undefined;
          } else {
            $config.targetLangCode = 'en';
          }
        }}>
        {i18n('auto_detect', { defaultValue: 'Auto Detect' })}
      </DropdownItem>
      {#each Object.entries(lang.getLangCodeMap()) as [langCode, langName] (langCode)}
        <DropdownItem
          onclick={() =>
            ($config[position === 'source' ? 'sourceLangCode' : 'targetLangCode'] = langCode)}>
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
      field={FEAT_ADAPTIVE_TRANSLATE}
      showFreeProviders={true}
      showShortcut={false}
      classes={{
        main: 'grid-cols-[96px_1fr]',
        button:
          'rounded-lg border-none bg-slate-100 px-1 py-1.5 text-slate-900 shadow hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600'
      }}
      title={i18n('api_provider', { defaultValue: 'API Provider' })} />
    <Feature
      field={FEAT_ADAPTIVE_TRANSLATE}
      showFreeProviders={true}
      showShortcut={false}
      classes={{
        main: 'grid-cols-[96px_1fr]'
      }}
      title={i18n('translate_mode', { defaultValue: 'Translate Mode' })}>
      <TranslateModeDropdown>
        <button
          type="button"
          class="flex items-center rounded-lg border-none bg-slate-100 px-1 py-1.5 font-semibold text-slate-900 shadow hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
          <div class="flex flex-1 items-center gap-1">
            {translateModeOptions.find(
              (item) => item.value === $config.adaptiveTranslate.translate.mode
            )?.label ??
              i18n('unsupported_translate_mode', { defaultValue: 'Unsupported Translate Mode' })}
          </div>
          <LocalIcon icon="tabler:chevron-down" class="h-4 w-4" />
        </button>
      </TranslateModeDropdown>
    </Feature>
    <div class="flex items-center justify-between gap-2">
      <span class="line-clamp-1 font-medium">
        {i18n('always_auto_translate_this_site', {
          defaultValue: 'Always auto-translate this site'
        })}
      </span>
      <Toggle
        checked={currentSite
          ? $config.adaptiveTranslate.autoAppliedSites?.includes(currentSite)
          : false}
        onchange={() => {
          const { autoAppliedSites } = $config.adaptiveTranslate;
          if (autoAppliedSites?.includes(currentSite)) {
            $config.adaptiveTranslate.autoAppliedSites = autoAppliedSites.filter(
              (s) => s !== currentSite
            );
          } else {
            $config.adaptiveTranslate.autoAppliedSites = [...(autoAppliedSites ?? []), currentSite];
          }
        }}
        size="small"
        classes={{
          span: 'cursor-pointer bg-slate-200 dark:bg-slate-600 m-0'
        }} />
    </div>
  </section>

  <Button onclick={toggleTranslate} class="flex w-full items-center border-none font-medium shadow">
    {#if isTranslating}
      <span>{i18n('show_original', { defaultValue: 'Show Original' })}</span>
    {:else}
      <span>{i18n('adaptive_translate', { defaultValue: 'Adaptive Translate' })}</span>
      {#if $config.adaptiveTranslate.shortcut?.length}
        <span>
          ({shortcut.formatForDisplay($config.adaptiveTranslate.shortcut).join('')})
        </span>
      {/if}
    {/if}
  </Button>

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
</main>

<footer class="flex items-center justify-between p-2 text-sm">
  <button
    type="button"
    class="flex items-center gap-1"
    onclick={async () => sendMessage('openOptionsPage')}>
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
