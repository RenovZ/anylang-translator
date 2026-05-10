/**
 * DOM filtering utilities migrated from read-frog.
 *
 * Centralises the logic that determines which DOM elements should be excluded
 * during content extraction — hidden elements, non-content tags, and
 * site-specific noise.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Tags that should never be walked into or translated
// ─────────────────────────────────────────────────────────────────────────────

export const FORCE_BLOCK_TAGS = new Set([
  'BODY',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'BR',
  'FORM',
  'SELECT',
  'BUTTON',
  'LABEL',
  'UL',
  'OL',
  'LI',
  'BLOCKQUOTE',
  'PRE',
  'ARTICLE',
  'SECTION',
  'FIGURE',
  'FIGCAPTION',
  'HEADER',
  'FOOTER',
  'MAIN',
  'NAV'
]);

export const MATH_TAGS = new Set([
  'math',
  'maction',
  'annotation',
  'annotation-xml',
  'menclose',
  'merror',
  'mfenced',
  'mfrac',
  'mi',
  'mmultiscripts',
  'mn',
  'mo',
  'mover',
  'mpadded',
  'mphantom',
  'mprescripts',
  'mroot',
  'mrow',
  'ms',
  'mspace',
  'msqrt',
  'mstyle',
  'msub',
  'msubsup',
  'msup',
  'mtable',
  'mtd',
  'mtext',
  'mtr',
  'munder',
  'munderover',
  'semantics'
]);

export const SKIP_TAGS = new Set([
  'HEAD',
  'TITLE',
  'HR',
  'INPUT',
  'TEXTAREA',
  'IMG',
  'VIDEO',
  'AUDIO',
  'CANVAS',
  'SOURCE',
  'TRACK',
  'META',
  'SCRIPT',
  'NOSCRIPT',
  'STYLE',
  'LINK',
  'RT',
  'RP',
  'PRE',
  'svg',
  ...MATH_TAGS
]);

export const OPAQUE_TAGS = new Set(['CODE', 'TIME']);

// force translation style as inline node, but not force the node as inline node
export const FORCE_INLINE_TAGS = new Set(['A', 'BUTTON', 'SELECT', 'OPTION', 'SPAN']);

// ─────────────────────────────────────────────────────────────────────────────
// Tags that are ignorable when they sit *outside* the main content container
// (e.g. <header>, <footer>, <nav> outside <article>/<main>)
// ─────────────────────────────────────────────────────────────────────────────

export const NOISE_TAGS = new Set(['HEADER', 'FOOTER', 'NAV', 'NOSCRIPT']);

// ─────────────────────────────────────────────────────────────────────────────
// Site-specific CSS selectors for elements that should never be walked into.
// Keyed by hostname (includes subdomain prefix).
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_SKIP_SELECTOR_MAP: Record<string, string[]> = {
  'chatgpt.com': ['.ProseMirror'],
  'arxiv.org': ['.ltx_listing'],
  'www.reddit.com': [
    'faceplate-screen-reader-content > *',
    'reddit-header-large *',
    'shreddit-comment-action-row > *',
    'shreddit-post-flair'
  ],
  'www.youtube.com': [
    '#masthead-container *',
    '#guide-inner-content *',
    '#metadata *',
    '#channel-name',
    '.yt-lockup-metadata-view-model__metadata',
    '.yt-spec-avatar-shape__badge-text',
    '.shortsLockupViewModelHostOutsideMetadataSubhead',
    'ytd-comments-header-renderer',
    '#top-row',
    '#header-author',
    '#reply-button-end',
    '#more-replies',
    '#info',
    '#badges *'
  ],
  'discord.com': [
    '[id^="message-username"]',
    'span[class*="-timestamp"]',
    'div[class*="-repliedMessage"]',
    'li[class*="-containerDefault"]',
    '[class*="-subtitleContainer"]',
    '[class*="-formWithLoadedChatInput"]'
  ],
  'github.com': [
    '[aria-labelledby="folders-and-files"] *',
    'header *',
    '#repository-container-header *',
    '[class*="OverviewContent-module__Box_1--"] *',
    'table.diff-table'
  ]
};

export const SITE_FORCE_BLOCK_SELECTOR_MAP: Record<string, string[]> = {
  'github.com': [
    'task-lists' // https://github.com/mengxi-ream/read-frog/issues/867
  ],
  'engoo.com': ['#windowexercise-2 > div > div > div.css-ep7xq6 > div > div > div.css-19m2fbm *'],
  'www.reddit.com': ['shreddit-post-text-body'],
  'www.youtube.com': ['yt-attributed-string > span']
};
