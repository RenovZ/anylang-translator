import { i18n } from '@/lib/i18n';

const translationStyleOptions = [
  {
    value: 'none',
    label: i18n('options_general_style_none', { defaultValue: 'None' }),
    className: ''
  },
  {
    value: 'dashed_underline',
    label: i18n('options_general_style_dashed_underline', { defaultValue: 'Dotted lines' }),
    className: 'underline decoration-dashed decoration-sky-400 underline-offset-4'
  },
  {
    value: 'solid_underline',
    label: i18n('options_general_style_solid_underline', { defaultValue: 'Straight line' }),
    className: 'underline decoration-sky-500 underline-offset-4'
  },
  {
    value: 'dashed_border',
    label: i18n('options_general_style_dashed_border', { defaultValue: 'Dotted Border' }),
    className: 'border border-dashed border-slate-400 px-1 py-0.5'
  },
  {
    value: 'solid_border',
    label: i18n('options_general_style_solid_border', { defaultValue: 'Solid Border' }),
    className: 'border border-slate-400 px-1 py-0.5'
  },
  {
    value: 'blur_learning',
    label: i18n('options_general_style_blur_learning', {
      defaultValue: 'Blur effect (learning mode)'
    }),
    className: 'blur-[2px]'
  },
  {
    value: 'transparent',
    label: i18n('options_general_style_transparent', { defaultValue: 'Transparency effect' }),
    className: 'opacity-35'
  },
  {
    value: 'dotted_underline',
    label: i18n('options_general_style_dotted_underline', { defaultValue: 'Dotted lines' }),
    className: 'underline decoration-dotted decoration-sky-500 underline-offset-4'
  },
  {
    value: 'divider',
    label: i18n('options_general_style_divider', { defaultValue: 'Dividing line' }),
    className: 'border-l-4 border-primary-400 pl-3'
  },
  {
    value: 'highlight',
    label: i18n('options_general_style_highlight', { defaultValue: 'Highlight' }),
    className: 'bg-yellow-300 px-1'
  },
  {
    value: 'marker',
    label: i18n('options_general_style_marker', { defaultValue: 'Marker' }),
    className: 'bg-yellow-200 px-1'
  },
  {
    value: 'marker2',
    label: i18n('options_general_style_marker2', { defaultValue: 'Maker2' }),
    className: 'bg-yellow-300 px-1'
  },
  {
    value: 'quote_style',
    label: i18n('options_general_style_quote_style', { defaultValue: 'quote style' }),
    className: 'border-l-4 border-red-400 pl-3'
  },
  {
    value: 'weaken',
    label: i18n('options_general_style_weaken', { defaultValue: 'Weaken' }),
    className: 'text-gray-400'
  },
  {
    value: 'black_gray',
    label: i18n('options_general_style_black_gray', { defaultValue: 'Black Gray' }),
    className: 'text-gray-800'
  },
  {
    value: 'white_paper_shadow',
    label: i18n('options_general_style_white_paper_shadow', {
      defaultValue: 'White paper shadow effect'
    }),
    className: 'bg-white shadow-md rounded-lg p-3'
  },
  {
    value: 'italic',
    label: i18n('options_general_style_italic', { defaultValue: 'Italic' }),
    className: 'italic'
  },
  {
    value: 'bold',
    label: i18n('options_general_style_bold', { defaultValue: 'Bold' }),
    className: 'font-bold'
  },
  {
    value: 'thin_dotted_lines',
    label: i18n('options_general_style_thin_dotted_lines', { defaultValue: 'Thin dotted lines' }),
    className: 'underline decoration-dotted decoration-gray-400 underline-offset-4'
  },
  {
    value: 'wavy_lines',
    label: i18n('options_general_style_wavy_lines', { defaultValue: 'wavy lines' }),
    className: 'underline decoration-wavy decoration-sky-400 underline-offset-4'
  },
  {
    value: 'system_dotted_lines',
    label: i18n('options_general_style_system_dotted_lines', {
      defaultValue: 'System built-in dotted lines'
    }),
    className: 'underline decoration-dotted underline-offset-4'
  },
  {
    value: 'system_dotted_lines_2',
    label: i18n('options_general_style_system_dotted_lines_2', {
      defaultValue: 'System built-in dotted lines'
    }),
    className: 'border-b border-dotted border-current'
  },
  {
    value: 'system_straight_lines',
    label: i18n('options_general_style_system_straight_lines', {
      defaultValue: 'System built-in straight lines'
    }),
    className: 'underline underline-offset-4'
  },
  {
    value: 'background',
    label: i18n('options_general_style_background', { defaultValue: 'Background' }),
    className: 'bg-gray-100 rounded px-2 py-1'
  }
];

const previewTextEn =
  'Night gathers, and now my watch begins. It shall not end until my death. I shall take no wife, hold no lands, father no children.';
const previewTextZh =
  '长夜将至，我从今开始守望，至死方休。我将不娶妻、不封地、不生子。我将不戴宝冠，不争荣宠。我将尽忠职守，生死于斯。';

export { previewTextEn, previewTextZh, translationStyleOptions };
