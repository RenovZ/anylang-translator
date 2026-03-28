import { type LocalizedOption } from '@/entrypoints/popup/data';
import { i18n } from '@/lib/i18n';

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

const previewTextEn =
  'Night gathers, and now my watch begins. It shall not end until my death. I shall take no wife, hold no lands, father no children.';
const previewTextZh =
  'Long night is coming, and now my watch begins. It shall not end until my death. I shall take no wife, hold no lands, father no children.';

export {
  translationStyleOptions,
  previewTextEn,
  previewTextZh,
}
