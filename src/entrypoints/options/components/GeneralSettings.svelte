<script lang="ts">
  import { Avatar, Toggle, Button } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';

  import avatar from '../../../lib/avatar';
  import { providerOptions, targetLanguageOptions } from '../../popup/data';
  import type { V2OptionsConfig } from '../types';
  import Section from './Section.svelte';
  import SectionRow from './SectionRow.svelte';

  export let config: V2OptionsConfig;
  export let newSite = '';
  export let saveOptions: () => void | Promise<void>;
  export let resetOptions: () => void | Promise<void>;
  export let getProviderModels: (provider: string) => string[];

  const previewTextEn =
    'Night gathers, and now my watch begins. It shall not end until my death. I shall take no wife, hold no lands, father no children.';
  const previewTextZh =
    '长夜将至，我从今开始守望，至死方休。我将不娶妻、不封地、不生子。我将不戴宝冠，不争荣耀。';

  const styleOptions = [
    { label: '无', className: '' },
    {
      label: '虚线下划线',
      className: 'underline decoration-dashed decoration-sky-400 underline-offset-4'
    },
    {
      label: '直线下划线',
      className: 'underline decoration-sky-500 underline-offset-4'
    },
    {
      label: '虚线边框',
      className: 'border border-dashed border-slate-400 px-1 py-0.5'
    },
    { label: '实线边框', className: 'border border-slate-400 px-1 py-0.5' },
    { label: '模糊效果（学习模式）', className: 'blur-[2px]' },
    { label: '透明效果', className: 'opacity-35' },
    {
      label: '点状下划线',
      className: 'underline decoration-dotted decoration-sky-500 underline-offset-4'
    },
    { label: '分割线', className: 'border-l-4 border-primary-400 pl-3' },
    { label: '高亮', className: 'bg-yellow-300 px-1' }
  ];

  function updateField(key: keyof V2OptionsConfig, value: string) {
    if (key === 'provider') {
      const nextModels = getProviderModels(value);
      config = { ...config, provider: value, model: nextModels[0] ?? '' };
      return;
    }
    config = { ...config, [key]: value };
  }

  function updateBooleanField(
    key: 'richTextTranslate' | 'italicTranslate' | 'customFontEnabled',
    value: boolean
  ) {
    config = { ...config, [key]: value };
  }

  function addSite() {
    const site = newSite.trim();
    if (!site || config.alwaysTranslateSites.includes(site)) return;
    config = {
      ...config,
      alwaysTranslateSites: [...config.alwaysTranslateSites, site]
    };
    newSite = '';
  }

  function removeSite(site: string) {
    config = {
      ...config,
      alwaysTranslateSites: config.alwaysTranslateSites.filter((item) => item !== site)
    };
  }

  function addRuleItem(
    key: 'neverTranslateSites' | 'alwaysTranslateLanguages' | 'neverTranslateLanguages',
    value: string
  ) {
    const next = value.trim();
    if (!next || config[key].includes(next)) return;
    config = { ...config, [key]: [...config[key], next] };
  }

  function getPreviewClass(label: string) {
    return styleOptions.find((option) => option.label === label)?.className ?? '';
  }
</script>

<Section id="general" title="基本设置">
  <svelte:fragment slot="header-actions">
    <div class="text-primary-600 flex items-center gap-4 text-sm">
      <button type="button" onclick={saveOptions}>清除缓存</button>
      <button type="button" onclick={resetOptions}>重置设置</button>
    </div>
  </svelte:fragment>

  <div class="flex items-center justify-between rounded-2xl bg-slate-50 p-6 shadow-inner">
    <div class="flex items-center gap-4">
      <Avatar
        class="h-14 w-14"
        src={avatar.anylang({
          chars: 1,
          backgroundType: ['gradientLinear']
        })}
        size="lg" />
      <Button class="border-none font-medium shadow-md">登录</Button>
    </div>
    <button type="button" class="text-primary-600 text-sm hover:underline">登录后可开通会员</button>
  </div>

  <SectionRow title="目标语言" description="指定您希望将内容翻译成的语言">
    <select
      value={config.targetLanguage}
      onchange={(event) =>
        updateField('targetLanguage', (event.currentTarget as HTMLSelectElement).value)}
      class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
      {#each targetLanguageOptions as option (option)}
        <option value={option}>{option}</option>
      {/each}
    </select>
  </SectionRow>

  <SectionRow title="翻译服务" description="选择一项翻译服务">
    <div class="space-y-3">
      <select
        value={config.provider}
        onchange={(event) =>
          updateField('provider', (event.currentTarget as HTMLSelectElement).value)}
        class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
        {#each providerOptions as option (option)}
          <option value={option}>{option}</option>
        {/each}
      </select>
      <div class="text-primary-600 text-right text-sm">点此测试服务</div>
    </div>
  </SectionRow>

  <div class="rounded-2xl bg-slate-50 p-6 shadow-inner">
    <div class="flex items-center justify-between">
      <div class="font-medium text-slate-700">展开更多自定义选项 👉</div>
      <ChevronDownOutline class="h-5 w-5 text-slate-400" />
    </div>
    <div class="mt-5 grid grid-cols-[1fr_auto] items-start gap-6">
      <div>
        <div class="font-medium">启用富文本翻译</div>
        <p class="mt-1 text-sm text-slate-400">开启富文本翻译可保留原文的链接和样式效果</p>
        <button type="button" class="mt-5 text-sm font-medium text-slate-500 underline">
          恢复为默认设置
        </button>
      </div>
      <Toggle
        checked={config.richTextTranslate}
        onchange={(event) =>
          updateBooleanField(
            'richTextTranslate',
            (event.currentTarget as HTMLInputElement).checked
          )}
        size="small"
        classes={{ span: 'me-0 cursor-pointer bg-gray-300' }}
        aria-label="启用富文本翻译" />
    </div>
  </div>

  <SectionRow title="界面语言" description="界面语言设置影响控制面板的显示语言，和翻译的目标语言无关">
    <select
      value={config.uiLanguage}
      onchange={(event) =>
        updateField('uiLanguage', (event.currentTarget as HTMLSelectElement).value)}
      class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
      <option value="简体中文">简体中文</option>
      <option value="English">English</option>
    </select>
  </SectionRow>

  <SectionRow title="翻译偏好" description="选择翻译后的显示方式：双语对照或仅显示译文">
    <select
      value={config.translationPreference}
      onchange={(event) =>
        updateField('translationPreference', (event.currentTarget as HTMLSelectElement).value)}
      class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
      <option value="双语对照">双语对照</option>
      <option value="仅显示译文">仅显示译文</option>
    </select>
  </SectionRow>

  <SectionRow title="总是翻译的网站" description="当网站为下列域名时，会自动翻译为目标语言">
    <svelte:fragment slot="extra-desc">
      <div class="text-primary-600 mt-3 text-sm">批量操作</div>
    </svelte:fragment>
    <div class="flex gap-2">
      <input
        type="text"
        bind:value={newSite}
        placeholder="example.com"
        class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none" />
      <Button color="light" class="border-none shadow-md" onclick={addSite}>添加</Button>
    </div>
    <div class="mt-4 rounded-xl bg-slate-50 p-4 shadow-inner">
      <div class="space-y-3">
        {#each config.alwaysTranslateSites as site (site)}
          <div class="flex items-center justify-between pb-3 last:pb-0">
            <span class="font-medium text-slate-600">{site}</span>
            <div class="text-primary-600 flex items-center gap-4">
              <button type="button">编辑</button>
              <button type="button" onclick={() => removeSite(site)}>删除</button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </SectionRow>

  <SectionRow title="不自动翻译的网站" description="当网站为下列域名时，将不会自动进行翻译。此规则优先于语言设置。">
    <Button
      color="light"
      class="w-full border-none shadow-md"
      onclick={() => addRuleItem('neverTranslateSites', 'example.com')}>
      添加
    </Button>
  </SectionRow>

  <SectionRow title="总是翻译的语言" description="当页面语言为下列语言时，会自动翻译为目标语言。注意：如果“不自动翻译的网站”与此设置冲突，将优先按照网址规则执行。">
    <select
      class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
      <option>编辑</option>
      {#each config.alwaysTranslateLanguages as language (language)}
        <option>{language}</option>
      {/each}
    </select>
  </SectionRow>

  <SectionRow title="永不翻译的语言" description="当页面中某一段落的语言为下列语言时，将跳过翻译">
    <select
      class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
      <option>编辑</option>
      {#each config.neverTranslateLanguages as language (language)}
        <option>{language}</option>
      {/each}
    </select>
  </SectionRow>

  <SectionRow title="译文显示样式" description="区分译文的样式，具体可参考下列示例">
    <svelte:fragment slot="extra-desc">
      <div class="mt-6 space-y-3 text-lg text-slate-700">
        <p>{previewTextEn}</p>
        <p class="text-base text-slate-600">{previewTextZh}</p>
      </div>
    </svelte:fragment>
    <div class="space-y-4">
      <select
        value={config.translationStyle}
        onchange={(event) =>
          updateField('translationStyle', (event.currentTarget as HTMLSelectElement).value)}
        class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
        {#each styleOptions as option (option.label)}
          <option value={option.label}>{option.label}</option>
        {/each}
      </select>
      <div class="rounded-2xl bg-slate-50 p-6 shadow-inner">
        <button
          type="button"
          class="mb-4 flex w-full items-center justify-between text-slate-600">
          <span>自定义颜色和大小</span>
          <span>⌄</span>
        </button>
        <div class="space-y-4">
          <label class="grid grid-cols-[1fr_140px_80px] items-center gap-2">
            <span class="text-slate-600">文字颜色</span>
            <input
              value={config.textColor}
              onchange={(event) =>
                updateField('textColor', (event.currentTarget as HTMLInputElement).value)}
              class="focus:border-primary-400 rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none" />
            <input
              type="color"
              value={config.textColor}
              onchange={(event) =>
                updateField('textColor', (event.currentTarget as HTMLInputElement).value)}
              class="h-[50px] w-full rounded-xl border border-slate-300 bg-white p-2" />
          </label>
          <label class="grid grid-cols-[1fr_200px] items-center gap-4">
            <span class="text-slate-600">字体缩放比例 (%)：</span>
            <input
              value={config.fontScale}
              onchange={(event) =>
                updateField('fontScale', (event.currentTarget as HTMLInputElement).value)}
              class="focus:border-primary-400 rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none" />
          </label>
          <label class="grid grid-cols-[1fr_200px] items-center gap-4">
            <span class="text-slate-600">字体粗细：</span>
            <input
              value={config.fontWeight}
              onchange={(event) =>
                updateField('fontWeight', (event.currentTarget as HTMLInputElement).value)}
              class="focus:border-primary-400 rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none" />
          </label>
          <div class="flex items-center justify-between">
            <span class="text-slate-600">设置为斜体</span>
            <Toggle
              checked={config.italicTranslate}
              onchange={(event) =>
                updateBooleanField(
                  'italicTranslate',
                  (event.currentTarget as HTMLInputElement).checked
                )}
              size="small"
              classes={{
                span: 'me-0 cursor-pointer bg-gray-300'
              }}
              aria-label="设置为斜体" />
          </div>
          <button type="button" class="text-right text-slate-500 underline"
            >恢复为默认颜色</button>
          <button type="button" class="flex w-full items-center justify-between text-slate-600"
            ><span>设置字体</span><span>⌄</span></button>
          <label class="flex items-center justify-end gap-2 text-slate-600">
            <input
              type="checkbox"
              checked={config.customFontEnabled}
              onchange={(event) =>
                updateBooleanField(
                  'customFontEnabled',
                  (event.currentTarget as HTMLInputElement).checked
                )} />
            <span>输入自定义字体</span>
          </label>
          <select
            value={config.customFontFamily}
            onchange={(event) =>
              updateField('customFontFamily', (event.currentTarget as HTMLSelectElement).value)}
            class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
            <option value="无">无</option>
            <option value="PingFang SC">PingFang SC</option>
            <option value="Microsoft YaHei">Microsoft YaHei</option>
            <option value="Source Han Sans SC">Source Han Sans SC</option>
          </select>
          <button type="button" class="flex w-full items-center justify-between text-slate-600"
            ><span>预览全部样式</span><span>⌄</span></button>
        </div>
      </div>
    </div>
  </SectionRow>

  <div class="space-y-7">
    {#each styleOptions as option (option.label)}
      <label class="block">
        <div class="flex items-start gap-3">
          <input
            type="radio"
            name="translation-style-preview"
            value={option.label}
            checked={config.translationStyle === option.label}
            onchange={() => updateField('translationStyle', option.label)}
            class="accent-primary-500 mt-1 h-5 w-5" />
          <div class="flex-1">
            <div class="font-medium">{option.label}</div>
            <p
              class={`mt-2 text-slate-700 ${getPreviewClass(option.label)} ${config.italicTranslate ? 'italic' : ''}`}
              style={`color:${config.textColor}; font-size:${config.fontScale}%; font-weight:${config.fontWeight}; font-family:${config.customFontFamily === '无' ? 'inherit' : config.customFontFamily};`}>
              {previewTextZh}
            </p>
          </div>
        </div>
      </label>
    {/each}
  </div>

  <SectionRow title="当页面语言和目标语言为相近语言时，为译文添加背景色" description="当页面语言和目标语言为相近语言时，通过给译文添加背景色来区分原文，方便对照阅读。">
    <div class="flex items-center justify-end">
      <Toggle
        checked={config.richTextTranslate}
        onchange={(event) =>
          updateBooleanField(
            'richTextTranslate',
            (event.currentTarget as HTMLInputElement).checked
          )}
        size="small"
        classes={{ span: 'me-0 cursor-pointer bg-gray-300' }}
        aria-label="当页面语言和目标语言为相近语言时，为译文添加背景色" />
    </div>
  </SectionRow>
</Section>
