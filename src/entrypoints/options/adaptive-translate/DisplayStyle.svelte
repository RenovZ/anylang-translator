<script lang="ts">
  import { Input, Label, Select } from 'flowbite-svelte';
  import { twMerge } from 'tailwind-merge';
  import { css } from '@codemirror/lang-css';

  import CodeMirrorWrapper from '@/components/CodeMirrorWrapper.svelte';
  import DisplayStyle from '@/components/DisplayStyle.svelte';
  import SectionRow from '@/components/SectionRow.svelte';
  import { toast } from '@/components/toast-wrapper';
  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import logger from '@/lib/logger';
  import { decorateTranslationNode } from '@/lib/translate/ui';
  import { BLOCK_CONTENT_CLASS, CONTENT_WRAPPER_CLASS, TRANS_STYLE_ATTR } from '@/preset/dom';
  import {
    defaultCustomDisplayStyles,
    fontFamilyOptions,
    MAX_CUSTOM_CSS_LENGTH,
    PREVIEW_TEXT_MAP
  } from '@/preset/translate';
  import { displayStyleSchema, type CustomDisplayStyle } from '@/types/translate';

  let previewRef: HTMLElement | undefined;
  const displayStyle = $derived($config.adaptiveTranslate.translate.displayStyle);
  $effect(() => {
    if (!previewRef) return;
    void decorateTranslationNode(previewRef, displayStyle);
  });

  const customStyles = $derived(
    $config.adaptiveTranslate.translate.displayStyle.preset === 'custom'
      ? {
          ...defaultCustomDisplayStyles,
          ...$config.adaptiveTranslate.translate.displayStyle.customStyles
        }
      : null
  );

  const setCustomStyle = (key: keyof CustomDisplayStyle, value: string | number) => {
    if (displayStyle.preset !== 'custom') return;

    const current = $config.adaptiveTranslate.translate.displayStyle;
    const styles = { ...current.customStyles, [key]: value };
    const { success, data, error } = displayStyleSchema.safeParse({ ...current, styles });
    if (!success) {
      logger.error('Failed to update custom display style: ', { error });
      toast.error(i18n('display_style_invalid', { defaultValue: 'Invalid display style' }));
      return;
    }

    $config.adaptiveTranslate.translate.displayStyle = { ...data };
  };

  // const previewStyles = (node: HTMLElement, styles: CustomDisplayStyle | undefined) => {
  //   const apply = (s: CustomDisplayStyle | undefined) => {
  //     if (!s) return;
  //     const css: Record<string, string> = {};
  //     for (const [k, v] of Object.entries(s)) {
  //       let val = String(v);
  //       if (k === 'fontSize' && /^\d+$/.test(val)) val += 'px';
  //       css[k] = val;
  //     }
  //     Object.assign(node.style, css);
  //   };
  //   if (styles) apply(styles);
  //   return {
  //     update(newStyles: CustomDisplayStyle) {
  //       node.style.cssText = '';
  //       if (newStyles) apply(newStyles);
  //     }
  //   };
  // };

  // const previewAttributes = (node: HTMLElement, attributes: Record<string, string> | undefined) => {
  //   const apply = (attrs: Record<string, string> | undefined) => {
  //     if (attrs) Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  //   };
  //   const clear = (attrs: Record<string, string> | undefined) => {
  //     if (attrs) Object.keys(attrs).forEach((k) => node.removeAttribute(k));
  //   };
  //   apply(attributes);
  //   return {
  //     update(newAttributes: Record<string, string> | undefined) {
  //       clear(attributes);
  //       attributes = newAttributes;
  //       apply(newAttributes);
  //     }
  //   };
  // };
</script>

<SectionRow
  title={i18n('translate_display_styles', {
    defaultValue: 'Translate Display Style'
  })}
  description={i18n('translate_display_styles_description', {
    defaultValue: 'Set any style you want to distinguish translation results from original text'
  })}>
  <div slot="controls">
    <DisplayStyle />
  </div>

  {#if displayStyle.preset === 'css'}
    <div class="mt-4">
      <CodeMirrorWrapper
        class="rounded-xl bg-gray-50 shadow-inner dark:bg-gray-600"
        lang={css()}
        placeholder={`/* ${i18n('display_mode_custom_css_placeholder', { defaultValue: 'Example Css' })} */
[data-${TRANS_STYLE_ATTR}='css'] {
  color: black;
  background-color: color-mix(in srgb, #9d8189 20%, transparent);
  padding: 2px 4px;
  border-radius: 8px;
}`}
        value={displayStyle.customCss ?? ''}
        onchange={(v) => {
          if ((v?.length ?? 0) > MAX_CUSTOM_CSS_LENGTH) {
            toast.error(
              i18n('display_style_custom_css_too_long', { defaultValue: 'Custom CSS is too long' })
            );
            return;
          }

          $config.adaptiveTranslate.translate.displayStyle = {
            ...$config.adaptiveTranslate.translate.displayStyle,
            customCss: v || undefined
          };
        }} />
      <p class="text-right text-xs text-slate-400 dark:text-slate-500">
        {displayStyle.customCss?.length ?? 0} / {MAX_CUSTOM_CSS_LENGTH}
      </p>
    </div>
  {/if}

  {#if displayStyle.preset === 'custom' && customStyles}
    <div class="mt-4 space-y-3 rounded-xl bg-gray-50 p-4 shadow-inner dark:bg-gray-700">
      <Label class="grid grid-cols-[1fr_140px_80px] items-center gap-4">
        <span>{i18n('background_color', { defaultValue: 'Background color' })}</span>
        <Input
          class="border-none bg-gray-50 shadow dark:bg-gray-600"
          type="text"
          value={customStyles.backgroundColor}
          onchange={(e) => setCustomStyle('backgroundColor', e.currentTarget.value)} />
        <Input
          type="color"
          value={customStyles.backgroundColor}
          onchange={(e) => setCustomStyle('backgroundColor', e.currentTarget.value)}
          class="h-full border-none bg-gray-50 px-1.5 py-1 shadow dark:bg-gray-600" />
      </Label>
      <Label class="grid grid-cols-[1fr_140px_80px] items-center gap-4">
        <span>{i18n('text_color', { defaultValue: 'Text color' })}</span>
        <Input
          class="border-none bg-gray-50 shadow dark:bg-gray-600"
          type="text"
          value={customStyles.color}
          onchange={(e) => setCustomStyle('color', e.currentTarget.value)} />
        <Input
          type="color"
          value={customStyles.color}
          onchange={(e) => setCustomStyle('color', e.currentTarget.value)}
          class="h-full border-none bg-gray-50 px-1.5 py-1 shadow dark:bg-gray-600" />
      </Label>
      <Label class="grid grid-cols-[1fr_200px] items-center gap-4">
        <span>{i18n('font_size', { defaultValue: 'Font size (px)' })}</span>
        <Input
          class="border-none bg-gray-50 shadow dark:bg-gray-600"
          type="number"
          value={parseInt(customStyles.fontSize, 10)}
          onchange={(e) =>
            setCustomStyle('fontSize', (parseInt(e.currentTarget.value, 10) || 16) + 'px')} />
      </Label>
      <Label class="grid grid-cols-[1fr_200px] items-center gap-4">
        <span>{i18n('font_weight', { defaultValue: 'Font weight' })}</span>
        <Input
          class="border-none bg-gray-50 shadow dark:bg-gray-600"
          type="number"
          value={customStyles.fontWeight}
          onchange={(e) =>
            setCustomStyle('fontWeight', parseInt(e.currentTarget.value, 10) || 400)} />
      </Label>
      <Label class="grid grid-cols-[1fr_200px] items-center gap-4">
        <span>{i18n('font_family', { defaultValue: 'Font family' })}</span>
        <Select
          classes={{ select: 'border-none bg-gray-50 shadow dark:bg-gray-600' }}
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

  <div class={twMerge('mt-3 space-y-3 text-lg', CONTENT_WRAPPER_CLASS)}>
    <p>{PREVIEW_TEXT_MAP.en}</p>
    <!-- <p
      use:previewStyles={$config.adaptiveTranslate.translate.displayStyle.styles}
      use:previewAttributes={$config.adaptiveTranslate.translate.displayStyle.attributes}>
      {previewTextZh}
    </p> -->
    <p class={BLOCK_CONTENT_CLASS} bind:this={previewRef}>
      {PREVIEW_TEXT_MAP['zh-CN']}
    </p>
  </div>
</SectionRow>
