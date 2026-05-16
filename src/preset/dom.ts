export const CONTENT_WRAPPER_CLASS = 'anylang-translated-content-wrapper';
export const INLINE_CONTENT_CLASS = 'anylang-translated-inline-content';
export const BLOCK_CONTENT_CLASS = 'anylang-translated-block-content';
export const FLOAT_WRAP_ATTRIBUTE = 'data-anylang-float-wrap';

export const WALKED_ATTRIBUTE = 'data-anylang-walked';
// paragraph means you need to trigger translation on this element (i.e. we have inline children in it)
export const PARAGRAPH_ATTRIBUTE = 'data-anylang-paragraph';
export const BLOCK_ATTRIBUTE = 'data-anylang-block-node';
export const INLINE_ATTRIBUTE = 'data-anylang-inline-node';

export const TRANSLATE_MODE_ATTRIBUTE = 'data-anylang-translate-mode';

export const MARK_ATTRIBUTES = new Set([
  WALKED_ATTRIBUTE,
  PARAGRAPH_ATTRIBUTE,
  BLOCK_ATTRIBUTE,
  INLINE_ATTRIBUTE
]);

export const NOTRANSLATE_CLASS = 'notranslate';

export const SHADOW_HOST_CLASS = 'anylang-shadow-host';

export const TRANSLATE_ERROR_CONTAINER_CLASS = 'anylang-translate-error-container';

// Dataset key (without 'data-' prefix) used to mark translated nodes with a style preset
export const TRANS_STYLE_ATTR = 'anylang-custom-translate-style';

// Pre-computed camelCase version for use with element.dataset
// camelCase('anylang-custom-translate-style') = 'anylangCustomTranslateStyle'
export const TRANS_STYLE_KEY = 'anylangCustomTranslateStyle';

export const SPINNER_CLASS = 'anylang-spinner';

export const PRESET_STYLES_INJECTOR_ID = 'anylang-preset-styles';

export const CUSTOM_STYLES_INJECTOR_ID = 'anylang-custom-styles';

export const CUSTOM_PRESET_STYLES_INJECTOR_ID = 'anylang-custom-preset-styles';
