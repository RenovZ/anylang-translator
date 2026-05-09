// Feature field names (for config)
export const FEAT_QUICK_TRANSLATE = 'quickTranslate' as const;
export const FEAT_CONTEXT_TRANSLATE = 'contextTranslate' as const;
export const FEAT_INSTANT_LOOKUP = 'instantLookup' as const;
export const FEAT_INTELLIGENT_INPUT = 'intelligentInput' as const;
export const FEAT_BILINGUAL_SUBTITLES = 'bilingualSubtitles' as const;
export const FEAT_PANORAMA_READING = 'panoramaReading' as const;
export const FEAT_WRITING_COPILOT = 'writingCopilot' as const;

export type FeatureField =
  | typeof FEAT_QUICK_TRANSLATE
  | typeof FEAT_CONTEXT_TRANSLATE
  | typeof FEAT_INSTANT_LOOKUP
  | typeof FEAT_INTELLIGENT_INPUT
  | typeof FEAT_BILINGUAL_SUBTITLES
  | typeof FEAT_PANORAMA_READING
  | typeof FEAT_WRITING_COPILOT;

// Feature keys (for UI/features, note: adaptiveTranslate combines quick+context translate)
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
export const CMD_QUICK_TRANSLATE = 'quick-translate' as const;
export const CMD_CONTEXT_TRANSLATE = 'context-translate' as const;
export const CMD_INSTANT_LOOKUP = 'instant-lookup' as const;
export const CMD_INTELLIGENT_INPUT = 'intelligent-input' as const;
export const CMD_BILINGUAL_SUBTITLES = 'bilingual-subtitles' as const;
export const CMD_PANORAMA_READING = 'panorama-reading' as const;
export const CMD_WRITING_COPILOT = 'writing-copilot' as const;

export type CommandName =
  | typeof CMD_QUICK_TRANSLATE
  | typeof CMD_CONTEXT_TRANSLATE
  | typeof CMD_INSTANT_LOOKUP
  | typeof CMD_INTELLIGENT_INPUT
  | typeof CMD_BILINGUAL_SUBTITLES
  | typeof CMD_PANORAMA_READING
  | typeof CMD_WRITING_COPILOT;

// // Message types for runtime communication
// export const MSG_QUICK_TRANSLATE = 'QUICK_TRANSLATE' as const;
// export const MSG_CONTEXT_TRANSLATE = 'CONTEXT_TRANSLATE' as const;
// export const MSG_INSTANT_LOOKUP = 'INSTANT_LOOKUP' as const;
// export const MSG_INTELLIGENT_INPUT = 'INTELLIGENT_INPUT' as const;
// export const MSG_BILINGUAL_SUBTITLES = 'BILINGUAL_SUBTITLES' as const;
// export const MSG_PANORAMA_READING = 'PANORAMA_READING' as const;
// export const MSG_WRITING_COPILOT = 'WRITING_COPILOT' as const;
// export const MSG_PING = 'PING' as const;
// export const MSG_GET_SHORTCUTS = 'GET_SHORTCUTS' as const;

// export type MessageType =
//   | typeof MSG_QUICK_TRANSLATE
//   | typeof MSG_CONTEXT_TRANSLATE
//   | typeof MSG_INSTANT_LOOKUP
//   | typeof MSG_INTELLIGENT_INPUT
//   | typeof MSG_BILINGUAL_SUBTITLES
//   | typeof MSG_PANORAMA_READING
//   | typeof MSG_WRITING_COPILOT
//   | typeof MSG_PING
//   | typeof MSG_GET_SHORTCUTS;

// Mapping between different representations
export const cmdToFeat: Record<CommandName, FeatureField> = {
  [CMD_QUICK_TRANSLATE]: FEAT_QUICK_TRANSLATE,
  [CMD_CONTEXT_TRANSLATE]: FEAT_CONTEXT_TRANSLATE,
  [CMD_INSTANT_LOOKUP]: FEAT_INSTANT_LOOKUP,
  [CMD_INTELLIGENT_INPUT]: FEAT_INTELLIGENT_INPUT,
  [CMD_BILINGUAL_SUBTITLES]: FEAT_BILINGUAL_SUBTITLES,
  [CMD_PANORAMA_READING]: FEAT_PANORAMA_READING,
  [CMD_WRITING_COPILOT]: FEAT_WRITING_COPILOT
} as const;

// export const cmdToMsg: Record<CommandName, MessageType> = {
//   [CMD_QUICK_TRANSLATE]: MSG_QUICK_TRANSLATE,
//   [CMD_CONTEXT_TRANSLATE]: MSG_CONTEXT_TRANSLATE,
//   [CMD_INSTANT_LOOKUP]: MSG_INSTANT_LOOKUP,
//   [CMD_INTELLIGENT_INPUT]: MSG_INTELLIGENT_INPUT,
//   [CMD_BILINGUAL_SUBTITLES]: MSG_BILINGUAL_SUBTITLES,
//   [CMD_PANORAMA_READING]: MSG_PANORAMA_READING,
//   [CMD_WRITING_COPILOT]: MSG_WRITING_COPILOT
// } as const;

export const CLASS_NOTRANSLATE = 'anylang-notranslate' as const;
