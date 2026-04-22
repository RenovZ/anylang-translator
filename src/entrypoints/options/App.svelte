<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from 'flowbite-svelte';
  import { browser } from 'wxt/browser';
  import { WandMagicSparklesSolid } from 'flowbite-svelte-icons';

  import { i18n } from '@/lib/i18n';
  import '@/assets/app.css';
  import AboutSettings from './AboutSettings.svelte';
  import AdvancedSettings from './AdvancedSettings.svelte';
  import AiExpertSettings from './AiExpertSettings.svelte';
  import AiTermsSettings from './AiTermsSettings.svelte';
  import AiWriteSettings from './AiWriteSettings.svelte';
  import ChangelogSettings from './ChangelogSettings.svelte';
  import DeveloperSettings from './DeveloperSettings.svelte';
  import DocumentationSettings from './DocumentationSettings.svelte';
  import FeedbackSettings from './FeedbackSettings.svelte';
  import FloatingBallSettings from './FloatingBallSettings.svelte';
  import GeneralSettings from './general/GeneralSettings.svelte';
  import ImportExportSettings from './ImportExportSettings.svelte';
  import InputTranslationSettings from './InputTranslationSettings.svelte';
  import MangaImageSettings from './MangaImageSettings.svelte';
  import MouseHoverSettings from './MouseHoverSettings.svelte';
  import PricingSettings from './PricingSettings.svelte';
  import SelectionTranslationSettings from './SelectionTranslationSettings.svelte';
  import ServicesSettings from './ServicesSettings.svelte';
  import ShortcutsSettings from './ShortcutsSettings.svelte';
  import SubtitleSettings from './SubtitleSettings.svelte';
  import { navItems } from './data';

  // const createDefaultConfig = () => ({
  //   neverTranslateSites: [],
  //   alwaysTranslateLanguages: ['en', 'ja'],
  //   neverTranslateLanguages: ['zh-Hans'],
  //   uiLanguage: 'zh-Hans',
  //   translationPreference: 'bilingual',
  //   translationStyle: 'none',
  //   richTextTranslate: true,
  //   textColor: '#FFFFFF',
  //   fontScale: '100',
  //   fontWeight: '400',
  //   italicTranslate: false,
  //   customFontEnabled: false,
  //   customFontFamily: 'none'
  // });

  let newSite = '';
  let saveMessage = '';
  let loading = true;
  let saving = false;
  let activeNavId: string = navItems[0].id;

  const topNavItems = navItems.filter((item) => item.position === 'top');
  const bottomNavItems = navItems.filter((item) => item.position === 'bottom');

  $: activeNavLabel =
    navItems.find((item) => item.id === activeNavId)?.label ??
    i18n('options_nav_fallback_settings', { defaultValue: 'Settings' });

  onMount(() => {
    syncActiveNavWithHash();

    const handleHashChange = () => {
      syncActiveNavWithHash();
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  });

  const syncActiveNavWithHash = () => {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash && navItems.some((item) => item.id === hash)) {
      activeNavId = hash;
      return;
    }

    activeNavId = navItems[0].id;
  };

  const goToSection = (id: string) => {
    if (window.location.hash === `#${id}`) {
      activeNavId = id;
      return;
    }

    window.location.hash = id;
  };
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
            >{i18n('options_title_extension_name', { defaultValue: 'Anylang Translator' })}</span>
          <span class="text-slate-400">v0.0.1</span>
        </div>
      </div>

      <Button
        color="alternative"
        class="rounded-xl px-4 py-2 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
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
      <GeneralSettings />
    {:else if activeNavId === 'services'}
      <!-- <ServicesSettings {config} {getProviderModels} {updateField} /> -->
    {:else if activeNavId === 'ai'}
      <!-- <AiExpertSettings {config} {updateField} /> -->
    {:else if activeNavId === 'terms'}
      <AiTermsSettings />
    {:else if activeNavId === 'writing'}
      <AiWriteSettings />
    {:else if activeNavId === 'subtitle'}
      <!-- <SubtitleSettings {toggleItems} /> -->
    {:else if activeNavId === 'manga'}
      <MangaImageSettings />
    {:else if activeNavId === 'input'}
      <InputTranslationSettings />
    {:else if activeNavId === 'selection-transiation'}
      <!-- <SelectionTranslationSettings {config} {toggleItems} {getToggleConfig} {updateToggleMode} /> -->
    {:else if activeNavId === 'mouse-hover'}
      <!-- <MouseHoverSettings {config} {toggleItems} {getToggleConfig} {updateToggleMode} /> -->
    {:else if activeNavId === 'floating'}
      <FloatingBallSettings />
    {:else if activeNavId === 'shortcuts'}
      <ShortcutsSettings />
    {:else if activeNavId === 'advanced'}
      <!-- <AdvancedSettings {toggleItems} /> -->
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
