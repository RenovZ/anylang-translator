<script lang="ts">
  import {
    Avatar,
    GradientButton,
    Button,
    Dropdown,
    DropdownItem,
    Toggle,
    Tooltip
  } from 'flowbite-svelte';
  import {
    ChevronDownOutline,
    ArrowRightOutline,
    LanguageOutline,
    CogOutline
  } from 'flowbite-svelte-icons';
  import { browser } from 'wxt/browser';

  import '@/assets/app.css';
  import config from '@/lib/config';
  import lang from '@/lib/lang';
  import i18n from '@/lib/i18n';
  import avatar from '@/lib/avatar';
  import type { PaidProvider, SelectionTriggerValue } from '@/lib/types';
  import { aiProviders, goProviders, promptPresets, zenProviders } from '@/lib/preset';
  import { languageOptions } from '@/lib/data';
  import ProvidersDropdown from '@/components/ProvidersDropdown.svelte';

  import { selectionTranslateToggle, moreItems, quickActions } from './data';

  let currentSite = $state('');

  $effect(() => {
    browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      currentSite = tab.url ? new URL(tab.url).origin : window.location.origin;
    });
  });
</script>

<main class="min-w-80 bg-slate-100 text-sm dark:bg-slate-950/80">
  <section class="space-y-4 rounded-b-2xl bg-white p-4 dark:bg-slate-900">
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
        class="rounded-xl bg-slate-100 px-3 py-2 text-slate-900 hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
        <div class="flex flex-col text-left">
          <span class="line-clamp-1 font-medium">
            {lang.codeToLang(currentLang) ?? i18n('auto_detect', { defaultValue: 'Auto Detect' })}
          </span>
          <span class="line-clamp-1 text-xs text-slate-400">
            {languageOptions[position === 'source' ? 0 : 1]}
          </span>
          <Tooltip class="text-xs">{languageOptions[position === 'source' ? 0 : 1]}</Tooltip>
        </div>
        <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
      </Button>
      <Dropdown
        simple
        placement={position === 'source' ? 'bottom-start' : 'bottom-end'}
        class="max-h-80 overflow-y-auto shadow-md">
        <DropdownItem
          onclick={() =>
            ($config[position === 'source' ? 'sourceLanguage' : 'targetLanguage'] = null)}>
          {i18n('auto_detect', { defaultValue: 'Auto Detect' })}
        </DropdownItem>
        {#each Object.entries(lang.all()) as [langCode, langName] (langCode)}
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
      <ArrowRightOutline class="h-6 w-6 shrink-0 text-slate-400" />
      {@render languageDropdown('target')}
    </section>

    <!-- providers -->
    <section class="rounded-xl bg-slate-100 dark:bg-slate-700">
      <div
        class:rounded-b-xl={$config.pageTranslationProvider.type === 'free'}
        class="grid grid-cols-[88px_1fr] items-center rounded-t-xl px-3 py-2 hover:bg-slate-200/70 hover:dark:bg-slate-600">
        <div class="font-medium">{i18n('provider', { defaultValue: 'Provider' })}</div>
        <button type="button" class="flex flex-1 items-center justify-between">
          <div class="line-clamp-1 text-left font-medium">
            {$config.pageTranslationProvider.name}
          </div>
          <ChevronDownOutline class="h-6 w-6 text-slate-400" />
        </button>
        <ProvidersDropdown />
      </div>
      {#if $config.pageTranslationProvider.type !== 'free' && aiProviders.includes($config.pageTranslationProvider.type)}
        {@const paidProvider = $config.pageTranslationProvider as PaidProvider}
        {@const currentModels =
          (
            [...goProviders, ...zenProviders, ...$config.customProviders].find(
              (item) =>
                item.type !== 'free' &&
                aiProviders.includes(item.type) &&
                item.name === paidProvider.name
            ) as PaidProvider
          )?.models ?? []}
        <div
          class="grid grid-cols-[88px_1fr] items-center px-3 py-2 hover:bg-slate-200/70 hover:dark:bg-slate-600">
          <div class="font-medium">{i18n('model', { defaultValue: 'Model' })}</div>
          <button type="button" class="flex flex-1 items-center justify-between">
            <div class="line-clamp-1 text-left font-medium">
              {paidProvider.model}
            </div>
            <ChevronDownOutline class="h-6 w-6 text-slate-400" />
          </button>
          <Dropdown simple placement="bottom-end" class="max-h-72 overflow-y-auto">
            {#each currentModels as model (model)}
              <DropdownItem
                onclick={() => ($config.pageTranslationProvider = { model, ...paidProvider })}>
                {model}
              </DropdownItem>
            {/each}
          </Dropdown>
        </div>
        <div
          class="grid grid-cols-[88px_1fr] items-center rounded-b-xl px-3 py-2 hover:bg-slate-200/70 hover:dark:bg-slate-600">
          <div class="font-medium">{i18n('prompt', { defaultValue: 'Prompt' })}</div>
          <button type="button" class="flex flex-1 items-center justify-between">
            <div class="line-clamp-1 text-left font-medium">
              {promptPresets.find((item) => item.value == paidProvider.prompt)?.label ?? ''}
            </div>
            <ChevronDownOutline class="h-6 w-6 text-slate-400" />
          </button>
          <Dropdown simple placement="bottom-end" class="max-h-72 overflow-y-auto">
            {#each promptPresets as { value: prompt, label } (prompt)}
              <DropdownItem
                onclick={() => ($config.pageTranslationProvider = { prompt, ...paidProvider })}>
                {label}
              </DropdownItem>
            {/each}
          </Dropdown>
        </div>
      {/if}
    </section>

    <section class="flex items-center gap-3">
      <Button
        pill
        class="bg-slate-100 p-2 hover:bg-slate-200/70 dark:bg-slate-700 hover:dark:bg-slate-600">
        <LanguageOutline class="text-primary-500 h-6 w-6 shrink-0" />
      </Button>
      <Button class="flex-1 rounded-xl text-base">
        {i18n('translate', { defaultValue: 'Translate (⌥A)' })}
      </Button>
    </section>

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
  </section>

  <footer class="flex items-center justify-between p-2 text-sm">
    <button
      type="button"
      class="flex items-center gap-1"
      onclick={() => browser.runtime.openOptionsPage()}>
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
