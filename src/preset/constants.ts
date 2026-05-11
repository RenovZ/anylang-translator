// Feature field names (for config)
export const FEAT_ADAPTIVE_TRANSLATE = 'adaptiveTranslate' as const;
export const FEAT_INSTANT_LOOKUP = 'instantLookup' as const;
export const FEAT_INTELLIGENT_INPUT = 'intelligentInput' as const;
export const FEAT_BILINGUAL_SUBTITLES = 'bilingualSubtitles' as const;
export const FEAT_PANORAMA_READING = 'panoramaReading' as const;
export const FEAT_WRITING_COPILOT = 'writingCopilot' as const;

export type FeatureField =
  | typeof FEAT_ADAPTIVE_TRANSLATE
  | typeof FEAT_INSTANT_LOOKUP
  | typeof FEAT_INTELLIGENT_INPUT
  | typeof FEAT_BILINGUAL_SUBTITLES
  | typeof FEAT_PANORAMA_READING
  | typeof FEAT_WRITING_COPILOT;

export const FEAT_KEY_ADAPTIVE_TRANSLATE = 'adaptiveTranslate' as const;
export const FEAT_KEY_INSTANT_LOOKUP = 'instantLookup' as const;
export const FEAT_KEY_INTELLIGENT_INPUT = 'intelligentInput' as const;
export const FEAT_KEY_BILINGUAL_SUBTITLES = 'bilingualSubtitles' as const;
export const FEAT_KEY_PANORAMA_READING = 'panoramaReading' as const;
export const FEAT_KEY_WRITING_COPILOT = 'writingCopilot' as const;

export const featureKeys = [
  FEAT_KEY_ADAPTIVE_TRANSLATE,
  FEAT_KEY_INSTANT_LOOKUP,
  FEAT_KEY_INTELLIGENT_INPUT,
  FEAT_KEY_BILINGUAL_SUBTITLES,
  FEAT_KEY_PANORAMA_READING,
  FEAT_KEY_WRITING_COPILOT
] as const;

export type FeatureKey = (typeof featureKeys)[number];

// Browser extension command names (from manifest)
export const CMD_ADAPTIVE_TRANSLATE = 'adaptive-translate' as const;
export const CMD_INSTANT_LOOKUP = 'instant-lookup' as const;
export const CMD_INTELLIGENT_INPUT = 'intelligent-input' as const;
export const CMD_BILINGUAL_SUBTITLES = 'bilingual-subtitles' as const;
export const CMD_PANORAMA_READING = 'panorama-reading' as const;
export const CMD_WRITING_COPILOT = 'writing-copilot' as const;

export type CommandName =
  | typeof CMD_ADAPTIVE_TRANSLATE
  | typeof CMD_INSTANT_LOOKUP
  | typeof CMD_INTELLIGENT_INPUT
  | typeof CMD_BILINGUAL_SUBTITLES
  | typeof CMD_PANORAMA_READING
  | typeof CMD_WRITING_COPILOT;

// Mapping between different representations
export const cmdToFeat: Record<CommandName, FeatureField> = {
  [CMD_ADAPTIVE_TRANSLATE]: FEAT_ADAPTIVE_TRANSLATE,
  [CMD_INSTANT_LOOKUP]: FEAT_INSTANT_LOOKUP,
  [CMD_INTELLIGENT_INPUT]: FEAT_INTELLIGENT_INPUT,
  [CMD_BILINGUAL_SUBTITLES]: FEAT_BILINGUAL_SUBTITLES,
  [CMD_PANORAMA_READING]: FEAT_PANORAMA_READING,
  [CMD_WRITING_COPILOT]: FEAT_WRITING_COPILOT
} as const;
