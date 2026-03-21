<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Toggle } from 'flowbite-svelte';
  import { browser } from 'wxt/browser';
  import { WandMagicSparklesSolid } from 'flowbite-svelte-icons';

  import '../../assets/app.css';
  import GeneralSettings from './components/GeneralSettings.svelte';
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
    { id: 'general', label: '基本设置', position: 'top' },
    { id: 'services', label: '翻译服务', position: 'top' },
    { id: 'ai', label: 'AI 专家', position: 'top' },
    { id: 'terms', label: 'AI 术语库', position: 'top' },
    { id: 'writing', label: 'AI Write', position: 'top' },
    { id: 'subtitle', label: '视频字幕', position: 'top' },
    { id: 'manga', label: '漫画/图片', position: 'top' },
    { id: 'input', label: '输入框翻译', position: 'top' },
    { id: 'selection-transiation', label: '划词翻译', position: 'top' },
    { id: 'mouse-hover', label: '鼠标悬停', position: 'top' },
    { id: 'floating', label: '悬浮球', position: 'top' },
    { id: 'shortcuts', label: '快捷键', position: 'top' },
    { id: 'advanced', label: '高级设置', position: 'top' },
    { id: 'import-export', label: '导入/导出', position: 'top' },
    { id: 'about', label: '关于', position: 'top' },
    { id: 'pricing', label: '价格', position: 'bottom' },
    { id: 'docs', label: '使用文档', position: 'bottom' },
    { id: 'changelog', label: '更新日志', position: 'bottom' },
    { id: 'feedback', label: '问题反馈', position: 'bottom' },
    { id: 'developer', label: '开发者设置', position: 'bottom' }
  ] as const;

  const defaultToggleModes = Object.fromEntries(
    toggles.filter((item) => item.options?.length).map((item) => [item.key, item.options![0]])
  );

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
    alwaysTranslateLanguages: ['英语', '日语'],
    neverTranslateLanguages: ['简体中文'],
    uiLanguage: '简体中文',
    translationPreference: '双语对照',
    translationStyle: '无',
    richTextTranslate: true,
    textColor: '#FFFFFF',
    fontScale: '100',
    fontWeight: '400',
    italicTranslate: false,
    customFontEnabled: false,
    customFontFamily: '无'
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
  $: activeNavLabel = navItems.find((item) => item.id === activeNavId)?.label ?? '设置';

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
          toggles: {
            ...defaultPopupConfig.toggles,
            ...stored.toggles
          },
          toggleModes: {
            ...defaultToggleModes,
            ...stored.toggleModes
          },
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

  async function saveOptions() {
    saving = true;
    await browser.storage.local.set({ [STORAGE_KEY]: config });
    savedSnapshot = JSON.stringify(config);
    saveMessage = '设置已保存';
    saving = false;
  }

  async function resetOptions() {
    config = createDefaultConfig();
    toggleItems = toggles.map((item) => ({ ...item }));
    await saveOptions();
    saveMessage = '已恢复默认设置';
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
        <div class="bg-primary-500 rounded-xl p-2 text-white shadow-sm">
          <WandMagicSparklesSolid class="h-5 w-5" />
        </div>
        <div class="flex items-center gap-3">
          <span class="text-lg font-semibold">沉浸式翻译</span>
          <span class="text-slate-400">v0.0.1</span>
        </div>
      </div>

      <Button color="light" class="rounded-xl border-none px-4 py-2 shadow-md">⚒️ 工具箱</Button>
    </div>
  </header>

  <div class="mx-auto grid max-w-7xl grid-cols-[240px_1fr] gap-8 px-6 py-8">
    <aside
      class="sticky top-24 z-10 flex h-[calc(100vh-8rem)] flex-col justify-between overflow-y-auto rounded-2xl bg-white/80 p-4 shadow-md dark:bg-slate-900/80">
      <div class="space-y-1">
        {#each topNavItems as item}
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
        {#each bottomNavItems as item}
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
      <GeneralSettings
        bind:config
        bind:toggleItems
        bind:newSite
        {saveOptions}
        {resetOptions}
        {getProviderModels} />
    {:else if activeNavId === 'services'}
      <section class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <div class="mb-4">
          <h2 class="text-lg font-semibold">翻译服务</h2>
          <p class="mt-1 text-sm text-slate-400">选择模型供应商和当前默认模型。</p>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2">
            <span class="font-medium">供应商</span>
            <select
              value={config.provider}
              onchange={(event) =>
                updateField('provider', (event.currentTarget as HTMLSelectElement).value)}
              class="focus:border-primary-400 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 transition outline-none">
              {#each providerOptions as option}
                <option value={option}>{option}</option>
              {/each}
            </select>
          </label>
          <label class="space-y-2">
            <span class="font-medium">默认模型</span>
            <select
              value={config.model}
              onchange={(event) =>
                updateField('model', (event.currentTarget as HTMLSelectElement).value)}
              class="focus:border-primary-400 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 transition outline-none">
              {#each getProviderModels(config.provider) as option}
                <option value={option}>{option}</option>
              {/each}
            </select>
          </label>
        </div>
      </section>
    {:else if activeNavId === 'ai'}
      <section class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <div class="mb-4">
          <h2 class="text-lg font-semibold">AI 专家</h2>
          <p class="mt-1 text-sm text-slate-400">选择默认的提示词方案和 AI 专家模式。</p>
        </div>
        <select
          value={config.promptPreset}
          onchange={(event) =>
            updateField('promptPreset', (event.currentTarget as HTMLSelectElement).value)}
          class="focus:border-primary-400 w-full max-w-sm rounded-2xl border border-slate-200 bg-white px-4 py-3 transition outline-none">
          {#each promptPresetOptions as option}
            <option value={option}>{option}</option>
          {/each}
        </select>
      </section>
    {:else if activeNavId === 'subtitle'}
      <section class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 class="text-lg font-semibold">视频字幕</h2>
        <div class="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3">
          <span class="font-medium">自动开启双语字幕</span>
          <Toggle
            bind:checked={toggleItems[4].enabled}
            size="small"
            classes={{
              span: 'me-0 cursor-pointer bg-gray-300'
            }}
            aria-label="自动开启双语字幕" />
        </div>
      </section>
    {:else if activeNavId === 'floating'}
      <section class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 class="text-lg font-semibold">悬浮球</h2>
        <div class="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3">
          <span class="font-medium">总是翻译该网站</span>
          <Toggle
            bind:checked={toggleItems[0].enabled}
            size="small"
            classes={{
              span: 'me-0 cursor-pointer bg-gray-300'
            }}
            aria-label={toggleItems[0].label} />
        </div>
      </section>
    {:else}
      <section class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 class="text-lg font-semibold">{activeNavLabel}</h2>
        <p class="mt-2 text-sm text-slate-400">
          当前只显示这个模块的独立内容区域，后续可以继续单独完善。
        </p>
      </section>
    {/if}
  </div>
</main>
