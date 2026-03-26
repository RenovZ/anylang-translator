<script lang="ts">
  import { Avatar, Toggle, Button } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';

  import avatar from '../../../lib/avatar';
  import { i18n } from '../../../lib/i18n';
  import {
    getLanguageLabel,
    providerOptions,
    targetLanguageOptions,
    type LocalizedOption
  } from '../../popup/data';
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
    'Long night is coming, and now my watch begins. It shall not end until my death. I shall take no wife, hold no lands, father no children.';

  const translationStyleOptions: Array<LocalizedOption & { className: string }> = [
    {
      value: 'none',
      label: i18n('options_general_style_none', { defaultValue: 'None' }),
      className: ''
    },
    {
      value: 'dashed_underline',
      label: i18n('options_general_style_dashed_underline', { defaultValue: 'Dashed underline' }),
      className: 'underline decoration-dashed decoration-sky-400 underline-offset-4'
    },
    {
      value: 'solid_underline',
      label: i18n('options_general_style_solid_underline', { defaultValue: 'Solid underline' }),
      className: 'underline decoration-sky-500 underline-offset-4'
    },
    {
      value: 'dashed_border',
      label: i18n('options_general_style_dashed_border', { defaultValue: 'Dashed border' }),
      className: 'border border-dashed border-slate-400 px-1 py-0.5'
    },
    {
      value: 'solid_border',
      label: i18n('options_general_style_solid_border', { defaultValue: 'Solid border' }),
      className: 'border border-slate-400 px-1 py-0.5'
    },
    {
      value: 'blur_learning',
      label: i18n('options_general_style_blur_learning', { defaultValue: 'Blur (learning mode)' }),
      className: 'blur-[2px]'
    },
    {
      value: 'transparent',
      label: i18n('options_general_style_transparent', { defaultValue: 'Transparent' }),
      className: 'opacity-35'
    },
    {
      value: 'dotted_underline',
      label: i18n('options_general_style_dotted_underline', { defaultValue: 'Dotted underline' }),
      className: 'underline decoration-dotted decoration-sky-500 underline-offset-4'
    },
    {
      value: 'divider',
      label: i18n('options_general_style_divider', { defaultValue: 'Divider' }),
      className: 'border-l-4 border-primary-400 pl-3'
    },
    {
      value: 'highlight',
      label: i18n('options_general_style_highlight', { defaultValue: 'Highlight' }),
      className: 'bg-yellow-300 px-1'
    }
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

  function getPreviewClass(value: string) {
    return translationStyleOptions.find((option) => option.value === value)?.className ?? '';
  }
</script>

<Section id="general" title={i18n('options_general_title', { defaultValue: 'General settings' })}>
  <svelte:fragment slot="header-actions">
    <div class="text-primary-600 flex items-center gap-4 text-sm">
      <button type="button" onclick={saveOptions}
        >{i18n('options_general_header_clear_cache', { defaultValue: 'Clear cache' })}</button>
      <button type="button" onclick={resetOptions}
        >{i18n('options_general_header_reset', { defaultValue: 'Reset settings' })}</button>
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
      <Button class="border-none font-medium shadow-md"
        >{i18n('options_general_login_button', { defaultValue: 'Log in' })}</Button>
    </div>
    <button type="button" class="text-primary-600 text-sm hover:underline"
      >{i18n('options_general_login_hint', {
        defaultValue: 'Unlock membership after login'
      })}</button>
  </div>

  <SectionRow
    title={i18n('options_general_target_language_title', { defaultValue: 'Target language' })}
    description={i18n('options_general_target_language_description', {
      defaultValue: 'Set the language you want content translated into'
    })}>
    <select
      slot="controls"
      value={config.targetLanguage}
      onchange={(event) =>
        updateField('targetLanguage', (event.currentTarget as HTMLSelectElement).value)}
      class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
      {#each targetLanguageOptions as option (option.value)}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </SectionRow>

  <SectionRow
    title={i18n('options_general_service_title', { defaultValue: 'Translation service' })}
    description={i18n('options_general_service_description', {
      defaultValue: 'Choose a translation service'
    })}>
    <div class="space-y-3" slot="controls">
      <select
        value={config.provider}
        onchange={(event) =>
          updateField('provider', (event.currentTarget as HTMLSelectElement).value)}
        class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
        {#each providerOptions as option (option)}
          <option value={option}>{option}</option>
        {/each}
      </select>
      <div class="text-primary-600 text-right text-sm">
        {i18n('options_general_service_test', { defaultValue: 'Test this service' })}
      </div>
    </div>
  </SectionRow>

  <SectionRow
    title={i18n('options_general_ui_language_title', { defaultValue: 'UI language' })}
    description={i18n('options_general_ui_language_description', {
      defaultValue:
        'UI language affects panel display language and does not change translation target language'
    })}>
    <select
      slot="controls"
      value={config.uiLanguage}
      onchange={(event) =>
        updateField('uiLanguage', (event.currentTarget as HTMLSelectElement).value)}
      class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
      <option value="zh-Hans"
        >{i18n('options_general_ui_language_zh_hans', {
          defaultValue: 'Chinese (Simplified)'
        })}</option>
      <option value="en"
        >{i18n('options_general_ui_language_en', { defaultValue: 'English' })}</option>
    </select>
  </SectionRow>

  <SectionRow
    title={i18n('options_general_translation_preference_title', {
      defaultValue: 'Translation preference'
    })}
    description={i18n('options_general_translation_preference_description', {
      defaultValue: 'Choose display mode after translation: bilingual or translation-only'
    })}>
    <select
      slot="controls"
      value={config.translationPreference}
      onchange={(event) =>
        updateField('translationPreference', (event.currentTarget as HTMLSelectElement).value)}
      class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
      <option value="bilingual"
        >{i18n('options_general_preference_bilingual', { defaultValue: 'Bilingual' })}</option>
      <option value="translation_only"
        >{i18n('options_general_preference_translation_only', {
          defaultValue: 'Translation only'
        })}</option>
    </select>
  </SectionRow>

  <SectionRow
    title={i18n('options_general_always_translate_sites_title', {
      defaultValue: 'Always-translate sites'
    })}
    description={i18n('options_general_always_translate_sites_description', {
      defaultValue:
        'When current site matches these domains, content will auto-translate to target language'
    })}>
    <svelte:fragment slot="extra-desc">
      <div class="text-primary-600 mt-3 text-sm">
        {i18n('options_general_batch_ops', { defaultValue: 'Batch operations' })}
      </div>
    </svelte:fragment>
    <div class="flex gap-2" slot="controls">
      <input
        type="text"
        bind:value={newSite}
        placeholder={i18n('options_general_site_placeholder', { defaultValue: 'example.com' })}
        class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none" />
      <Button color="light" class="border-none shadow-md" onclick={addSite}
        >{i18n('options_general_add_button', { defaultValue: 'Add' })}</Button>
    </div>
    <div class="mt-4 rounded-xl bg-slate-50 p-4 shadow-inner">
      <div class="space-y-3">
        {#each config.alwaysTranslateSites as site (site)}
          <div class="flex items-center justify-between pb-3 last:pb-0">
            <span class="font-medium text-slate-600">{site}</span>
            <div class="text-primary-600 flex items-center gap-4">
              <button type="button"
                >{i18n('options_general_edit_button', { defaultValue: 'Edit' })}</button>
              <button type="button" onclick={() => removeSite(site)}
                >{i18n('options_general_delete_button', { defaultValue: 'Delete' })}</button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </SectionRow>

  <SectionRow
    title={i18n('options_general_never_translate_sites_title', {
      defaultValue: 'Never auto-translate sites'
    })}
    description={i18n('options_general_never_translate_sites_description', {
      defaultValue:
        'When current site matches these domains, auto-translation is disabled. This rule has higher priority than language rules.'
    })}>
    <Button
      slot="controls"
      color="light"
      class="w-full border-none shadow-md"
      onclick={() => addRuleItem('neverTranslateSites', 'example.com')}>
      {i18n('options_general_add_button', { defaultValue: 'Add' })}
    </Button>
  </SectionRow>

  <SectionRow
    title={i18n('options_general_always_translate_languages_title', {
      defaultValue: 'Always-translate languages'
    })}
    description={i18n('options_general_always_translate_languages_description', {
      defaultValue:
        'When page language is one of these languages, content auto-translates to target language. Site rules still take priority on conflicts.'
    })}>
    <select
      slot="controls"
      class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
      <option>{i18n('options_general_edit_button', { defaultValue: 'Edit' })}</option>
      {#each config.alwaysTranslateLanguages as language (language)}
        <option>{getLanguageLabel(language)}</option>
      {/each}
    </select>
  </SectionRow>

  <SectionRow
    title={i18n('options_general_never_translate_languages_title', {
      defaultValue: 'Never-translate languages'
    })}
    description={i18n('options_general_never_translate_languages_description', {
      defaultValue: 'When a paragraph language is one of these, translation is skipped'
    })}>
    <select
      slot="controls"
      class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
      <option>{i18n('options_general_edit_button', { defaultValue: 'Edit' })}</option>
      {#each config.neverTranslateLanguages as language (language)}
        <option>{getLanguageLabel(language)}</option>
      {/each}
    </select>
  </SectionRow>

  <SectionRow
    title={i18n('options_general_translation_style_title', {
      defaultValue: 'Translation display style'
    })}
    description={i18n('options_general_translation_style_description', {
      defaultValue: 'Distinguish translated text styles; see examples below'
    })}>
    <svelte:fragment slot="controls">
      <select
        value={config.translationStyle}
        onchange={(event) =>
          updateField('translationStyle', (event.currentTarget as HTMLSelectElement).value)}
        class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
        {#each translationStyleOptions as option (option.value)}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </svelte:fragment>
    <div class="mt-3 space-y-3 text-lg text-slate-700">
      <p>{previewTextEn}</p>
      <p class="text-base text-slate-600">{previewTextZh}</p>
    </div>
    <div class="rounded-2xl bg-slate-50 p-6 shadow-inner">
      <button type="button" class="mb-4 flex w-full items-center justify-between text-slate-600">
        <span
          >{i18n('options_general_custom_color_size', {
            defaultValue: 'Custom color and size'
          })}</span>
        <span>⌄</span>
      </button>
      <div class="space-y-4">
        <label class="grid grid-cols-[1fr_140px_80px] items-center gap-2">
          <span class="text-slate-600"
            >{i18n('options_general_text_color', { defaultValue: 'Text color' })}</span>
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
            class="h-12.5 w-full rounded-xl border border-slate-300 bg-white p-2" />
        </label>
        <label class="grid grid-cols-[1fr_200px] items-center gap-4">
          <span class="text-slate-600"
            >{i18n('options_general_font_scale', { defaultValue: 'Font scale (%)' })}:</span>
          <input
            value={config.fontScale}
            onchange={(event) =>
              updateField('fontScale', (event.currentTarget as HTMLInputElement).value)}
            class="focus:border-primary-400 rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none" />
        </label>
        <label class="grid grid-cols-[1fr_200px] items-center gap-4">
          <span class="text-slate-600"
            >{i18n('options_general_font_weight', { defaultValue: 'Font weight' })}:</span>
          <input
            value={config.fontWeight}
            onchange={(event) =>
              updateField('fontWeight', (event.currentTarget as HTMLInputElement).value)}
            class="focus:border-primary-400 rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none" />
        </label>
        <div class="flex items-center justify-between">
          <span class="text-slate-600"
            >{i18n('options_general_italic', { defaultValue: 'Set italic style' })}</span>
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
            aria-label={i18n('options_general_italic', { defaultValue: 'Set italic style' })} />
        </div>
        <button type="button" class="text-right text-slate-500 underline"
          >{i18n('options_general_restore_default_color', {
            defaultValue: 'Restore default color'
          })}</button>
        <button type="button" class="flex w-full items-center justify-between text-slate-600"
          ><span>{i18n('options_general_set_font', { defaultValue: 'Set font' })}</span><span
            >⌄</span
          ></button>
        <label class="flex items-center justify-end gap-2 text-slate-600">
          <input
            type="checkbox"
            checked={config.customFontEnabled}
            onchange={(event) =>
              updateBooleanField(
                'customFontEnabled',
                (event.currentTarget as HTMLInputElement).checked
              )} />
          <span
            >{i18n('options_general_custom_font_input', {
              defaultValue: 'Use custom font'
            })}</span>
        </label>
        <select
          value={config.customFontFamily}
          onchange={(event) =>
            updateField('customFontFamily', (event.currentTarget as HTMLSelectElement).value)}
          class="focus:border-primary-400 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition outline-none">
          <option value="none"
            >{i18n('options_general_style_none', { defaultValue: 'None' })}</option>
          <option value="PingFang SC">PingFang SC</option>
          <option value="Microsoft YaHei">Microsoft YaHei</option>
          <option value="Source Han Sans SC">Source Han Sans SC</option>
        </select>
        <button type="button" class="flex w-full items-center justify-between text-slate-600"
          ><span
            >{i18n('options_general_preview_all_styles', {
              defaultValue: 'Preview all styles'
            })}</span
          ><span>⌄</span></button>
      </div>
    </div>
    <div class="space-y-7">
      {#each translationStyleOptions as option (option.value)}
        <label class="block">
          <div class="flex items-start gap-3">
            <input
              type="radio"
              name="translation-style-preview"
              value={option.value}
              checked={config.translationStyle === option.value}
              onchange={() => updateField('translationStyle', option.value)}
              class="accent-primary-500 mt-1 h-5 w-5" />
            <div class="flex-1">
              <div class="font-medium">{option.label}</div>
              <p
                class={`mt-2 text-slate-700 ${getPreviewClass(option.value)} ${config.italicTranslate ? 'italic' : ''}`}
                style={`color:${config.textColor}; font-size:${config.fontScale}%; font-weight:${config.fontWeight}; font-family:${config.customFontFamily === 'none' ? 'inherit' : config.customFontFamily};`}>
                {previewTextZh}
              </p>
            </div>
          </div>
        </label>
      {/each}
    </div>
  </SectionRow>

  <SectionRow
    title={i18n('options_general_similar_language_bg_title', {
      defaultValue: 'Add background color when page and target languages are similar'
    })}
    description={i18n('options_general_similar_language_bg_description', {
      defaultValue:
        'When page and target languages are similar, add a background to translated text for easier side-by-side reading.'
    })}>
    <div class="flex items-center justify-end" slot="controls">
      <Toggle
        checked={config.richTextTranslate}
        onchange={(event) =>
          updateBooleanField(
            'richTextTranslate',
            (event.currentTarget as HTMLInputElement).checked
          )}
        size="small"
        classes={{ span: 'me-0 cursor-pointer bg-gray-300' }}
        aria-label={i18n('options_general_similar_language_bg_aria', {
          defaultValue: 'Add background color when page and target languages are similar'
        })} />
    </div>
  </SectionRow>
</Section>
