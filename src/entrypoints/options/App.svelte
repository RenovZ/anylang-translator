<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Toggle } from 'flowbite-svelte';
  import { browser } from 'wxt/browser';
  import { WandMagicSparklesSolid } from 'flowbite-svelte-icons';

  import '../../assets/app.css';
  import GeneralSettings from './components/GeneralSettings.svelte';
  import Section from './components/Section.svelte';
  import SectionRow from './components/SectionRow.svelte';
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
      <Section id="services" title="翻译服务" description="选择模型供应商和当前默认模型。">
        <SectionRow title="供应商" description="选择您偏好的 AI 模型供应商">
          <select
            value={config.provider}
            onchange={(event) =>
              updateField('provider', (event.currentTarget as HTMLSelectElement).value)}
            class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
            {#each providerOptions as option (option)}
              <option value={option}>{option}</option>
            {/each}
          </select>
        </SectionRow>
        <SectionRow title="默认模型" description="选择该供应商下的具体模型">
          <select
            value={config.model}
            onchange={(event) =>
              updateField('model', (event.currentTarget as HTMLSelectElement).value)}
            class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
            {#each getProviderModels(config.provider) as option (option)}
              <option value={option}>{option}</option>
            {/each}
          </select>
        </SectionRow>
      </Section>
    {:else if activeNavId === 'ai'}
      <Section id="ai" title="AI 专家" description="选择默认的提示词方案和 AI 专家模式。">
        <SectionRow title="提示词方案" description="选择适合您当前场景的提示词预设">
          <select
            value={config.promptPreset}
            onchange={(event) =>
              updateField('promptPreset', (event.currentTarget as HTMLSelectElement).value)}
            class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
            {#each promptPresetOptions as option (option)}
              <option value={option}>{option}</option>
            {/each}
          </select>
        </SectionRow>
      </Section>
    {:else if activeNavId === 'terms'}
      <Section
        id="terms"
        title="AI 术语库"
        description="管理您的专属翻译术语库，确保专业词汇翻译的一致性。">
        <SectionRow title="术语库状态" description="当前未开启自定义术语库">
          <Button class="w-full rounded-xl shadow-md">开启术语库</Button>
        </SectionRow>
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
          开启后可在此添加和管理专业术语
        </div>
      </Section>
    {:else if activeNavId === 'writing'}
      <Section id="writing" title="AI Write" description="配置 AI 辅助写作和润色功能。">
        <SectionRow
          title="功能状态"
          description="当前版本已预留 AI 写作入口，后续将开放可保存的风格和场景预设。">
          <div
            class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            写作模板、语气偏好和自动润色规则将在后续版本中开放。
          </div>
        </SectionRow>
        <SectionRow
          title="推荐用法"
          description="当前可先在弹出面板中选择模型与提示词后使用写作能力。">
          <Button color="light" class="w-full rounded-xl shadow-sm">查看即将上线的能力</Button>
        </SectionRow>
      </Section>
    {:else if activeNavId === 'subtitle'}
      <Section id="subtitle" title="视频字幕" description="配置在线视频的双语字幕翻译功能。">
        <SectionRow title="自动开启双语字幕" description="在支持的视频网站自动显示双语字幕">
          <div class="flex items-center justify-end">
            <Toggle
              bind:checked={toggleItems[4].enabled}
              size="small"
              classes={{ span: 'me-0 cursor-pointer bg-gray-300' }}
              aria-label="自动开启双语字幕" />
          </div>
        </SectionRow>
      </Section>
    {:else if activeNavId === 'manga'}
      <Section id="manga" title="漫画/图片" description="配置图片和漫画的翻译识别设置。">
        <SectionRow
          title="图片识别"
          description="该能力将沿用主翻译服务配置，并在后续版本开放更细粒度的 OCR 选项。">
          <div
            class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            当前无需单独配置 OCR 引擎，使用时会直接继承全局翻译服务。
          </div>
        </SectionRow>
        <SectionRow title="适用场景" description="适用于漫画对白、截图与无字幕图片内容的翻译。">
          <Button color="light" class="w-full rounded-xl shadow-sm">查看图片翻译说明</Button>
        </SectionRow>
      </Section>
    {:else if activeNavId === 'input'}
      <Section id="input" title="输入框翻译" description="在输入框中快速翻译您输入的内容。">
        <SectionRow title="功能状态" description="输入框翻译的触发条件正在整理为统一的快捷键体系。">
          <div
            class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            当前版本保留入口说明，实际快捷键开关将在快捷键设置稳定后开放。
          </div>
        </SectionRow>
      </Section>
    {:else if activeNavId === 'selection-transiation'}
      <Section
        id="selection-transiation"
        title="划词翻译"
        description="选中文本后快速查看翻译结果。">
        <SectionRow title="触发方式" description="选择划词后如何触发翻译">
          <select
            value={config.toggleModes.selectionTrigger}
            onchange={(event) =>
              updateToggleMode(
                'selectionTrigger',
                (event.currentTarget as HTMLSelectElement).value
              )}
            class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
            {#each getToggleConfig('selectionTrigger')?.options ?? [] as option}
              <option value={option}>{option}</option>
            {/each}
          </select>
        </SectionRow>
        <SectionRow title="启用状态" description="控制是否显示划词翻译入口">
          <div class="flex items-center justify-end">
            <Toggle
              bind:checked={toggleItems[2].enabled}
              size="small"
              classes={{ span: 'me-0 cursor-pointer bg-gray-300' }}
              aria-label={toggleItems[2].label} />
          </div>
        </SectionRow>
      </Section>
    {:else if activeNavId === 'mouse-hover'}
      <Section id="mouse-hover" title="鼠标悬停" description="鼠标悬停在段落上时自动翻译。">
        <SectionRow title="触发快捷键" description="选择悬停翻译的组合键">
          <select
            value={config.toggleModes.hoverTrigger}
            onchange={(event) =>
              updateToggleMode('hoverTrigger', (event.currentTarget as HTMLSelectElement).value)}
            class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
            {#each getToggleConfig('hoverTrigger')?.options ?? [] as option}
              <option value={option}>{option}</option>
            {/each}
          </select>
        </SectionRow>
        <SectionRow title="启用状态" description="控制是否允许通过悬停快速翻译当前段落">
          <div class="flex items-center justify-end">
            <Toggle
              bind:checked={toggleItems[1].enabled}
              size="small"
              classes={{ span: 'me-0 cursor-pointer bg-gray-300' }}
              aria-label={toggleItems[1].label} />
          </div>
        </SectionRow>
      </Section>
    {:else if activeNavId === 'floating'}
      <Section id="floating" title="悬浮球" description="页面边缘的快捷翻译悬浮球设置。">
        <SectionRow
          title="当前策略"
          description="悬浮球沿用页面翻译规则，在后续版本中开放独立行为配置。">
          <div
            class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            当前悬浮球不会单独保存开关，而是根据页面翻译状态与站点规则决定显示行为。
          </div>
        </SectionRow>
        <SectionRow
          title="站点规则"
          description="如需调整自动翻译网站，请前往基本设置中的站点列表。">
          <Button color="light" class="w-full rounded-xl shadow-sm">查看站点规则说明</Button>
        </SectionRow>
      </Section>
    {:else if activeNavId === 'shortcuts'}
      <Section id="shortcuts" title="快捷键" description="自定义全局和页面内的快捷键。">
        <SectionRow title="独立翻译窗口" description="全局唤起独立翻译界面的快捷键">
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
      <Section id="advanced" title="高级设置" description="更多底层和实验性功能配置。">
        <SectionRow title="简体中文页面" description="控制是否默认翻译简体中文页面。">
          <div class="flex items-center justify-end">
            <Toggle
              bind:checked={toggleItems[3].enabled}
              size="small"
              classes={{ span: 'me-0 cursor-pointer bg-gray-300' }}
              aria-label={toggleItems[3].label} />
          </div>
        </SectionRow>
        <SectionRow title="实验性功能" description="更多实验开关将在后续版本中逐步加入。">
          <div
            class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            当前仅保留已接入存储模型的高级选项，避免展示无法保存的临时开关。
          </div>
        </SectionRow>
      </Section>
    {:else if activeNavId === 'import-export'}
      <Section id="import-export" title="导入/导出" description="备份或恢复您的所有配置数据。">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
            <h3 class="font-semibold">导出配置</h3>
            <p class="mt-2 text-sm text-slate-500">将当前所有设置保存为文件</p>
            <Button color="light" class="mt-4 w-full rounded-xl shadow-sm">导出</Button>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
            <h3 class="font-semibold">导入配置</h3>
            <p class="mt-2 text-sm text-slate-500">从备份文件中恢复设置</p>
            <Button color="light" class="mt-4 w-full rounded-xl shadow-sm">导入</Button>
          </div>
        </div>
      </Section>
    {:else if activeNavId === 'about'}
      <Section id="about" title="关于" description="了解沉浸式翻译扩展信息。">
        <div class="flex flex-col items-center justify-center py-8">
          <div class="bg-primary-500 mb-4 rounded-2xl p-4 text-white shadow-lg">
            <WandMagicSparklesSolid class="h-10 w-10" />
          </div>
          <h3 class="text-xl font-bold">沉浸式翻译</h3>
          <p class="mt-2 text-slate-500">版本 0.0.1</p>
          <div class="mt-6 flex gap-4">
            <Button color="light" class="rounded-xl shadow-sm">检查更新</Button>
            <Button color="light" class="rounded-xl shadow-sm">官方网站</Button>
          </div>
        </div>
      </Section>
    {:else if activeNavId === 'pricing'}
      <Section
        id="pricing"
        title="价格"
        description="升级 Pro 会员，解锁更多高级功能和优质翻译服务。">
        <div class="border-primary-200 bg-primary-50 rounded-2xl border-2 p-8 text-center">
          <h3 class="text-primary-700 text-2xl font-bold">Pro 会员</h3>
          <p class="text-primary-600/80 mt-2">畅享 DeepL、OpenAI 等顶级翻译服务</p>
          <Button class="mt-6 rounded-xl px-8 py-3 shadow-md">立即升级</Button>
        </div>
      </Section>
    {:else if activeNavId === 'docs'}
      <Section id="docs" title="使用文档" description="查看详细的功能介绍和使用教程。">
        <SectionRow title="官方文档" description="包含所有功能的详细说明和常见问题解答">
          <Button color="light" class="w-full rounded-xl shadow-sm">前往查看</Button>
        </SectionRow>
      </Section>
    {:else if activeNavId === 'changelog'}
      <Section id="changelog" title="更新日志" description="查看最近的版本更新内容和新功能。">
        <div class="space-y-6 border-l-2 border-slate-200 pl-6">
          <div class="relative">
            <div
              class="bg-primary-500 absolute top-1 -left-[31px] h-4 w-4 rounded-full border-4 border-white">
            </div>
            <h3 class="font-semibold">v0.0.1</h3>
            <p class="mt-1 text-sm text-slate-500">2024-01-01</p>
            <ul class="mt-3 list-disc space-y-1 pl-4 text-sm text-slate-600">
              <li>初始版本发布</li>
              <li>支持多种 AI 翻译服务</li>
              <li>支持网页双语对照翻译</li>
            </ul>
          </div>
        </div>
      </Section>
    {:else if activeNavId === 'feedback'}
      <Section id="feedback" title="问题反馈" description="遇到问题或有新想法？欢迎告诉我们。">
        <SectionRow title="提交反馈" description="在 GitHub 上提交 Issue 或加入社区讨论">
          <div class="space-y-3">
            <Button color="light" class="w-full rounded-xl shadow-sm">GitHub Issues</Button>
            <Button color="light" class="w-full rounded-xl shadow-sm">加入 Discord 社区</Button>
          </div>
        </SectionRow>
      </Section>
    {:else if activeNavId === 'developer'}
      <Section id="developer" title="开发者设置" description="供开发者调试和测试的高级选项。">
        <SectionRow title="调试能力" description="当前版本暂未提供单独的开发者调试持久化开关。">
          <div
            class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            如需排查问题，建议通过浏览器扩展管理页、控制台日志和问题反馈入口进行诊断。
          </div>
        </SectionRow>
      </Section>
    {/if}
  </div>
</main>
