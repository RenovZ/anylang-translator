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

  import { config } from '@/lib/config';
  import { languages } from '@/lib/languages';
  import { i18n } from '@/lib/i18n';
  import '@/assets/app.css';
  import avatar from '@/lib/avatar';
  import {
    getLanguageLabel,
    getPromptPresetLabel,
    languageOptions,
    moreItems,
    quickActions,
    toggles,
    type ConfigRow,
    type ConfigRowKey
  } from './data';

  const toggleItems = toggles.map((item) => ({ ...item }));
  const popupConfig = $state({
    toggles: Object.fromEntries(toggleItems.map((item) => [item.key, item.enabled]))
  });

  const getConfigValue = (key: ConfigRowKey) => {
    // if (key === 'provider') return popupConfig.provider;
    // if (key === 'model') return popupConfig.model;
    // return popupConfig.promptPreset;
  };

  const getConfigOptions = (row: ConfigRow) => {
    // if (row.key === 'model') {
    //   return modelOptionsByProvider[popupConfig.provider] ?? row.options;
    // }
    return row.options;
  };

  const getConfigOptionLabel = (key: ConfigRowKey, value: string) => {
    if (key === 'promptPreset') {
      return getPromptPresetLabel(value);
    }
    return value;
  };

  const getConfigDisplayValue = (key: ConfigRowKey) => {
    const value = getConfigValue(key);
    return key === 'promptPreset' ? getPromptPresetLabel(value) : value;
  };

  const updateConfig = (key: ConfigRowKey, value: string) => {
    // if (key === 'provider') {
    //   const nextModelOptions = modelOptionsByProvider[value] ?? [];
    //   popupConfig.provider = value;
    //   popupConfig.model = nextModelOptions[0] ?? '';
    //   return;
    // }
    // popupConfig[key] = value;
  };

  const openOptionsPage = () => {
    browser.runtime.openOptionsPage();
  };
</script>

<main class="min-w-80 bg-slate-100 text-sm dark:bg-slate-950/80">
  <!-- header -->
  <section class="space-y-4 rounded-b-2xl bg-white p-4 dark:bg-slate-900">
    <header class="flex items-center justify-between">
      <div class="flex items-center justify-between gap-2">
        <Avatar
          class="flex h-6 w-6 items-center justify-center"
          src={avatar.dicebear('RenovZ', {
            chars: 1,
            backgroundType: ['gradientLinear']
          })}
          size="xs" />
        <span class="text-xs">{i18n('popup_guest', { defaultValue: 'Guest' })}</span>
        <GradientButton color="purpleToBlue" pill class="px-2 py-1 text-xs">
          <span>⚡</span>
          <span>{i18n('popup_upgrade', { defaultValue: 'Upgrade' })}</span>
        </GradientButton>
      </div>
    </header>

    <!-- languages -->
    <section class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <Button
        class="rounded-xl bg-slate-100 px-3 py-2 text-slate-900 hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
        <div class="flex flex-col text-left">
          <span class="line-clamp-1 font-medium">
            {config.get('sourceLanguage')}
          </span>
          <span class="text-xs text-slate-400">
            {languageOptions[0].hint}
          </span>
        </div>
        <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
      </Button>
      <Dropdown
        simple
        class="max-h-96 overflow-y-auto bg-white/80 backdrop-blur-xs dark:bg-gray-700/80">
        {#each Object.entries(languages.getLanguageList()) as [langCode, langName] (langCode)}
          <DropdownItem on:click={() => config.set('sourceLanguage', langCode)}>
            {langName}
          </DropdownItem>
        {/each}
      </Dropdown>

      <ArrowRightOutline class="h-6 w-6 shrink-0 text-slate-400" />

      <Button
        class="rounded-xl bg-slate-100 px-3 py-2 text-slate-900 hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
        <div class="flex flex-col text-left">
          <span class="line-clamp-1 font-medium">
            {config.get('targetLanguage')}
          </span>
          <span class="text-xs text-slate-400">
            {languageOptions[1].hint}
          </span>
        </div>
        <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
      </Button>
      <Dropdown
        simple
        class="max-h-96 overflow-y-auto bg-white/80 backdrop-blur-xs dark:bg-gray-700/80">
        {#each Object.entries(languages.getLanguageList()) as [langCode, langName] (langCode)}
          <DropdownItem on:click={() => config.set('targetLanguage', langCode)}>
            {langName}
          </DropdownItem>
        {/each}
      </Dropdown>
    </section>

    <section class="rounded-xl bg-slate-100 dark:bg-slate-700">
      <!-- {#each providers as row, index (row.key)}
        <div
          class:rounded-b-xl={index === providers.length - 1}
          class:rounded-t-xl={index === 0}
          class="grid grid-cols-[88px_1fr] items-center px-3 py-2 hover:bg-slate-200/70 hover:dark:bg-slate-600">
          <div class="font-medium">{row.label}</div>
          <button type="button" class="flex flex-1 items-center justify-between">
            <div class="flex flex-col text-left font-medium">
              {getConfigDisplayValue(row.key)}
            </div>
            <ChevronDownOutline class="h-6 w-6 text-slate-400" />
          </button>
          <Dropdown
            simple
            placement="bottom-end"
            class="max-h-72 overflow-y-auto bg-white/80 backdrop-blur-xs dark:bg-gray-700/80">
            {#each getConfigOptions(row) as option (option)}
              <DropdownItem on:click={() => updateConfig(row.key, option)}>
                {getConfigOptionLabel(row.key, option)}
              </DropdownItem>
            {/each}
          </Dropdown>
        </div>
      {/each} -->

      <div
        class="grid grid-cols-[88px_1fr] items-center rounded-t-xl px-3 py-2 hover:bg-slate-200/70 hover:dark:bg-slate-600">
        <div class="font-medium">{i18n('translate_provider', { defaultValue: 'Provider' })}</div>
        <button type="button" class="flex flex-1 items-center justify-between">
          <div class="flex flex-col text-left font-medium">
            {getConfigDisplayValue(row.key)}
          </div>
          <ChevronDownOutline class="h-6 w-6 text-slate-400" />
        </button>
        <Dropdown
          simple
          placement="bottom-end"
          class="max-h-72 overflow-y-auto bg-white/80 backdrop-blur-xs dark:bg-gray-700/80">
          {#each getConfigOptions(row) as option (option)}
            <DropdownItem on:click={() => updateConfig(row.key, option)}>
              {getConfigOptionLabel(row.key, option)}
            </DropdownItem>
          {/each}
        </Dropdown>
      </div>
    </section>

    <section class="flex items-center gap-3">
      <Button
        pill
        class="bg-slate-100 p-2! hover:bg-slate-200/70 dark:bg-slate-700 hover:dark:bg-slate-600">
        <LanguageOutline class="text-primary-500 h-6 w-6 shrink-0" />
      </Button>
      <Button class="flex-1 rounded-xl text-base"
        >{i18n('popup_translate_button', { defaultValue: 'Translate (⌥A)' })}</Button>
    </section>

    <section class="flex flex-col gap-3">
      {#each toggleItems as item (item.key)}
        <div class="flex items-center justify-between gap-3">
          <button type="button" class="flex min-w-0 flex-nowrap items-center text-left">
            <span class="line-clamp-1 font-medium">{item.label}</span>
            {#if item.hasMenu}
              <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
            {/if}
          </button>
          {#if item.options}
            <Dropdown
              simple
              placement="bottom-end"
              class="bg-white/80 backdrop-blur-xs dark:bg-gray-700/80">
              {#each item.options as option (option.value)}
                <DropdownItem>{option.label}</DropdownItem>
              {/each}
            </Dropdown>
          {/if}
          <Toggle
            bind:checked={item.enabled}
            size="small"
            classes={{
              span: 'me-0 cursor-pointer bg-slate-200 dark:bg-slate-600'
            }}
            aria-label={item.label} />
        </div>
      {/each}
    </section>

    <section class="grid grid-cols-3 gap-3 text-sm">
      {#each quickActions as action (action.label)}
        <Button
          class="gap-1 rounded-xl bg-slate-100 px-1 py-2 text-slate-900 hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
          <span>{action.icon}</span>
          <span class="font-medium">{action.label}</span>
        </Button>
        {#if action.description}
          <Tooltip class="text-xs">{action.description}</Tooltip>
        {/if}
      {/each}
    </section>
  </section>

  <footer class="flex items-center justify-between p-2 text-sm">
    <button type="button" class="flex items-center gap-1" onclick={openOptionsPage}>
      <CogOutline class="h-4 w-4 shrink-0" />
      <span>{i18n('popup_footer_settings', { defaultValue: 'Settings' })}</span>
    </button>
    <div class="text-slate-400">v0.0.1</div>
    <div>
      <button type="button" class="flex min-w-0 items-center">
        <span class="font-medium">{i18n('popup_footer_more', { defaultValue: 'More' })}</span>
        <ChevronDownOutline class="h-6 w-6 text-slate-400" />
      </button>
      <Dropdown
        simple
        placement="bottom-end"
        class="max-h-96 overflow-y-auto bg-white/80 backdrop-blur-xs dark:bg-gray-700/80">
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
