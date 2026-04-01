<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from 'flowbite-svelte';
  import { browser } from 'wxt/browser';
  import { WandMagicSparklesSolid } from 'flowbite-svelte-icons';

  import { i18n } from '../../lib/i18n';
  import '../../assets/app.css';
  import AboutSettings from './components/AboutSettings.svelte';
  import AdvancedSettings from './components/AdvancedSettings.svelte';
  import AiExpertSettings from './components/AiExpertSettings.svelte';
  import AiTermsSettings from './components/AiTermsSettings.svelte';
  import AiWriteSettings from './components/AiWriteSettings.svelte';
  import ChangelogSettings from './components/ChangelogSettings.svelte';
  import DeveloperSettings from './components/DeveloperSettings.svelte';
  import DocumentationSettings from './components/DocumentationSettings.svelte';
  import FeedbackSettings from './components/FeedbackSettings.svelte';
  import FloatingBallSettings from './components/FloatingBallSettings.svelte';
  import GeneralSettings from './components/general/GeneralSettings.svelte';
  import ImportExportSettings from './components/ImportExportSettings.svelte';
  import InputTranslationSettings from './components/InputTranslationSettings.svelte';
  import MangaImageSettings from './components/MangaImageSettings.svelte';
  import MouseHoverSettings from './components/MouseHoverSettings.svelte';
  import PricingSettings from './components/PricingSettings.svelte';
  import SelectionTranslationSettings from './components/SelectionTranslationSettings.svelte';
  import ServicesSettings from './components/ServicesSettings.svelte';
  import ShortcutsSettings from './components/ShortcutsSettings.svelte';
  import SubtitleSettings from './components/SubtitleSettings.svelte';
  import type { V2OptionsConfig } from './types';
  import {
    defaultPopupConfig,
    modelOptionsByProvider,
    toggles,
    type ToggleItem
  } from '../popup/data';
  import {
    navItems,
    legacyPromptPresetMap,
    legacyLanguageMap,
    legacyToggleModeMap,
    alwaysTranslateSites
  } from './data';

  const STORAGE_KEY = 'options-config';

  const defaultToggleModes = Object.fromEntries(
    toggles.filter((item) => item.options?.length).map((item) => [item.key, item.options![0].value])
  );

  function normalizeLanguage(value: string, fallback: string) {
    if (!value) return fallback;
    return legacyLanguageMap[value] ?? value;
  }

  function normalizePromptPreset(value: string) {
    return legacyPromptPresetMap[value] ?? value;
  }

  function normalizeToggleModes(toggleModes: Record<string, string> | undefined) {
    const next = { ...defaultToggleModes, ...toggleModes };
    return Object.fromEntries(
      Object.entries(next).map(([key, value]) => [key, legacyToggleModeMap[key]?.[value] ?? value])
    );
  }

  const createDefaultConfig = (): V2OptionsConfig => ({
    ...structuredClone(defaultPopupConfig),
    toggleModes: { ...defaultToggleModes },
    alwaysTranslateSites,
    neverTranslateSites: [],
    alwaysTranslateLanguages: ['en', 'ja'],
    neverTranslateLanguages: ['zh-Hans'],
    uiLanguage: 'zh-Hans',
    translationPreference: 'bilingual',
    translationStyle: 'none',
    richTextTranslate: true,
    textColor: '#FFFFFF',
    fontScale: '100',
    fontWeight: '400',
    italicTranslate: false,
    customFontEnabled: false,
    customFontFamily: 'none'
  });

  let config = createDefaultConfig();
  let toggleItems: ToggleItem[] = toggles.map((item) => ({ ...item }));
  let newSite = '';
  let savedSnapshot = JSON.stringify(config);
  let saveMessage = '';
  let loading = true;
  let saving = false;
  let activeNavId: string = navItems[0].id;

  const topNavItems = navItems.filter((item) => item.position === 'top');
  const bottomNavItems = navItems.filter((item) => item.position === 'bottom');

  $: config = {
    ...config,
    toggles: Object.fromEntries(toggleItems.map((item) => [item.key, item.enabled]))
  };

  $: isDirty = JSON.stringify(config) !== savedSnapshot;
  $: activeNavLabel =
    navItems.find((item) => item.id === activeNavId)?.label ??
    i18n('options_nav_fallback_settings', { defaultValue: 'Settings' });

  onMount(() => {
    syncActiveNavWithHash();

    const handleHashChange = () => {
      syncActiveNavWithHash();
    };

    window.addEventListener('hashchange', handleHashChange);

    void (async () => {
      const result = await browser.storage.local.get(STORAGE_KEY);
      const stored = result[STORAGE_KEY] as Partial<V2OptionsConfig> | undefined;

      if (stored) {
        config = {
          ...createDefaultConfig(),
          ...stored,
          sourceLanguage: normalizeLanguage(
            stored.sourceLanguage ?? '',
            defaultPopupConfig.sourceLanguage
          ),
          targetLanguage: normalizeLanguage(
            stored.targetLanguage ?? '',
            defaultPopupConfig.targetLanguage
          ),
          promptPreset: normalizePromptPreset(
            stored.promptPreset ?? defaultPopupConfig.promptPreset
          ),
          alwaysTranslateLanguages: (stored.alwaysTranslateLanguages ?? []).map((item) =>
            normalizeLanguage(item, item)
          ),
          neverTranslateLanguages: (stored.neverTranslateLanguages ?? []).map((item) =>
            normalizeLanguage(item, item)
          ),
          uiLanguage: normalizeLanguage(stored.uiLanguage ?? '', 'zh-Hans'),
          translationPreference:
            stored.translationPreference === '双语对照'
              ? 'bilingual'
              : stored.translationPreference === '仅显示译文'
                ? 'translation_only'
                : (stored.translationPreference ?? 'bilingual'),
          translationStyle:
            stored.translationStyle === '无'
              ? 'none'
              : stored.translationStyle === '虚线下划线'
                ? 'dashed_underline'
                : stored.translationStyle === '直线下划线'
                  ? 'solid_underline'
                  : stored.translationStyle === '虚线边框'
                    ? 'dashed_border'
                    : stored.translationStyle === '实线边框'
                      ? 'solid_border'
                      : stored.translationStyle === '模糊效果（学习模式）'
                        ? 'blur_learning'
                        : stored.translationStyle === '透明效果'
                          ? 'transparent'
                          : stored.translationStyle === '点状下划线'
                            ? 'dotted_underline'
                            : stored.translationStyle === '分割线'
                              ? 'divider'
                              : stored.translationStyle === '高亮'
                                ? 'highlight'
                                : (stored.translationStyle ?? 'none'),
          customFontFamily:
            stored.customFontFamily === '无' ? 'none' : (stored.customFontFamily ?? 'none'),
          toggles: {
            ...defaultPopupConfig.toggles,
            ...stored.toggles
          },
          toggleModes: normalizeToggleModes(stored.toggleModes),
          alwaysTranslateSites: stored.alwaysTranslateSites?.length
            ? stored.alwaysTranslateSites
            : createDefaultConfig().alwaysTranslateSites
        };
        toggleItems = toggles.map((item) => ({
          ...item,
          enabled: config.toggles[item.key] ?? item.enabled
        }));
      }

      savedSnapshot = JSON.stringify(config);
      loading = false;
    })();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  });

  function getProviderModels(provider: string) {
    return modelOptionsByProvider[provider] ?? modelOptionsByProvider[defaultPopupConfig.provider];
  }

  function updateField(key: 'provider' | 'model' | 'promptPreset', value: string) {
    if (key === 'provider') {
      const nextModels = getProviderModels(value);
      config = {
        ...config,
        provider: value,
        model: nextModels[0] ?? ''
      };
      return;
    }

    config = {
      ...config,
      [key]: value
    };
  }

  function getToggleConfig(key: string) {
    return toggleItems.find((item) => item.key === key);
  }

  function updateToggleMode(key: string, value: string) {
    config = {
      ...config,
      toggleModes: {
        ...config.toggleModes,
        [key]: value
      }
    };
  }

  async function saveOptions() {
    saving = true;
    await browser.storage.local.set({ [STORAGE_KEY]: config });
    savedSnapshot = JSON.stringify(config);
    saveMessage = i18n('options_status_saved', { defaultValue: 'Settings saved' });
    saving = false;
  }

  async function resetOptions() {
    config = createDefaultConfig();
    toggleItems = toggles.map((item) => ({ ...item }));
    await saveOptions();
    saveMessage = i18n('options_status_reset', { defaultValue: 'Defaults restored' });
  }

  function syncActiveNavWithHash() {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash && navItems.some((item) => item.id === hash)) {
      activeNavId = hash;
      return;
    }

    activeNavId = navItems[0].id;
  }

  function goToSection(id: string) {
    if (window.location.hash === `#${id}`) {
      activeNavId = id;
      return;
    }

    window.location.hash = id;
  }
</script>

<main
  class="min-h-screen bg-slate-100 text-sm text-slate-900 dark:bg-slate-950/80 dark:text-slate-50">
  <!-- Header Section -->
  <header class="sticky top-0 z-10 bg-white/80 shadow backdrop-blur-xs dark:bg-slate-900/80">
    <div class="mx-auto flex items-center justify-between px-6 py-4">
      <div class="flex items-center gap-3">
        <div class="bg-primary-500 rounded-xl p-2 text-white shadow-md">
          <WandMagicSparklesSolid class="h-5 w-5" />
        </div>
        <div class="flex items-center gap-3">
          <span class="text-lg font-semibold"
            >{i18n('options_title_extension_name', { defaultValue: 'Immersive Translate' })}</span>
          <span class="text-slate-400">v0.0.1</span>
        </div>
      </div>

      <Button
        color="alternative"
        class="rounded-xl px-4 py-2 shadow-md dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        >⚒️ {i18n('options_button_toolbox', { defaultValue: 'Toolbox' })}</Button>
    </div>
  </header>

  <!-- Main Content Area -->
  <div class="mx-auto grid max-w-7xl grid-cols-[240px_1fr] gap-8 px-6 py-8">
    <!-- Sidebar Navigation -->
    <aside
      class="sticky top-24 z-10 flex h-[calc(100vh-8rem)] flex-col justify-between overflow-y-auto rounded-2xl bg-white/80 p-4 shadow-md dark:bg-slate-900/80">
      <div class="space-y-1">
        {#each topNavItems as item (item.id)}
          <a
            href={`#${item.id}`}
            onclick={() => goToSection(item.id)}
            class={`flex w-full items-center rounded-2xl px-4 py-3 text-left transition ${
              activeNavId === item.id
                ? 'text-primary-600 bg-slate-100 font-semibold dark:bg-slate-600'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-100 hover:dark:bg-slate-700'
            }`}>
            {item.label}
          </a>
        {/each}
      </div>

      <div class="space-y-1">
        {#each bottomNavItems as item (item.id)}
          <a
            href={`#${item.id}`}
            onclick={() => goToSection(item.id)}
            class={`flex w-full items-center rounded-2xl px-4 py-3 text-left transition ${
              activeNavId === item.id
                ? 'text-primary-600 bg-slate-100 font-semibold dark:bg-slate-600'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-100 hover:dark:bg-slate-700'
            }`}>
            {item.label}
          </a>
        {/each}
      </div>
    </aside>

    <!-- Active Section Content -->
    {#if activeNavId === 'general'}
      <GeneralSettings bind:config bind:newSite {saveOptions} {resetOptions} {getProviderModels} />
    {:else if activeNavId === 'services'}
      <ServicesSettings {config} {getProviderModels} {updateField} />
    {:else if activeNavId === 'ai'}
      <AiExpertSettings {config} {updateField} />
    {:else if activeNavId === 'terms'}
      <AiTermsSettings />
    {:else if activeNavId === 'writing'}
      <AiWriteSettings />
    {:else if activeNavId === 'subtitle'}
      <SubtitleSettings {toggleItems} />
    {:else if activeNavId === 'manga'}
      <MangaImageSettings />
    {:else if activeNavId === 'input'}
      <InputTranslationSettings />
    {:else if activeNavId === 'selection-transiation'}
      <SelectionTranslationSettings {config} {toggleItems} {getToggleConfig} {updateToggleMode} />
    {:else if activeNavId === 'mouse-hover'}
      <MouseHoverSettings {config} {toggleItems} {getToggleConfig} {updateToggleMode} />
    {:else if activeNavId === 'floating'}
      <FloatingBallSettings />
    {:else if activeNavId === 'shortcuts'}
      <ShortcutsSettings />
    {:else if activeNavId === 'advanced'}
      <AdvancedSettings {toggleItems} />
    {:else if activeNavId === 'import-export'}
      <ImportExportSettings />
    {:else if activeNavId === 'about'}
      <AboutSettings />
    {:else if activeNavId === 'pricing'}
      <PricingSettings />
    {:else if activeNavId === 'docs'}
      <DocumentationSettings />
    {:else if activeNavId === 'changelog'}
      <ChangelogSettings />
    {:else if activeNavId === 'feedback'}
      <FeedbackSettings />
    {:else if activeNavId === 'developer'}
      <DeveloperSettings />
    {/if}
  </div>
</main>
