import i18n from '@/lib/i18n';

// Timing constants
export const NAVIGATION_HANDLER_DELAY = 1000;
export const FETCH_CHECK_INTERVAL = 100;
export const FETCH_SUBTITLES_TIMEOUT = 10_000;
export const MAX_GAP_MS = 2_000;
export const PAUSE_TIMEOUT_MS = 1_000;

// Segmentation constants
export const MAX_WORDS = 15;
export const MAX_CHARS_CJK = 30;
export const SENTENCE_END_PATTERN = /[,.。?？！!；;…؟۔\n]$/;

// On-demand translation constants
export const TRANSLATION_BATCH_SIZE = 5;
export const TRANSLATE_LOOK_AHEAD_MS = 30_000;
export const PROCESS_LOOK_AHEAD_MS = 60_000;

// DOM IDs
export const TRANSLATE_BUTTON_CONTAINER_ID = 'anylang-bilingual-subtitles-main';
export const HIDE_NATIVE_CAPTIONS_STYLE_ID = 'anylang-hide-native-captions';

// Class names
export const SUBTITLES_VIEW_CLASS = 'anylang-subtitles-view';
export const STATE_MESSAGE_CLASS = 'anylang-subtitles-state-message';
export const TRANSLATE_BUTTON_CLASS = 'anylang-subtitles-translate-button';

// YouTube specific
export const YOUTUBE_WATCH_URL_PATTERN = 'youtube.com/watch';
export const YOUTUBE_EMBED_PATH_PATTERN = /\/embed\/[^/?]+/;
export const YOUTUBE_NAVIGATE_START_EVENT = 'yt-navigate-start';
export const YOUTUBE_NAVIGATE_FINISH_EVENT = 'yt-navigate-finish';
export const YOUTUBE_NATIVE_SUBTITLES_CLASS = '.ytp-caption-window-container';
export const PLAYER_DATA_REQUEST_TYPE = 'ANYLANG_GET_PLAYER_DATA';
export const PLAYER_DATA_RESPONSE_TYPE = 'ANYLANG_PLAYER_DATA';
export const WAIT_TIMEDTEXT_REQUEST_TYPE = 'ANYLANG_WAIT_TIMEDTEXT';
export const WAIT_TIMEDTEXT_RESPONSE_TYPE = 'ANYLANG_TIMEDTEXT_READY';
export const TIMEDTEXT_WAIT_TIMEOUT_MS = 5000;
export const ENSURE_SUBTITLES_REQUEST_TYPE = 'ANYLANG_ENSURE_SUBTITLES';
export const ENSURE_SUBTITLES_RESPONSE_TYPE = 'ANYLANG_ENSURE_SUBTITLES_DONE';
export const POST_MESSAGE_TIMEOUT_MS = 6000;

// YouTube player wait constants
export const MAX_PLAYER_WAIT_ATTEMPTS = 50;
export const PLAYER_WAIT_INTERVAL_MS = 100;
export const MAX_STATE_WAIT_ATTEMPTS = 20;
export const STATE_WAIT_INTERVAL_MS = 300;
export const MAX_FETCH_RETRIES = 5;
export const FETCH_RETRY_DELAY_MS = 1000;
export const MAX_POT_WAIT_ATTEMPTS = 30;
export const POT_WAIT_INTERVAL_MS = 200;

// Subtitle style constants
export const MIN_FONT_SCALE = 30;
export const MAX_FONT_SCALE = 150;
export const DEFAULT_FONT_SCALE = 100;
export const MIN_FONT_WEIGHT = 300;
export const MAX_FONT_WEIGHT = 700;
export const DEFAULT_FONT_WEIGHT = 400;
export const MIN_BACKGROUND_OPACITY = 0;
export const MAX_BACKGROUND_OPACITY = 100;
export const DEFAULT_BACKGROUND_OPACITY = 75;
export const DEFAULT_FONT_FAMILY = 'system' as const;
export const DEFAULT_SUBTITLE_COLOR = '#FFFFFF';
export const DEFAULT_DISPLAY_MODE = 'bilingual' as const;
export const DEFAULT_TRANSLATION_POSITION = 'above' as const;
export const DEFAULT_CONTROLS_HEIGHT = 60;
export const DEFAULT_SUBTITLE_POSITION = { percent: 10, anchor: 'bottom' } as const;

// Font family mapping
export const SUBTITLE_FONT_FAMILIES = {
  system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  roboto: 'Roboto, sans-serif',
  'noto-sans': '"Noto Sans", "Noto Sans SC", "Noto Sans JP", "Noto Sans KR", sans-serif',
  'noto-serif': '"Noto Serif", "Noto Serif SC", "Noto Serif JP", "Noto Serif KR", serif'
};

export type ViewId = 'main' | 'style';
export const ROOT_VIEW: ViewId = 'main';

export interface StyleDetail {
  key: string;
  label: string;
  options?: string[];
  isSlider?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export const FONT_FAMILY_OPTIONS = [
  'Proportional Sans-Serif',
  'Monospace Sans-Serif',
  'Proportional Serif',
  'Monospace Serif',
  'Casual',
  'Cursive',
  'Small Capitals'
];

export const FONT_COLOR_OPTIONS = [
  'White',
  'Yellow',
  'Green',
  'Cyan',
  'Blue',
  'Magenta',
  'Red',
  'Black'
];

export const FONT_SIZE_OPTIONS = [
  '50%',
  '70%',
  '80%',
  '90%',
  '100%',
  '125%',
  '150%',
  '200%',
  '300%',
  '400%'
];

export const FONT_WEIGHT_OPTIONS = ['400', '600', '700', '800', '900'];

export const SETTING_STYLES = [
  {
    key: 'fontFamily',
    label: i18n('font_family', { defaultValue: 'Font family' }),
    options: FONT_FAMILY_OPTIONS
  },
  {
    key: 'fontColor',
    label: i18n('font_color', { defaultValue: 'Font color' }),
    options: FONT_COLOR_OPTIONS
  },
  {
    key: 'fontSize',
    label: i18n('font_size_scale', { defaultValue: 'Font size' }),
    options: FONT_SIZE_OPTIONS
  },
  {
    key: 'fontWeight',
    label: i18n('font_weight', { defaultValue: 'Font weight' }),
    options: FONT_WEIGHT_OPTIONS
  },
  {
    key: 'fontOpacity',
    label: i18n('font_opacity', { defaultValue: 'Font opacity' }),
    isSlider: true,
    min: 0,
    max: 100,
    step: 1
  },
  {
    key: 'backgroundColor',
    label: i18n('background_color', { defaultValue: 'Background color' }),
    options: FONT_COLOR_OPTIONS
  },
  {
    key: 'backgroundOpacity',
    label: i18n('background_opacity', { defaultValue: 'Background opacity' }),
    isSlider: true,
    min: 0,
    max: 100,
    step: 1
  }
  // {
  //   key: 'windowColor',
  //   label: i18n('window_color', { defaultValue: 'Window color' }),
  //   options: FONT_COLOR_OPTIONS
  // },
  // {
  //   key: 'windowOpacity',
  //   label: i18n('window_opacity', { defaultValue: 'Window opacity' }),
  //   isSlider: true,
  //   min: 0,
  //   max: 100,
  //   step: 1
  // },
  // {
  //   key: 'characterEdgeStyle',
  //   label: i18n('character_edge_style', { defaultValue: 'Character edge style' }),
  //   options: ['None', 'Raised', 'Depressed', 'Uniform', 'Drop shadow']
  // },
] satisfies StyleDetail[];

export const DEFAULT_STYLES = {
  fontFamily: FONT_FAMILY_OPTIONS[0],
  fontColor: 'White',
  fontSize: '100%',
  fontWeight: FONT_WEIGHT_OPTIONS[0],
  fontOpacity: 100,
  backgroundColor: 'Black',
  backgroundOpacity: 75
} as const;
