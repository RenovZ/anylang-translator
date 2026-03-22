<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Toggle } from 'flowbite-svelte';
  import { browser } from 'wxt/browser';
  import { WandMagicSparklesSolid } from 'flowbite-svelte-icons';

  import { i18n } from '../../lib/i18n';
  import '../../assets/app.css';
  import AiExpertSettings from './components/AiExpertSettings.svelte';
  import AiTermsSettings from './components/AiTermsSettings.svelte';
  import AiWriteSettings from './components/AiWriteSettings.svelte';
  import GeneralSettings from './components/GeneralSettings.svelte';
  import InputTranslationSettings from './components/InputTranslationSettings.svelte';
  import MangaImageSettings from './components/MangaImageSettings.svelte';
  import MouseHoverSettings from './components/MouseHoverSettings.svelte';
  import SelectionTranslationSettings from './components/SelectionTranslationSettings.svelte';
  import Section from './components/Section.svelte';
  import SectionRow from './components/SectionRow.svelte';
  import ServicesSettings from './components/ServicesSettings.svelte';
  import SubtitleSettings from './components/SubtitleSettings.svelte';
  import type { V2OptionsConfig } from './types';
  import {
    defaultPopupConfig,
    modelOptionsByProvider,
    promptPresetOptions,
    providerOptions,
    toggles,
    type ToggleItem
  } from '../popup/data';

  const STORAGE_KEY = 'options-config';
  const navItems = [
    {
      id: 'general',
      label: i18n('options_nav_general', { defaultValue: 'General settings' }),
      position: 'top'
    },
    {
      id: 'services',
      label: i18n('options_nav_services', { defaultValue: 'Translation services' }),
      position: 'top'
    },
    { id: 'ai', label: i18n('options_nav_ai', { defaultValue: 'AI experts' }), position: 'top' },
    {
      id: 'terms',
      label: i18n('options_nav_terms', { defaultValue: 'AI terminology' }),
      position: 'top'
    },
    {
      id: 'writing',
      label: i18n('options_nav_writing', { defaultValue: 'AI Write' }),
      position: 'top'
    },
    {
      id: 'subtitle',
      label: i18n('options_nav_subtitle', { defaultValue: 'Video subtitles' }),
      position: 'top'
    },
    {
      id: 'manga',
      label: i18n('options_nav_manga', { defaultValue: 'Manga/Images' }),
      position: 'top'
    },
    {
      id: 'input',
      label: i18n('options_nav_input', { defaultValue: 'Input translation' }),
      position: 'top'
    },
    {
      id: 'selection-transiation',
      label: i18n('options_nav_selection_translation', { defaultValue: 'Selection translation' }),
      position: 'top'
    },
    {
      id: 'mouse-hover',
      label: i18n('options_nav_mouse_hover', { defaultValue: 'Mouse hover' }),
      position: 'top'
    },
    {
      id: 'floating',
      label: i18n('options_nav_floating', { defaultValue: 'Floating ball' }),
      position: 'top'
    },
    {
      id: 'shortcuts',
      label: i18n('options_nav_shortcuts', { defaultValue: 'Shortcuts' }),
      position: 'top'
    },
    {
      id: 'advanced',
      label: i18n('options_nav_advanced', { defaultValue: 'Advanced settings' }),
      position: 'top'
    },
    {
      id: 'import-export',
      label: i18n('options_nav_import_export', { defaultValue: 'Import/Export' }),
      position: 'top'
    },
    {
      id: 'about',
      label: i18n('options_nav_about', { defaultValue: 'About' }),
      position: 'top'
    },
    {
      id: 'pricing',
      label: i18n('options_nav_pricing', { defaultValue: 'Pricing' }),
      position: 'bottom'
    },
    {
      id: 'docs',
      label: i18n('options_nav_docs', { defaultValue: 'Documentation' }),
      position: 'bottom'
    },
    {
      id: 'changelog',
      label: i18n('options_nav_changelog', { defaultValue: 'Changelog' }),
      position: 'bottom'
    },
    {
      id: 'feedback',
      label: i18n('options_nav_feedback', { defaultValue: 'Feedback' }),
      position: 'bottom'
    },
    {
      id: 'developer',
      label: i18n('options_nav_developer', { defaultValue: 'Developer settings' }),
      position: 'bottom'
    }
  ] as const;

  const defaultToggleModes = Object.fromEntries(
    toggles.filter((item) => item.options?.length).map((item) => [item.key, item.options![0].value])
  );

  const legacyLanguageMap: Record<string, string> = {
    自动检测: 'auto',
    简体中文: 'zh-Hans',
    '英语(English)': 'en',
    英语: 'en',
    English: 'en',
    日语: 'ja',
    韩语: 'ko',
    法语: 'fr',
    德语: 'de'
  };

  const legacyPromptPresetMap: Record<string, string> = {
    通用: 'general',
    智能选择: 'smart_select',
    意译大师: 'paraphrase_master',
    段落总结专家: 'paragraph_summary_expert',
    英文简化大师: 'english_simplify_master',
    'Twitter 翻译增强器': 'twitter_enhancer',
    科技类翻译大师: 'tech_translation_master',
    'Reddit 翻译增强器': 'reddit_enhancer',
    学术论文翻译师: 'paper_translation_expert',
    新闻媒体译者: 'news_media_translator',
    音乐专家: 'music_expert',
    医学翻译大师: 'medical_translation_master',
    法律行业译者: 'legal_industry_translator',
    'GitHub 翻译增强器': 'github_enhancer',
    游戏译者: 'game_translator',
    电商翻译大师: 'ecommerce_translation_master',
    金融翻译顾问: 'finance_translation_consultant',
    小说译者: 'novel_translator',
    'AO3 译者': 'ao3_translator',
    电子书译者: 'ebook_translator',
    设计师: 'designer',
    中英杂杂: 'mixed_zh_en',
    'Web3 翻译大师': 'web3_translation_master',
    更多翻译专家: 'more_translation_experts'
  };

  const legacyToggleModeMap: Record<string, Record<string, string>> = {
    alwaysTranslateSite: {
      总是翻译该网站: 'always_translate_site',
      不自动翻译该网站: 'never_auto_translate_site'
    },
    hoverTrigger: {
      '＋ Ctrl 翻译/还原该段': 'ctrl',
      '＋ Shift 翻译/还原该段': 'shift',
      '＋ Alt 翻译/还原该段': 'alt',
      '＋ 长按鼠标左键': 'long_press_left_click',
      直接翻译该段: 'direct',
      '自定义快捷键(打开设置)': 'custom_shortcut'
    },
    selectionTrigger: {
      直接触发: 'direct',
      显示图标: 'icon',
      显示小圆点: 'dot',
      '按 Ctrl 触发': 'ctrl',
      '按 Shift 触发': 'shift',
      '按 Alt 触发': 'alt'
    }
  };

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
    alwaysTranslateSites: [
      'twitter.com',
      'x.com',
      'www.reddit.com',
      'www.kadaza.com',
      'en.wikipedia.org',
      '*.medium.com',
      'news.ycombinator.com'
    ],
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

      <Button color="light" class="rounded-xl border-none px-4 py-2 shadow-md"
        >⚒️ {i18n('options_button_toolbox', { defaultValue: 'Toolbox' })}</Button>
    </div>
  </header>

  <div class="mx-auto grid max-w-7xl grid-cols-[240px_1fr] gap-8 px-6 py-8">
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
      <Section
        id="floating"
        title={i18n('options_floating_title', { defaultValue: 'Floating ball' })}
        description={i18n('options_floating_description', {
          defaultValue: 'Quick translation floating ball settings on page edges.'
        })}>
        <SectionRow
          title={i18n('options_floating_strategy_title', { defaultValue: 'Current strategy' })}
          description={i18n('options_floating_strategy_description', {
            defaultValue:
              'Floating ball follows page translation rules; standalone behavior controls are planned for later versions.'
          })}>
          <div
            class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            {i18n('options_floating_strategy_body', {
              defaultValue:
                'The floating ball does not save its own switch yet and follows page translation and site rules.'
            })}
          </div>
        </SectionRow>
        <SectionRow
          title={i18n('options_floating_site_rule_title', { defaultValue: 'Site rules' })}
          description={i18n('options_floating_site_rule_description', {
            defaultValue:
              'To adjust auto-translation sites, open the site list in General settings.'
          })}>
          <Button color="light" class="w-full rounded-xl border-none shadow-md"
            >{i18n('options_floating_site_rule_button', {
              defaultValue: 'View site rule guide'
            })}</Button>
        </SectionRow>
      </Section>
    {:else if activeNavId === 'shortcuts'}
      <Section
        id="shortcuts"
        title={i18n('options_shortcuts_title', { defaultValue: 'Shortcuts' })}
        description={i18n('options_shortcuts_description', {
          defaultValue: 'Customize global and in-page shortcuts.'
        })}>
        <SectionRow
          title={i18n('options_shortcuts_window_title', {
            defaultValue: 'Standalone translation window'
          })}
          description={i18n('options_shortcuts_window_description', {
            defaultValue: 'Global shortcut to open the standalone translation window'
          })}>
          <div class="flex items-center justify-end gap-2">
            <kbd
              class="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-800"
              >Alt</kbd>
            <span>+</span>
            <kbd
              class="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-800"
              >T</kbd>
          </div>
        </SectionRow>
      </Section>
    {:else if activeNavId === 'advanced'}
      <Section
        id="advanced"
        title={i18n('options_advanced_title', { defaultValue: 'Advanced settings' })}
        description={i18n('options_advanced_description', {
          defaultValue: 'More low-level and experimental feature settings.'
        })}>
        <SectionRow
          title={i18n('options_advanced_chinese_page_title', { defaultValue: 'Chinese pages' })}
          description={i18n('options_advanced_chinese_page_description', {
            defaultValue: 'Control whether Chinese (Simplified) pages are translated by default.'
          })}>
          <div class="flex items-center justify-end">
            <Toggle
              bind:checked={toggleItems[3].enabled}
              size="small"
              classes={{ span: 'me-0 cursor-pointer bg-gray-300' }}
              aria-label={toggleItems[3].label} />
          </div>
        </SectionRow>
        <SectionRow
          title={i18n('options_advanced_experimental_title', {
            defaultValue: 'Experimental features'
          })}
          description={i18n('options_advanced_experimental_description', {
            defaultValue: 'More experimental toggles will be added gradually in future versions.'
          })}>
          <div
            class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            {i18n('options_advanced_experimental_body', {
              defaultValue:
                'Only advanced options already wired to storage are kept to avoid showing unsavable temporary switches.'
            })}
          </div>
        </SectionRow>
      </Section>
    {:else if activeNavId === 'import-export'}
      <Section
        id="import-export"
        title={i18n('options_import_export_title', { defaultValue: 'Import/Export' })}
        description={i18n('options_import_export_description', {
          defaultValue: 'Back up or restore all your configuration data.'
        })}>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
            <h3 class="font-semibold">
              {i18n('options_export_card_title', { defaultValue: 'Export config' })}
            </h3>
            <p class="mt-2 text-sm text-slate-500">
              {i18n('options_export_card_description', {
                defaultValue: 'Save all current settings to a file'
              })}
            </p>
            <Button color="light" class="mt-4 w-full rounded-xl border-none shadow-md"
              >{i18n('options_export_button', { defaultValue: 'Export' })}</Button>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
            <h3 class="font-semibold">
              {i18n('options_import_card_title', { defaultValue: 'Import config' })}
            </h3>
            <p class="mt-2 text-sm text-slate-500">
              {i18n('options_import_card_description', {
                defaultValue: 'Restore settings from a backup file'
              })}
            </p>
            <Button color="light" class="mt-4 w-full rounded-xl border-none shadow-md"
              >{i18n('options_import_button', { defaultValue: 'Import' })}</Button>
          </div>
        </div>
      </Section>
    {:else if activeNavId === 'about'}
      <Section
        id="about"
        title={i18n('options_about_title', { defaultValue: 'About' })}
        description={i18n('options_about_description', {
          defaultValue: 'Learn about the Immersive Translate extension.'
        })}>
        <div class="flex flex-col items-center justify-center py-8">
          <div class="bg-primary-500 mb-4 rounded-2xl p-4 text-white shadow-lg">
            <WandMagicSparklesSolid class="h-10 w-10" />
          </div>
          <h3 class="text-xl font-bold">
            {i18n('options_about_product_name', { defaultValue: 'Immersive Translate' })}
          </h3>
          <p class="mt-2 text-slate-500">
            {i18n('options_about_version', { defaultValue: 'Version 0.0.1' })}
          </p>
          <div class="mt-6 flex gap-4">
            <Button color="light" class="rounded-xl border-none shadow-md"
              >{i18n('options_about_check_update', { defaultValue: 'Check for updates' })}</Button>
            <Button color="light" class="rounded-xl border-none shadow-md"
              >{i18n('options_about_website', { defaultValue: 'Official website' })}</Button>
          </div>
        </div>
      </Section>
    {:else if activeNavId === 'pricing'}
      <Section
        id="pricing"
        title={i18n('options_pricing_title', { defaultValue: 'Pricing' })}
        description={i18n('options_pricing_description', {
          defaultValue: 'Upgrade to Pro to unlock more advanced features and premium services.'
        })}>
        <div class="border-primary-200 bg-primary-50 rounded-2xl border-2 p-8 text-center">
          <h3 class="text-primary-700 text-2xl font-bold">
            {i18n('options_pricing_pro_title', { defaultValue: 'Pro membership' })}
          </h3>
          <p class="text-primary-600/80 mt-2">
            {i18n('options_pricing_pro_description', {
              defaultValue: 'Enjoy premium services like DeepL and OpenAI translation'
            })}
          </p>
          <Button class="mt-6 rounded-xl border-none px-8 py-3 shadow-md"
            >{i18n('options_pricing_upgrade_button', { defaultValue: 'Upgrade now' })}</Button>
        </div>
      </Section>
    {:else if activeNavId === 'docs'}
      <Section
        id="docs"
        title={i18n('options_docs_title', { defaultValue: 'Documentation' })}
        description={i18n('options_docs_description', {
          defaultValue: 'Read detailed feature guides and tutorials.'
        })}>
        <SectionRow
          title={i18n('options_docs_official_title', { defaultValue: 'Official docs' })}
          description={i18n('options_docs_official_description', {
            defaultValue: 'Detailed docs and FAQ for all features'
          })}>
          <Button color="light" class="w-full rounded-xl border-none shadow-md"
            >{i18n('options_docs_open_button', { defaultValue: 'Open docs' })}</Button>
        </SectionRow>
      </Section>
    {:else if activeNavId === 'changelog'}
      <Section
        id="changelog"
        title={i18n('options_changelog_title', { defaultValue: 'Changelog' })}
        description={i18n('options_changelog_description', {
          defaultValue: 'View recent updates and new features.'
        })}>
        <div class="space-y-6 border-l-2 border-slate-200 pl-6">
          <div class="relative">
            <div
              class="bg-primary-500 absolute top-1 -left-7.75 h-4 w-4 rounded-full border-4 border-white">
            </div>
            <h3 class="font-semibold">v0.0.1</h3>
            <p class="mt-1 text-sm text-slate-500">2024-01-01</p>
            <ul class="mt-3 list-disc space-y-1 pl-4 text-sm text-slate-600">
              <li>{i18n('options_changelog_item_1', { defaultValue: 'Initial release' })}</li>
              <li>
                {i18n('options_changelog_item_2', {
                  defaultValue: 'Supports multiple AI translation services'
                })}
              </li>
              <li>
                {i18n('options_changelog_item_3', {
                  defaultValue: 'Supports bilingual webpage translation'
                })}
              </li>
            </ul>
          </div>
        </div>
      </Section>
    {:else if activeNavId === 'feedback'}
      <Section
        id="feedback"
        title={i18n('options_feedback_title', { defaultValue: 'Feedback' })}
        description={i18n('options_feedback_description', {
          defaultValue: 'Found an issue or have ideas? Tell us.'
        })}>
        <SectionRow
          title={i18n('options_feedback_submit_title', { defaultValue: 'Submit feedback' })}
          description={i18n('options_feedback_submit_description', {
            defaultValue: 'Open a GitHub issue or join community discussions'
          })}>
          <div class="space-y-3">
            <Button color="light" class="w-full rounded-xl border-none shadow-md"
              >{i18n('options_feedback_github_button', { defaultValue: 'GitHub Issues' })}</Button>
            <Button color="light" class="w-full rounded-xl border-none shadow-md"
              >{i18n('options_feedback_discord_button', {
                defaultValue: 'Join Discord community'
              })}</Button>
          </div>
        </SectionRow>
      </Section>
    {:else if activeNavId === 'developer'}
      <Section
        id="developer"
        title={i18n('options_developer_title', { defaultValue: 'Developer settings' })}
        description={i18n('options_developer_description', {
          defaultValue: 'Advanced options for developer debugging and testing.'
        })}>
        <SectionRow
          title={i18n('options_developer_debug_title', { defaultValue: 'Debug capability' })}
          description={i18n('options_developer_debug_description', {
            defaultValue: 'No standalone persisted developer debug switch is currently provided.'
          })}>
          <div
            class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            {i18n('options_developer_debug_body', {
              defaultValue:
                'For troubleshooting, use extension management page, console logs, and feedback entry.'
            })}
          </div>
        </SectionRow>
      </Section>
    {/if}
  </div>
</main>
