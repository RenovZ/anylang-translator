<script lang="ts">
  import { browser, type PublicPath } from 'wxt/browser';
  import {
    Avatar,
    Toggle,
    Button,
    Select,
    Input,
    Checkbox,
    Radio,
    Label,
    Dropdown,
    DropdownItem,
    Tooltip
  } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';

  import { config, type TranslationDisplayStyleCustom } from '@/lib/config';
  import { lang } from '@/lib/lang';
  import avatar from '@/lib/avatar';
  import { i18n } from '@/lib/i18n';
  import { languageOptions } from '@/lib/data';
  import Section from '../Section.svelte';
  import SectionRow from '../SectionRow.svelte';
  import { translationDisplayStyles, fontFamilyOptions } from '@/lib/preset';

  const previewTextEn =
    'Night gathers, and now my watch begins. It shall not end until my death. I shall take no wife, hold no lands, father no children.';
  const previewTextZh =
    '长夜将至，我从今开始守望，至死方休。我将不娶妻、不封地、不生子。我将不戴宝冠，不争荣宠。我将尽忠职守，生死于斯。';

  const previewStyles = (
    node: HTMLElement,
    styles: Record<string, string> | TranslationDisplayStyleCustom
  ) => {
    const apply = (s: Record<string, string> | TranslationDisplayStyleCustom) => {
      const css: Record<string, string> = {};
      for (const [k, v] of Object.entries(s)) {
        let val = String(v);
        if (k === 'fontSize' && /^\d+$/.test(val)) val += 'px';
        css[k] = val;
      }
      Object.assign(node.style, css);
    };
    if (styles) apply(styles);
    return {
      update(newStyles: Record<string, string> | TranslationDisplayStyleCustom) {
        node.style.cssText = '';
        if (newStyles) apply(newStyles);
      }
    };
  };

  const defaultCustomStyles: TranslationDisplayStyleCustom = {
    backgroundColor: '#f3f4f6',
    color: 'inherit',
    fontSize: '14px',
    fontWeight: 400,
    fontFamily: '',
    borderRadius: '4px',
    padding: '4px 8px'
  };

  const customStyles = $derived(
    $config.translationDisplayStyle.value === 'custom'
      ? {
          ...defaultCustomStyles,
          ...($config.translationDisplayStyle.styles as TranslationDisplayStyleCustom)
        }
      : null
  );

  const setCustomStyle = (key: keyof TranslationDisplayStyleCustom, value: string | number) => {
    const current = $config.translationDisplayStyle;
    $config.translationDisplayStyle = {
      ...current,
      styles: { ...(current.styles as TranslationDisplayStyleCustom), [key]: value }
    };
  };

  const previewAttributes = (node: HTMLElement, attributes: Record<string, string> | undefined) => {
    const apply = (attrs: Record<string, string> | undefined) => {
      if (attrs) Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    };
    const clear = (attrs: Record<string, string> | undefined) => {
      if (attrs) Object.keys(attrs).forEach((k) => node.removeAttribute(k));
    };
    apply(attributes);
    return {
      update(newAttributes: Record<string, string> | undefined) {
        clear(attributes);
        attributes = newAttributes;
        apply(newAttributes);
      }
    };
  };

  const hoverCssUrl = browser.runtime.getURL('/contentScript/css/styles.css' as PublicPath);
</script>

<svelte:head>
  <link rel="stylesheet" href={hoverCssUrl} />
</svelte:head>

<SectionRow
  title={i18n('translation_display_styles', {
    defaultValue: 'Translation display styles'
  })}
  description={i18n('translation_display_styles_hint', {
    defaultValue: 'Distinguish translated text styles; see examples below'
  })}>
  <div slot="controls">
    <Button
      class="w-full justify-between rounded-xl bg-slate-100 px-3 py-2 text-slate-900 hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600">
      <span>
        {translationDisplayStyles.find(
          (item) => item.value === $config.translationDisplayStyle.value
        )?.label ?? translationDisplayStyles[0].label}
      </span>
      <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
    </Button>
    <Dropdown simple placement="bottom-end" class="max-h-80 overflow-y-auto shadow-md">
      {#each translationDisplayStyles as item (item)}
        <DropdownItem
          onclick={() => {
            if (item.value === 'custom') {
              console.log(item);
              const currentStyles = $config.translationDisplayStyle.styles;
              const isCustom =
                $config.translationDisplayStyle.value === 'custom' &&
                currentStyles &&
                typeof currentStyles === 'object' &&
                'fontSize' in currentStyles;
              const styles = isCustom
                ? (currentStyles as TranslationDisplayStyleCustom)
                : { ...defaultCustomStyles };
              $config.translationDisplayStyle = { value: 'custom', label: item.label, styles };
              return;
            }

            $config.translationDisplayStyle = { ...item };
          }}>
          {item.label}
        </DropdownItem>
      {/each}
    </Dropdown>
  </div>

  {#if customStyles}
    <div class="mt-4 space-y-3 rounded-xl bg-gray-50 p-4 shadow-inner dark:bg-gray-700">
      <Label class="grid grid-cols-[1fr_140px_80px] items-center gap-4">
        <span>{i18n('background_color', { defaultValue: 'Background color' })}</span>
        <Input
          type="text"
          value={customStyles.backgroundColor}
          onchange={(e) => setCustomStyle('backgroundColor', e.currentTarget.value)} />
        <Input
          type="color"
          value={customStyles.backgroundColor}
          onchange={(e) => setCustomStyle('backgroundColor', e.currentTarget.value)}
          class="h-full px-1.5 py-1" />
      </Label>
      <Label class="grid grid-cols-[1fr_140px_80px] items-center gap-4">
        <span>{i18n('text_color', { defaultValue: 'Text color' })}</span>
        <Input
          type="text"
          value={customStyles.color}
          onchange={(e) => setCustomStyle('color', e.currentTarget.value)} />
        <Input
          type="color"
          value={customStyles.color}
          onchange={(e) => setCustomStyle('color', e.currentTarget.value)}
          class="h-full px-1.5 py-1" />
      </Label>
      <Label class="grid grid-cols-[1fr_200px] items-center gap-4">
        <span>{i18n('font_size', { defaultValue: 'Font size (px)' })}</span>
        <Input
          type="number"
          value={parseInt(customStyles.fontSize, 10)}
          onchange={(e) =>
            setCustomStyle('fontSize', (parseInt(e.currentTarget.value, 10) || 16) + 'px')} />
      </Label>
      <Label class="grid grid-cols-[1fr_200px] items-center gap-4">
        <span>{i18n('font_weight', { defaultValue: 'Font weight' })}</span>
        <Input
          type="number"
          value={customStyles.fontWeight}
          onchange={(e) =>
            setCustomStyle('fontWeight', parseInt(e.currentTarget.value, 10) || 400)} />
      </Label>
      <Label class="grid grid-cols-[1fr_200px] items-center gap-4">
        <span>{i18n('font_family', { defaultValue: 'Font family' })}</span>
        <Select
          value={customStyles?.fontFamily ?? ''}
          onchange={(e) =>
            setCustomStyle('fontFamily', (e.currentTarget as HTMLSelectElement).value)}>
          {#each fontFamilyOptions as option (option.value)}
            <option value={option.value}>{option.label}</option>
          {/each}
        </Select>
      </Label>
    </div>
  {/if}

  <div class="mt-3 space-y-3 text-lg">
    <p>{previewTextEn}</p>
    <p
      use:previewStyles={$config.translationDisplayStyle.styles}
      use:previewAttributes={$config.translationDisplayStyle.attributes}>
      {previewTextZh}
    </p>
  </div>
</SectionRow>
