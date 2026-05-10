import i18n from '@/lib/i18n';
import type { DisplayStyle } from '@/types/translate';

const DISPLAY_STYLES = [
  {
    value: 'none',
    label: i18n('display_style_none', { defaultValue: 'None' }),
    styles: {}
  },
  {
    value: 'dashed_underline',
    label: i18n('display_style_dashed_underline', { defaultValue: 'Dotted lines' }),
    styles: {
      textDecorationLine: 'underline',
      textDecorationStyle: 'dashed',
      textDecorationColor: '#38bdf8',
      textUnderlineOffset: '4px'
    }
  },
  {
    value: 'solid_underline',
    label: i18n('display_style_solid_underline', { defaultValue: 'Straight line' }),
    styles: {
      textDecorationLine: 'underline',
      textDecorationStyle: 'solid',
      textDecorationColor: '#0ea5e9',
      textUnderlineOffset: '4px'
    }
  },
  {
    value: 'wavy_lines',
    label: i18n('display_style_wavy_lines', { defaultValue: 'Wavy Lines' }),
    styles: {
      textDecorationLine: 'underline',
      textDecorationStyle: 'wavy',
      textDecorationColor: '#38bdf8',
      textUnderlineOffset: '4px'
    }
  },
  {
    value: 'weaken',
    label: i18n('display_style_weaken', { defaultValue: 'Weaken' }),
    styles: {
      color: '#9ca3af'
    }
  },
  {
    value: 'shadow_effect',
    label: i18n('display_style_shadow_effect', {
      defaultValue: 'Shadow effect'
    }),
    styles: {
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      padding: '12px',
      margin: '2px'
    }
  },
  {
    value: 'mark',
    label: i18n('display_style_mark', { defaultValue: 'Mark' }),
    styles: {
      backgroundColor: '#fde047',
      padding: '0px 4px'
    }
  },
  {
    value: 'quoted',
    label: i18n('display_style_quoted', { defaultValue: 'Quoted' }),
    styles: {
      borderLeftWidth: '4px',
      borderLeftStyle: 'solid',
      borderLeftColor: '#f87171',
      paddingLeft: '12px'
    }
  },
  {
    value: 'blur',
    label: i18n('display_style_blur', {
      defaultValue: 'Blur'
    }),
    styles: {
      filter: 'blur(4px)'
    },
    attributes: {
      'data-anylang-translator-hover-style': 'filter_none'
    }
  },
  {
    value: 'transparent',
    label: i18n('display_style_transparent', { defaultValue: 'Transparent' }),
    styles: {
      opacity: '0.15'
    },
    attributes: {
      'data-anylang-translator-hover-style': 'opacity_1'
    }
  },
  {
    value: 'background',
    label: i18n('display_style_background', { defaultValue: 'Background' }),
    styles: {
      backgroundColor: 'oklch(98% 0.016 73.684)',
      borderRadius: '4px',
      padding: '4px 8px'
    }
  },
  {
    value: 'custom',
    label: i18n('display_style_custom', { defaultValue: 'Custom' }),
    styles: {}
  }
] as const;

export const attributeKeys = ['data-anylang-translator-hover-style'] as const;

export const displayStyles = DISPLAY_STYLES.map(
  (item) =>
    ({
      value: item.value,
      label: item.label,
      styles: item.styles,
      ...('attributes' in item ? { attributes: item.attributes } : {})
    }) satisfies DisplayStyle
);

export const displayStyleValues: string[] = displayStyles.map((s) => s.value);

export const fontFamilyOptions = [
  { value: '', label: i18n('system_default', { defaultValue: 'System Default' }) },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Times New Roman, Times, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'PingFang SC, Microsoft YaHei, sans-serif', label: 'PingFang SC' },
  { value: 'Microsoft YaHei, PingFang SC, sans-serif', label: 'Microsoft YaHei' },
  { value: 'Source Han Sans SC, Noto Sans SC, sans-serif', label: 'Source Han Sans SC' },
  { value: 'Noto Sans SC, Source Han Sans SC, sans-serif', label: 'Noto Sans SC' }
];

export const HOTKEYS = ['control', 'alt', 'shift', 'backtick', 'clickAndHold'] as const;

export const HOTKEY_ICONS: Record<(typeof HOTKEYS)[number], string> = {
  control: '⌃',
  alt: '⌥',
  shift: '⇧',
  backtick: '`',
  clickAndHold: '⏱'
};

// Maps to actual keyboard event key (for keydown/keyup detection)
export const HOTKEY_EVENT_KEYS: Record<(typeof HOTKEYS)[number], string> = {
  control: 'Control',
  alt: 'Alt',
  shift: 'Shift',
  backtick: 'Backtick',
  clickAndHold: 'ClickAndHold' // Special handling, not a keyboard event
};
