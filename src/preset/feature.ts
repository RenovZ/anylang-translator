// Feature field names (for config)
export const FEAT_LANG_DETECTION = 'langDetection' as const;
export const FEAT_ADAPTIVE_TRANSLATE = 'adaptiveTranslate' as const;
export const FEAT_INSTANT_LOOKUP = 'instantLookup' as const;

export type FeatureField =
  | typeof FEAT_LANG_DETECTION
  | typeof FEAT_ADAPTIVE_TRANSLATE
  | typeof FEAT_INSTANT_LOOKUP;

export const featureKeys = [
  FEAT_LANG_DETECTION,
  FEAT_ADAPTIVE_TRANSLATE,
  FEAT_INSTANT_LOOKUP
] as const;

export type FeatureKey = (typeof featureKeys)[number];

// Browser extension command names (from manifest)
export const CMD_ADAPTIVE_TRANSLATE = 'adaptive-translate' as const;
// export const CMD_INSTANT_LOOKUP = 'instant-lookup' as const;
