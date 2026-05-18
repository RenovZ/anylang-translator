// Feature field names (for config)
export const FEAT_LANG_DETECTION = 'langDetection' as const;
export const FEAT_ADAPTIVE_TRANSLATE = 'adaptiveTranslate' as const;
export const FEAT_INSTANT_LOOKUP = 'instantLookup' as const;
export const FEAT_INTELLIGENT_INPUT = 'intelligentInput' as const;
export const FEAT_BILINGUAL_SUBTITLES = 'bilingualSubtitles' as const;
export const FEAT_PANORAMA_READING = 'panoramaReading' as const;
export const FEAT_WRITING_COPILOT = 'writingCopilot' as const;

export type FeatureField =
  | typeof FEAT_LANG_DETECTION
  | typeof FEAT_ADAPTIVE_TRANSLATE
  | typeof FEAT_INSTANT_LOOKUP
  | typeof FEAT_INTELLIGENT_INPUT
  | typeof FEAT_BILINGUAL_SUBTITLES
  | typeof FEAT_PANORAMA_READING
  | typeof FEAT_WRITING_COPILOT;

export const featureKeys = [
  FEAT_LANG_DETECTION,
  FEAT_ADAPTIVE_TRANSLATE,
  FEAT_INSTANT_LOOKUP,
  FEAT_INTELLIGENT_INPUT,
  FEAT_BILINGUAL_SUBTITLES,
  FEAT_PANORAMA_READING,
  FEAT_WRITING_COPILOT
] as const;

export type FeatureKey = (typeof featureKeys)[number];

// Browser extension command names (from manifest)
export const CMD_ADAPTIVE_TRANSLATE = 'adaptive-translate' as const;
export const CMD_INSTANT_LOOKUP = 'instant-lookup' as const;
export const CMD_INTELLIGENT_INPUT = 'intelligent-input' as const;
export const CMD_BILINGUAL_SUBTITLES = 'bilingual-subtitles' as const;
export const CMD_PANORAMA_READING = 'panorama-reading' as const;
export const CMD_WRITING_COPILOT = 'writing-copilot' as const;
