import i18n from '@/lib/i18n';
import type { CustomDisplayStyle, DisplayStyle } from '@/types/translate';

export const PREVIEW_TEXT_MAP = {
  en: 'The sky above the port was the color of television, tuned to a dead channel. It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.',
  'zh-CN':
    '港口上空的天空呈现出电视屏幕调到一个死频道时的颜色。那是四月里一个明亮而寒冷的日子，时钟正敲着十三点。温斯顿·史密斯把下巴紧贴着胸口，试图躲避那令人厌恶的寒风，快步穿过胜利大厦的玻璃门，尽管速度还不够快，没能阻止一阵夹杂着沙砾的尘土随他一起飘了进来。'
} as const;

export const defaultCustomDisplayStyles = {
  // refer https://coolors.co/palettes/trending
  backgroundColor: '#d6ccc2',
  color: 'inherit',
  fontSize: '14px',
  fontWeight: 400,
  fontFamily: '',
  borderRadius: '8px',
  padding: '2px 4px'
} satisfies CustomDisplayStyle;

export const DISPLAY_STYLES = [
  {
    preset: 'none',
    label: i18n('display_style_none', { defaultValue: 'None' })
  },
  {
    preset: 'dashed_underline',
    label: i18n('display_style_dashed_underline', { defaultValue: 'Dashed Underline' })
  },
  {
    preset: 'solid_underline',
    label: i18n('display_style_solid_underline', { defaultValue: 'Solid Underline' })
  },
  {
    preset: 'wavy_underline',
    label: i18n('display_style_wavy_underline', { defaultValue: 'Wavy Underline' })
  },
  {
    preset: 'weaken_effect',
    label: i18n('display_style_weaken', { defaultValue: 'Weaken Effect' })
  },
  {
    preset: 'shadow_effect',
    label: i18n('display_style_shadow_effect', { defaultValue: 'Shadow Effect' })
  },
  {
    preset: 'mark_pencil',
    label: i18n('display_style_mark_pencil', { defaultValue: 'Mark Pencil' })
  },
  {
    preset: 'quoted_style',
    label: i18n('display_style_quoted_style', { defaultValue: 'Quoted Style' })
  },
  {
    preset: 'blur_effect',
    label: i18n('display_style_blur', { defaultValue: 'Blur Effect' })
  },
  {
    preset: 'transparent_effect',
    label: i18n('display_style_transparent', { defaultValue: 'Transparent Effect' })
  },
  {
    preset: 'border_style',
    label: i18n('display_style_border_style', { defaultValue: 'Border Style' })
  },
  {
    preset: 'text_color',
    label: i18n('display_style_text_color', { defaultValue: 'Text Color' })
  },
  {
    preset: 'background',
    label: i18n('display_style_background', { defaultValue: 'Background' })
  },
  {
    preset: 'custom',
    label: i18n('display_style_custom', { defaultValue: 'Custom' }),
    styles: defaultCustomDisplayStyles
  },
  {
    preset: 'css',
    label: i18n('display_style_css', { defaultValue: 'CSS' })
  }
] as const;

export const displayStyles = DISPLAY_STYLES.map(
  (item) =>
    ({
      preset: item.preset,
      customStyles: 'styles' in item && item.styles ? item.styles : undefined
      // customCss: undefined
    }) satisfies DisplayStyle
);

export const MAX_CUSTOM_CSS_LENGTH = 8192;

export const displayStylePresets: string[] = displayStyles.map((s) => s.preset);

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

export const DEFAULT_REQUEST_QUEUE_CONFIG = {
  capacity: 60,
  rate: 8
};

export const DEFAULT_BATCH_QUEUE_CONFIG = {
  maxCharactersPerBatch: 1000,
  maxItemsPerBatch: 4
};
