import {
  FEAT_ADAPTIVE_TRANSLATE,
  FEAT_BILINGUAL_SUBTITLES,
  FEAT_INSTANT_LOOKUP,
  FEAT_INTELLIGENT_INPUT,
  FEAT_PANORAMA_READING,
  FEAT_WRITING_COPILOT
} from './constants';

export const ANALYTICS_FEATURE = {
  [FEAT_ADAPTIVE_TRANSLATE]: 'adaptive_translate',
  [FEAT_INSTANT_LOOKUP]: 'instant_lookup',
  [FEAT_INTELLIGENT_INPUT]: 'intelligent_input',
  [FEAT_BILINGUAL_SUBTITLES]: 'bilingual_subtitles',
  [FEAT_PANORAMA_READING]: 'panorama_reading',
  [FEAT_WRITING_COPILOT]: 'writing_copilot'
} as const;

export const ANALYTICS_SURFACE = {
  POPUP: 'popup',
  FLOATING_BUTTON: 'floating_button',
  CONTEXT_MENU: 'context_menu',
  PAGE_AUTO: 'page_auto',
  SHORTCUT: 'shortcut',
  TOUCH_GESTURE: 'touch_gesture',
  SELECTION_TOOLBAR: 'selection_toolbar',
  INPUT_TRANSLATION: 'input_translation',
  TRANSLATION_HUB: 'translation_hub',
  VIDEO_SUBTITLES: 'video_subtitles',
  VIDEO_SUBTITLES_AUTO: 'video_subtitles_auto'
} as const;
