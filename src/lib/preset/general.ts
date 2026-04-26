import i18n from '@/lib/i18n';
import { type TranslationDisplayStyle } from '../types';

export const translationDisplayStyles: TranslationDisplayStyle[] = [
  {
    value: 'none',
    label: i18n('translation_display_style_none', { defaultValue: 'None' }),
    styles: {}
  },
  {
    value: 'dashed_underline',
    label: i18n('translation_display_style_dashed_underline', { defaultValue: 'Dotted lines' }),
    styles: {
      textDecorationLine: 'underline',
      textDecorationStyle: 'dashed',
      textDecorationColor: '#38bdf8',
      textUnderlineOffset: '4px'
    }
  },
  {
    value: 'solid_underline',
    label: i18n('translation_display_style_solid_underline', { defaultValue: 'Straight line' }),
    styles: {
      textDecorationLine: 'underline',
      textDecorationStyle: 'solid',
      textDecorationColor: '#0ea5e9',
      textUnderlineOffset: '4px'
    }
  },
  {
    value: 'dashed_border',
    label: i18n('translation_display_style_dashed_border', { defaultValue: 'Dotted Border' }),
    styles: {
      border: '1px dashed #94a3b8',
      padding: '2px 4px'
    }
  },
  {
    value: 'solid_border',
    label: i18n('translation_display_style_solid_border', { defaultValue: 'Solid Border' }),
    styles: {
      border: '1px solid #94a3b8',
      padding: '2px 4px'
    }
  },
  {
    value: 'blur_learning',
    label: i18n('translation_display_style_blur_learning', {
      defaultValue: 'Blur effect (learning mode)'
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
    label: i18n('translation_display_style_transparent', { defaultValue: 'Transparency effect' }),
    styles: {
      opacity: '0.15'
    },
    attributes: {
      'data-anylang-translator-hover-style': 'opacity_1'
    }
  },
  {
    value: 'dotted_underline',
    label: i18n('translation_display_style_dotted_underline', { defaultValue: 'Dotted lines' }),
    styles: {
      textDecorationLine: 'underline',
      textDecorationStyle: 'dotted',
      textDecorationColor: '#0ea5e9',
      textUnderlineOffset: '4px'
    }
  },
  {
    value: 'divider',
    label: i18n('translation_display_style_divider', { defaultValue: 'Dividing line' }),
    styles: {
      borderLeftWidth: '4px',
      borderLeftStyle: 'solid',
      borderLeftColor: '#60a5fa',
      paddingLeft: '12px'
    }
  },
  {
    value: 'highlight',
    label: i18n('translation_display_style_highlight', { defaultValue: 'Highlight' }),
    styles: {
      backgroundColor: '#fde047',
      padding: '0px 4px'
    }
  },
  {
    value: 'marker',
    label: i18n('translation_display_style_marker', { defaultValue: 'Marker' }),
    styles: {
      backgroundColor: '#fef08a',
      padding: '0px 4px'
    }
  },
  {
    value: 'marker2',
    label: i18n('translation_display_style_marker2', { defaultValue: 'Maker2' }),
    styles: {
      backgroundColor: '#fde047',
      padding: '0px 4px'
    }
  },
  {
    value: 'quote_style',
    label: i18n('translation_display_style_quote_style', { defaultValue: 'quote style' }),
    styles: {
      borderLeftWidth: '4px',
      borderLeftStyle: 'solid',
      borderLeftColor: '#f87171',
      paddingLeft: '12px'
    }
  },
  {
    value: 'weaken',
    label: i18n('translation_display_style_weaken', { defaultValue: 'Weaken' }),
    styles: {
      color: '#9ca3af'
    }
  },
  {
    value: 'black_gray',
    label: i18n('translation_display_style_black_gray', { defaultValue: 'Black Gray' }),
    styles: {
      color: '#1f2937'
    }
  },
  {
    value: 'white_paper_shadow',
    label: i18n('translation_display_style_white_paper_shadow', {
      defaultValue: 'White paper shadow effect'
    }),
    styles: {
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      padding: '12px'
    }
  },
  {
    value: 'italic',
    label: i18n('translation_display_style_italic', { defaultValue: 'Italic' }),
    styles: {
      fontStyle: 'italic'
    }
  },
  {
    value: 'bold',
    label: i18n('translation_display_style_bold', { defaultValue: 'Bold' }),
    styles: {
      fontWeight: '700'
    }
  },
  {
    value: 'thin_dotted_lines',
    label: i18n('translation_display_style_thin_dotted_lines', {
      defaultValue: 'Thin dotted lines'
    }),
    styles: {
      textDecorationLine: 'underline',
      textDecorationStyle: 'dotted',
      textDecorationColor: '#9ca3af',
      textUnderlineOffset: '4px'
    }
  },
  {
    value: 'wavy_lines',
    label: i18n('translation_display_style_wavy_lines', { defaultValue: 'wavy lines' }),
    styles: {
      textDecorationLine: 'underline',
      textDecorationStyle: 'wavy',
      textDecorationColor: '#38bdf8',
      textUnderlineOffset: '4px'
    }
  },
  {
    value: 'system_dotted_lines',
    label: i18n('translation_display_style_system_dotted_lines', {
      defaultValue: 'System built-in dotted lines'
    }),
    styles: {
      textDecorationLine: 'underline',
      textDecorationStyle: 'dotted',
      textUnderlineOffset: '4px'
    }
  },
  {
    value: 'system_dotted_lines_2',
    label: i18n('translation_display_style_system_dotted_lines_2', {
      defaultValue: 'System built-in dotted lines'
    }),
    styles: {
      borderBottomWidth: '1px',
      borderBottomStyle: 'dotted',
      borderBottomColor: 'currentColor'
    }
  },
  {
    value: 'system_straight_lines',
    label: i18n('translation_display_style_system_straight_lines', {
      defaultValue: 'System built-in straight lines'
    }),
    styles: {
      textDecorationLine: 'underline',
      textUnderlineOffset: '4px'
    }
  },
  {
    value: 'background',
    label: i18n('translation_display_style_background', { defaultValue: 'Background' }),
    styles: {
      backgroundColor: 'oklch(98% 0.016 73.684)',
      borderRadius: '4px',
      padding: '4px 8px'
    }
  },
  {
    value: 'custom',
    label: i18n('translation_display_style_custom', { defaultValue: 'Custom' }),
    styles: {}
  }
];

export const fontFamilyOptions = [
  { value: '', label: i18n('font_system_default', { defaultValue: 'System default' }) },
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
