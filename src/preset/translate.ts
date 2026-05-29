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
  // System default
  { value: '', label: i18n('system_default', { defaultValue: 'System Default' }) },

  // Western sans-serif / serif / monospace
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Arial Unicode MS, Arial, sans-serif', label: 'Arial Unicode MS' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Helvetica Neue, Helvetica, Arial, sans-serif', label: 'Helvetica Neue' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Tahoma, sans-serif', label: 'Tahoma' },
  { value: 'Times New Roman, Times, serif', label: 'Times New Roman' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },

  // Chinese - macOS system fonts
  { value: 'PingFang SC, Microsoft YaHei, sans-serif', label: '苹方 (PingFang SC)' },
  { value: 'Hiragino Sans GB, Microsoft YaHei, sans-serif', label: '冬青黑体 (Hiragino Sans GB)' },
  { value: 'Lantinghei SC, Microsoft YaHei, sans-serif', label: '兰亭黑 (Lantinghei)' },
  { value: 'STHeiti, Heiti SC, Microsoft YaHei, sans-serif', label: '华文黑体 (STHeiti)' },
  { value: 'STKaiti, KaiTi, serif', label: '华文楷体 (STKaiti)' },
  { value: 'STSong, SimSun, serif', label: '华文宋体 (STSong)' },
  { value: 'STFangsong, FangSong, serif', label: '华文仿宋 (STFangsong)' },
  { value: 'Xingkai SC, STXingkai, KaiTi, serif', label: '行楷 (Xingkai)' },
  { value: 'Yuanti SC, Hiragino Maru Gothic ProN, sans-serif', label: '圆体 (Yuanti)' },

  // Chinese - Windows / generic
  { value: 'Microsoft YaHei, PingFang SC, sans-serif', label: '微软雅黑 (Microsoft YaHei)' },
  { value: 'SimSun, STSong, serif', label: '宋体 (SimSun)' },

  // Chinese - Open source / cross-platform
  { value: 'Noto Sans SC, Source Han Sans SC, sans-serif', label: 'Noto Sans SC' },
  { value: 'Source Han Sans SC, Noto Sans SC, sans-serif', label: '思源黑体 (Source Han Sans SC)' },

  // Chinese - Bundled open-source fonts
  { value: 'LXGW WenKai, STKaiti, KaiTi, serif', label: '霞鹜文楷 (LXGW WenKai)' },
  { value: 'Smiley Sans, Microsoft YaHei, sans-serif', label: '得意黑 (Smiley Sans)' },
  { value: 'ZCOOL KuaiLe, Yuanti SC, sans-serif', label: '站酷快乐体 (ZCOOL KuaiLe)' },
  { value: 'Ma Shan Zheng, STKaiti, KaiTi, serif', label: '马善政毛笔楷书 (Ma Shan Zheng)' },

  // Japanese
  {
    value: 'Hiragino Kaku Gothic ProN, Yu Gothic, Meiryo, sans-serif',
    label: 'Hiragino Kaku Gothic ProN'
  },
  { value: 'Hiragino Mincho ProN, Yu Mincho, serif', label: 'Hiragino Mincho ProN' },

  // Korean
  { value: 'Apple SD Gothic Neo, Nanum Gothic, sans-serif', label: 'Apple SD Gothic Neo' },
  { value: 'Nanum Gothic, Apple SD Gothic Neo, sans-serif', label: 'Nanum Gothic' },

  // Indic scripts
  { value: 'Devanagari MT, Kohinoor Devanagari, sans-serif', label: 'Devanagari MT' },
  { value: 'Kohinoor Devanagari, Devanagari MT, sans-serif', label: 'Kohinoor Devanagari' }
];

export const TRIGGER_HOTKEY_MAP = {
  ctrl: { icon: '⌃', key: 'Control' },
  alt: { icon: '⌥', key: 'Alt' },
  shift: { icon: '⇧', key: 'Shift' }
} as const;

export const TRIGGER_HOTKEYS = Object.keys(TRIGGER_HOTKEY_MAP) as Array<
  keyof typeof TRIGGER_HOTKEY_MAP
>;

export const TRIGGER_ON_HOVER = [
  {
    hotkey: 'ctrl',
    label: i18n('trigger_on_hover_ctrl', { defaultValue: 'Hover + Ctrl to translate paragraph' })
  },
  {
    hotkey: 'alt',
    label: i18n('trigger_on_hover_alt', { defaultValue: 'Hover + Alt to translate paragraph' })
  },
  {
    hotkey: 'shift',
    label: i18n('trigger_on_hover_shift', { defaultValue: 'Hover + Shift to translate paragraph' })
  }
] as const;

export const DEFAULT_REQUEST_QUEUE_CONFIG = {
  capacity: 60,
  rate: 8
};

export const DEFAULT_BATCH_QUEUE_CONFIG = {
  maxCharactersPerBatch: 1000,
  maxItemsPerBatch: 4
};
