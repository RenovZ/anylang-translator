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

  import TranslateModes, { translateModeOptions } from '@/components/AdaptiveTranslateModes.svelte';
  import DisplayStyle from '@/components/DisplayStyle.svelte';
  import LocalIcon from '@/components/LocalIcon.svelte';
  import { APP_VERSION } from '@/lib/app';
  import avatar from '@/lib/avatar';
  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import lang from '@/lib/lang';
  import logger from '@/lib/logger';
  import { sendMessage } from '@/lib/protocol';
  import { adaptiveTranslateSession } from '@/lib/session';
  import shortcut from '@/lib/shortcut';
  import { FEAT_ADAPTIVE_TRANSLATE, FEAT_INSTANT_LOOKUP } from '@/preset/feature';
  import { languageOptions } from '@/preset/lang';
  import { DISPLAY_STYLES, TRIGGER_ON_HOVER } from '@/preset/translate';

  import { moreItems } from './data';
  import Feature from './Feature.svelte';

  let currentHostname = $state('');
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
    currentHostname = tab?.url ? new URL(tab.url).hostname : window.location.hostname;
    const currentTabId = tab?.id;
    if (currentTabId) {
      isTranslating = await sendMessage('getAdaptiveTranslateState', { tabId: currentTabId });

      adaptiveTranslateSession.subscribe(currentTabId, (state) => {
        isTranslating = state.enabled;
      });
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
      enabled: isTranslating
    });
  };

  const adaptiveTranslateId = 'adaptive-translate';
</script>

<main class="space-y-4 rounded-b-2xl bg-white p-4 dark:bg-slate-900">
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
      class="rounded-xl border-none bg-slate-50 p-1 text-slate-900 shadow hover:bg-slate-100/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
      <div class="flex flex-col text-left">
        <span class="line-clamp-1 font-medium">
          {currentLang
            ? lang.getLangName(currentLang, $config.uiLangCode)
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
      class="max-h-80 overflow-y-auto bg-white/80 shadow-md backdrop-blur-xs dark:bg-slate-900/80">
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
      {#each Object.entries(lang.getLangCodeMap($config.uiLangCode)) as [langCode, langName] (langCode)}
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
  <section class="space-y-2">
    <Feature
      field={FEAT_ADAPTIVE_TRANSLATE}
      showFreeProviders={true}
      showShortcut={false}
      classes={{
        main: 'grid-cols-[auto_1fr]',
        button:
          'rounded-lg border-none bg-slate-50 px-1 py-1.5 text-slate-900 shadow hover:bg-slate-100/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600'
      }}
      title={i18n('api_provider', { defaultValue: 'API Provider' })} />
    <Feature
      field={FEAT_ADAPTIVE_TRANSLATE}
      showFreeProviders={true}
      showShortcut={false}
      classes={{
        main: 'grid-cols-[auto_1fr]'
      }}
      title={i18n('translate_mode', { defaultValue: 'Translate Mode' })}>
      <TranslateModes>
        <button
          type="button"
          class="flex items-center rounded-lg border-none bg-slate-50 px-1 py-1.5 font-semibold text-slate-900 shadow hover:bg-slate-100/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
          <div class="flex flex-1 items-center gap-1">
            {translateModeOptions.find(
              (item) => item.value === $config.adaptiveTranslate.translate.mode
            )?.label ??
              i18n('unsupported_translate_mode', { defaultValue: 'Unsupported Translate Mode' })}
          </div>
          <LocalIcon icon="tabler:chevron-down" class="h-4 w-4" />
        </button>
      </TranslateModes>
    </Feature>
    {#if $config.adaptiveTranslate.translate.mode === 'bilingual'}
      <Feature
        field={FEAT_ADAPTIVE_TRANSLATE}
        showFreeProviders={true}
        showShortcut={false}
        classes={{
          main: 'grid-cols-[auto_1fr]'
        }}
        title={i18n('display_style', { defaultValue: 'Display Style' })}>
        <div class="flex place-content-end items-center gap-2">
          <DisplayStyle classes={{ dropdown: 'max-h-48' }}>
            {#snippet button()}
              <button
                type="button"
                class="flex w-full items-center justify-between rounded-lg border-none bg-slate-50 px-1 py-1.5 font-semibold text-slate-900 shadow hover:bg-slate-100/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
                <span>
                  {DISPLAY_STYLES.find(
                    (item) =>
                      item.preset === $config.adaptiveTranslate.translate.displayStyle.preset
                  )?.label ?? DISPLAY_STYLES[0].label}
                </span>
                <LocalIcon icon="tabler:chevron-down" class="h-4 w-4" />
              </button>
            {/snippet}
          </DisplayStyle>
          {#if ['custom', 'css'].includes($config.adaptiveTranslate.translate.displayStyle.preset)}
            <button
              type="button"
              class="flex items-center justify-between rounded-lg border-none bg-slate-50 px-1 py-1.5 font-semibold text-slate-900 shadow hover:bg-slate-100/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600"
              onclick={() =>
                sendMessage('openPage', {
                  url: browser.runtime.getURL(`/options.html#${adaptiveTranslateId}`)
                })}>
              <LocalIcon icon="tabler:adjustments-cog" class="h-auto w-4" />
            </button>
            <Tooltip class="flex max-w-full text-xs">
              {i18n('open_display_style_settings', {
                defaultValue: 'Open display style settings'
              })}
            </Tooltip>
          {/if}
        </div>
      </Feature>
    {/if}
    <div class="flex items-center justify-between gap-4">
      <span
        class="line-clamp-1 font-medium aria-disabled:text-gray-400"
        aria-disabled={currentHostname
          ? !$config.adaptiveTranslate.autoTranslatedSites?.includes(currentHostname)
          : true}>
        {i18n('always_auto_translate_this_site', {
          defaultValue: 'Always auto-translate this site'
        })}
      </span>
      <Toggle
        checked={currentHostname
          ? $config.adaptiveTranslate.autoTranslatedSites?.includes(currentHostname)
          : false}
        onchange={() => {
          const { autoTranslatedSites } = $config.adaptiveTranslate;
          if (autoTranslatedSites?.includes(currentHostname)) {
            $config.adaptiveTranslate.autoTranslatedSites = autoTranslatedSites.filter(
              (s) => s !== currentHostname
            );
          } else {
            $config.adaptiveTranslate.autoTranslatedSites = [
              ...(autoTranslatedSites ?? []),
              currentHostname
            ];
          }
        }}
        size="small"
        classes={{
          span: 'cursor-pointer bg-slate-100 dark:bg-slate-600 m-0'
        }} />
    </div>
    <div class="flex items-center justify-between gap-4">
      <button
        type="button"
        disabled={!$config.adaptiveTranslate.translate.triggerOnHover.enabled}
        class="flex items-center justify-between gap-2 disabled:text-gray-400">
        <span class="line-clamp-1 font-medium">
          {TRIGGER_ON_HOVER.find(
            (item) => item.hotkey === $config.adaptiveTranslate.translate.triggerOnHover.hotkey
          )?.label ?? i18n('unsupported_trigger', { defaultValue: 'Unsupported Trigger' })}
        </span>
        <LocalIcon icon="tabler:chevron-down" class="h-4 w-4" />
      </button>
      <Dropdown
        simple
        placement="top-end"
        class="max-h-56 overflow-y-auto bg-white/80 shadow-md backdrop-blur-xs dark:bg-slate-900/80">
        {#each TRIGGER_ON_HOVER as { hotkey, label } (hotkey)}
          <DropdownItem
            class="flex items-center gap-2"
            onclick={() => ($config.adaptiveTranslate.translate.triggerOnHover.hotkey = hotkey)}>
            {label}
          </DropdownItem>
        {/each}
      </Dropdown>
      <Toggle
        bind:checked={$config.adaptiveTranslate.translate.triggerOnHover.enabled}
        size="small"
        classes={{
          span: 'cursor-pointer bg-slate-200 dark:bg-slate-600 m-0'
        }} />
    </div>
  </section>

  <Button onclick={toggleTranslate} class="flex w-full items-center border-none font-medium shadow">
    <span>
      {#if isTranslating}
        {i18n('show_original', { defaultValue: 'Show Original' })}
      {:else}
        {i18n('adaptive_translate', { defaultValue: 'Adaptive Translate' })}
      {/if}
    </span>
    {#if $config.adaptiveTranslate.shortcut?.length}
      <span>
        ({shortcut.formatForDisplay($config.adaptiveTranslate.shortcut).join('')})
      </span>
    {/if}
  </Button>

  <!-- features -->
  <section class="rounded-xl bg-slate-50 shadow dark:bg-slate-700">
    <Feature
      classes={{ main: 'rounded-xl px-3 py-2 hover:bg-slate-100/70 hover:dark:bg-slate-600' }}
      title={i18n('instant_lookup', { defaultValue: 'Instant Lookup' })}
      field={FEAT_INSTANT_LOOKUP} />
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
  <div class="text-slate-400">{APP_VERSION}</div>
  <div>
    <button type="button" class="flex min-w-0 items-center">
      <span class="font-medium">{i18n('more', { defaultValue: 'More' })}</span>
      <ChevronDownOutline class="h-6 w-6 text-slate-400" />
    </button>
    <Dropdown
      simple
      placement="bottom-end"
      class="max-h-96 overflow-y-auto bg-white/80 shadow-md backdrop-blur-xs dark:bg-slate-900/80">
      {#each moreItems as item (item.label)}
        <DropdownItem
          class="flex items-center gap-2"
          onclick={() =>
            sendMessage('openPage', {
              url: browser.runtime.getURL(`/options.html#${item.id}`)
            })}>
          {item.label}
        </DropdownItem>
      {/each}
    </Dropdown>
  </div>
</footer>
