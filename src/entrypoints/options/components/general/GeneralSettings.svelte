<script lang="ts">
  import { Avatar, Toggle, Button, Select, Input, Checkbox, Radio, Label } from 'flowbite-svelte';
  import { ChevronRightOutline, ChevronDownOutline } from 'flowbite-svelte-icons';

  import avatar from '@/lib/avatar';
  import { i18n } from '@/lib/i18n';
  import {
    getLanguageLabel,
    providerOptions,
    targetLanguageOptions
  } from '@/entrypoints/popup/data';
  import type { V2OptionsConfig } from '@/entrypoints/options/types';
  import Section from '../Section.svelte';
  import SectionRow from '../SectionRow.svelte';
  import { translationStyleOptions, previewTextEn, previewTextZh } from './data';

  export let config: V2OptionsConfig;
  export let newSite = '';
  export let saveOptions: () => void | Promise<void>;
  export let resetOptions: () => void | Promise<void>;
  export let getProviderModels: (provider: string) => string[];

  const updateField = (key: keyof V2OptionsConfig, value: string) => {
    if (key === 'provider') {
      const nextModels = getProviderModels(value);
      config = { ...config, provider: value, model: nextModels[0] ?? '' };
      return;
    }
    config = { ...config, [key]: value };
  };

  const updateBooleanField = (
    key: 'richTextTranslate' | 'italicTranslate' | 'customFontEnabled',
    value: boolean
  ) => {
    config = { ...config, [key]: value };
  };

  const addSite = () => {
    const site = newSite.trim();
    if (!site || config.alwaysTranslateSites.includes(site)) return;
    config = {
      ...config,
      alwaysTranslateSites: [...config.alwaysTranslateSites, site]
    };
    newSite = '';
  };

  const removeSite = (site: string) => {
    config = {
      ...config,
      alwaysTranslateSites: config.alwaysTranslateSites.filter((item) => item !== site)
    };
  };

  const addRuleItem = (
    key: 'neverTranslateSites' | 'alwaysTranslateLanguages' | 'neverTranslateLanguages',
    value: string
  ) => {
    const next = value.trim();
    if (!next || config[key].includes(next)) return;
    config = { ...config, [key]: [...config[key], next] };
  };

  const getPreviewClass = (value: string) => {
    return translationStyleOptions.find((option) => option.value === value)?.className ?? '';
  };
</script>

<Section id="general" title={i18n('options_general_title', { defaultValue: 'General settings' })}>
  <!-- header buttons -->
  <svelte:fragment slot="header-actions">
    <div class="text-primary-600 flex items-center gap-4 text-sm">
      <button type="button" onclick={saveOptions}
        >{i18n('options_general_header_save', { defaultValue: 'Save settings' })}</button>
      <button type="button" onclick={resetOptions}
        >{i18n('options_general_header_reset', { defaultValue: 'Reset settings' })}</button>
    </div>
  </svelte:fragment>

  <!-- login state -->
  <div
    class="flex items-center justify-between rounded-2xl bg-gray-50 p-6 shadow-inner dark:bg-gray-700">
    <div class="flex items-center gap-4">
      <Avatar
        class="h-14 w-14"
        src={avatar.anylang({
          chars: 1,
          backgroundType: ['gradientLinear']
        })}
        size="lg" />
      <Button class="font-medium"
        >{i18n('options_general_login_button', { defaultValue: 'Log in' })}</Button>
    </div>
    <button type="button" class="text-primary-600 text-sm hover:underline"
      >{i18n('options_general_login_hint', {
        defaultValue: 'Unlock membership after login'
      })}</button>
  </div>

  <!-- target language -->
  <SectionRow
    title={i18n('options_general_target_language_title', { defaultValue: 'Target language' })}
    description={i18n('options_general_target_language_description', {
      defaultValue: 'Set the language you want content translated into'
    })}>
    <Select
      slot="controls"
      value={config.targetLanguage}
      onchange={(event) =>
        updateField('targetLanguage', (event.currentTarget as HTMLSelectElement).value)}>
      {#each targetLanguageOptions as option (option.value)}
        <option value={option.value}>{option.label}</option>
      {/each}
    </Select>
  </SectionRow>

  <!-- translation service -->
  <SectionRow
    title={i18n('options_general_service_title', { defaultValue: 'Translation service' })}
    description={i18n('options_general_service_description', {
      defaultValue: 'Choose a translation service'
    })}>
    <div class="flex w-full flex-col items-end space-y-3" slot="controls">
      <Select
        value={config.provider}
        onchange={(event) =>
          updateField('provider', (event.currentTarget as HTMLSelectElement).value)}>
        {#each providerOptions as option (option)}
          <option value={option}>{option}</option>
        {/each}
      </Select>
      <button class="text-primary-600 w-fit text-sm">
        {i18n('options_general_service_test', { defaultValue: 'Test this service' })}
      </button>
    </div>
  </SectionRow>

  <!-- UI language -->
  <SectionRow
    title={i18n('options_general_ui_language_title', { defaultValue: 'UI language' })}
    description={i18n('options_general_ui_language_description', {
      defaultValue:
        'UI language affects panel display language and does not change translation target language'
    })}>
    <Select
      slot="controls"
      value={config.uiLanguage}
      onchange={(event) =>
        updateField('uiLanguage', (event.currentTarget as HTMLSelectElement).value)}>
      <option value="zh-Hans"
        >{i18n('options_general_ui_language_zh_hans', {
          defaultValue: 'Chinese (Simplified)'
        })}</option>
      <option value="en"
        >{i18n('options_general_ui_language_en', { defaultValue: 'English' })}</option>
    </Select>
  </SectionRow>

  <!-- translation preference -->
  <SectionRow
    title={i18n('options_general_translation_preference_title', {
      defaultValue: 'Translation preference'
    })}
    description={i18n('options_general_translation_preference_description', {
      defaultValue: 'Choose display mode after translation: bilingual or translation-only'
    })}>
    <Select
      slot="controls"
      value={config.translationPreference}
      onchange={(event) =>
        updateField('translationPreference', (event.currentTarget as HTMLSelectElement).value)}>
      <option value="bilingual"
        >{i18n('options_general_preference_bilingual', { defaultValue: 'Bilingual' })}</option>
      <option value="translation_only"
        >{i18n('options_general_preference_translation_only', {
          defaultValue: 'Translation only'
        })}</option>
    </Select>
  </SectionRow>

  <!-- always-translate sites -->
  <SectionRow
    title={i18n('options_general_always_translate_sites_title', {
      defaultValue: 'Always-translate sites'
    })}
    description={i18n('options_general_always_translate_sites_description', {
      defaultValue:
        'When current site matches these domains, content will auto-translate to target language'
    })}>
    <div class="flex gap-2" slot="controls">
      <Input
        type="text"
        bind:value={newSite}
        placeholder={i18n('options_general_site_placeholder', { defaultValue: 'example.com' })} />
      <Button color="secondary" onclick={addSite}
        >{i18n('options_general_add_button', { defaultValue: 'Add' })}</Button>
    </div>
    <svelte:fragment slot="extra-desc">
      <button class="text-primary-600 mt-3 cursor-pointer text-sm">
        {i18n('options_general_batch_ops', { defaultValue: 'Batch operations' })}
      </button>
    </svelte:fragment>
    <div class="space-y-1 rounded-xl bg-gray-50 p-4 shadow-inner dark:bg-gray-700">
      {#each config.alwaysTranslateSites as site (site)}
        <div class="flex items-center justify-between pb-3 last:pb-0">
          <span class="font-medium">{site}</span>
          <div class="text-primary-600 flex items-center gap-4">
            <button type="button"
              >{i18n('options_general_edit_button', { defaultValue: 'Edit' })}</button>
            <button type="button" onclick={() => removeSite(site)}
              >{i18n('options_general_delete_button', { defaultValue: 'Delete' })}</button>
          </div>
        </div>
      {/each}
    </div>
  </SectionRow>

  <!-- never-translate sites -->
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
      color="secondary"
      class="w-full"
      onclick={() => addRuleItem('neverTranslateSites', 'example.com')}>
      {i18n('options_general_add_button', { defaultValue: 'Add' })}
    </Button>
  </SectionRow>

  <!-- always-translate languages -->
  <SectionRow
    title={i18n('options_general_always_translate_languages_title', {
      defaultValue: 'Always-translate languages'
    })}
    description={i18n('options_general_always_translate_languages_description', {
      defaultValue:
        'When page language is one of these languages, content auto-translates to target language. Site rules still take priority on conflicts.'
    })}>
    <Select slot="controls">
      <option>{i18n('options_general_edit_button', { defaultValue: 'Edit' })}</option>
      {#each config.alwaysTranslateLanguages as language (language)}
        <option>{getLanguageLabel(language)}</option>
      {/each}
    </Select>
  </SectionRow>

  <!-- never-translate languages -->
  <SectionRow
    title={i18n('options_general_never_translate_languages_title', {
      defaultValue: 'Never-translate languages'
    })}
    description={i18n('options_general_never_translate_languages_description', {
      defaultValue: 'When a paragraph language is one of these, translation is skipped'
    })}>
    <Select slot="controls">
      <option>{i18n('options_general_edit_button', { defaultValue: 'Edit' })}</option>
      {#each config.neverTranslateLanguages as language (language)}
        <option>{getLanguageLabel(language)}</option>
      {/each}
    </Select>
  </SectionRow>

  <!-- translation style -->
  <SectionRow
    title={i18n('options_general_translation_style_title', {
      defaultValue: 'Translation display style'
    })}
    description={i18n('options_general_translation_style_description', {
      defaultValue: 'Distinguish translated text styles; see examples below'
    })}>
    <Select
      slot="controls"
      value={config.translationStyle}
      onchange={(event) =>
        updateField('translationStyle', (event.currentTarget as HTMLSelectElement).value)}>
      {#each translationStyleOptions as option (option.value)}
        <option value={option.value}>{option.label}</option>
      {/each}
    </Select>
    <div class="mt-3 space-y-3 text-lg">
      <p>{previewTextEn}</p>
      <p class="text-base">{previewTextZh}</p>
    </div>
    <div class="flex flex-col space-y-3 self-end rounded-2xl text-base">
      <!-- custom color and size -->
      <details class="flex w-fit flex-col space-y-3 self-end">
        <summary class="flex w-fit cursor-pointer list-none self-end">
          <span
            >{i18n('options_general_custom_color_size', {
              defaultValue: 'Custom color and size'
            })}</span>
          <ChevronDownOutline class="ms-1 h-6.5 w-6.5" />
        </summary>
        <div class="flex w-fit flex-col space-y-3 self-end">
          <Label class="grid grid-cols-[1fr_140px_80px] items-center gap-4">
            <span>{i18n('options_general_text_color', { defaultValue: 'Text color' })}</span>
            <Input
              value={config.textColor}
              onchange={(event) =>
                updateField('textColor', (event.currentTarget as HTMLInputElement).value)} />
            <Input
              type="color"
              value={config.textColor}
              onchange={(event) =>
                updateField('textColor', (event.currentTarget as HTMLInputElement).value)}
              class="h-full px-1.5 py-1" />
          </Label>
          <Label class="grid grid-cols-[1fr_200px] items-center gap-4">
            <span>{i18n('options_general_font_scale', { defaultValue: 'Font scale (%)' })}:</span>
            <Input
              value={config.fontScale}
              onchange={(event) =>
                updateField('fontScale', (event.currentTarget as HTMLInputElement).value)} />
          </Label>
          <Label class="grid grid-cols-[1fr_200px] items-center gap-4">
            <span>{i18n('options_general_font_weight', { defaultValue: 'Font weight' })}:</span>
            <Input
              value={config.fontWeight}
              onchange={(event) =>
                updateField('fontWeight', (event.currentTarget as HTMLInputElement).value)} />
          </Label>
          <Label class="flex w-fit gap-3 self-end">
            <span>{i18n('options_general_italic', { defaultValue: 'Set italic style' })}</span>
            <Toggle
              checked={config.italicTranslate}
              onchange={(event) =>
                updateBooleanField(
                  'italicTranslate',
                  (event.currentTarget as HTMLInputElement).checked
                )}
              size="small"
              classes={{ span: 'me-0 cursor-pointer' }}
              aria-label={i18n('options_general_italic', { defaultValue: 'Set italic style' })} />
          </Label>
          <button
            type="button"
            class="flex w-fit self-end text-sm text-gray-600 underline dark:text-gray-300"
            >{i18n('options_general_restore_default_color', {
              defaultValue: 'Restore default color'
            })}</button>
        </div>
      </details>

      <!-- set font -->
      <details class="flex w-fit flex-col space-y-3 self-end">
        <summary class="flex w-fit cursor-pointer list-none self-end">
          <span>{i18n('options_general_set_font', { defaultValue: 'Set font' })}</span>
          <ChevronDownOutline class="ms-1 h-6.5 w-6.5" />
        </summary>
        <div class="flex w-fit gap-3 self-end">
          <Checkbox
            class="flex items-center justify-end gap-2"
            checked={config.customFontEnabled}
            onchange={(event) =>
              updateBooleanField(
                'customFontEnabled',
                (event.currentTarget as HTMLInputElement).checked
              )}>
            <span class="text-nowrap"
              >{i18n('options_general_custom_font_input', {
                defaultValue: 'Use custom font'
              })}</span>
          </Checkbox>
          <Select
            value={config.customFontFamily}
            onchange={(event) =>
              updateField('customFontFamily', (event.currentTarget as HTMLSelectElement).value)}>
            <option value="none"
              >{i18n('options_general_style_none', { defaultValue: 'None' })}</option>
            <option value="PingFang SC">PingFang SC</option>
            <option value="Microsoft YaHei">Microsoft YaHei</option>
            <option value="Source Han Sans SC">Source Han Sans SC</option>
          </Select>
        </div>
      </details>

      <!-- preview all styles -->
      <details class="flex w-fit flex-col space-y-3 self-end">
        <summary class="flex w-fit cursor-pointer list-none self-end">
          <span>
            {i18n('options_general_preview_all_styles', {
              defaultValue: 'Preview all styles'
            })}
          </span>
          <ChevronDownOutline class="ms-1 h-6.5 w-6.5" />
        </summary>
        <div class="flex w-fit flex-col gap-3 space-y-7 self-end">
          {#each translationStyleOptions as option (option.value)}
            <Label class="block">
              <div class="flex items-start gap-3">
                <Radio
                  name="translation-style-preview"
                  value={option.value}
                  checked={config.translationStyle === option.value}
                  onchange={() => updateField('translationStyle', option.value)} />
                <div class="flex-1">
                  <div class="font-medium">{option.label}</div>
                  <p
                    class={`mt-2 text-slate-700 dark:text-slate-300 ${getPreviewClass(option.value)} ${config.italicTranslate ? 'italic' : ''}`}
                    style={`color:${config.textColor}; font-size:${config.fontScale}%; font-weight:${config.fontWeight}; font-family:${config.customFontFamily === 'none' ? 'inherit' : config.customFontFamily};`}>
                    {previewTextZh}
                  </p>
                </div>
              </div>
            </Label>
          {/each}
        </div>
      </details>
    </div>
  </SectionRow>

  <!-- similar language bg -->
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
        classes={{ span: 'me-0 cursor-pointer' }}
        aria-label={i18n('options_general_similar_language_bg_aria', {
          defaultValue: 'Add background color when page and target languages are similar'
        })} />
    </div>
  </SectionRow>
</Section>
