import { DetectedLangCode, LangCode } from './lang';

// Detection source type
export type DetectMethod = 'llm' | 'franc' | 'fallback';

/**
 * Language detection options
 */
export interface DetectLangOptions {
  /** Minimum text length to attempt detection (default: 10) */
  minLength?: number;
  /** Enable LLM detection */
  enableLLM?: boolean;
  /** Max text length for LLM detection (default: 500) */
  maxLengthForLLM?: number;
}

/**
 * Language detection result
 */
export interface DetectLangResult {
  langCode: LangCode | 'und';
  detectMethod: DetectMethod;
}

export type LangDir = 'ltr' | 'rtl';

/**
 * Language direction and lang info
 */
export interface LangDirection {
  dir: LangDir;
  lang?: LangCode;
}

/**
 * Favicon candidate info
 */
export interface FaviconCandidate {
  url: string;
  size: number;
  type: string;
}

/**
 * Document info returned by getDocumentInfo
 * Based on Readability.parse() return type
 */
export interface DocumentInfo {
  article: {
    title?: string | null;
    content?: Node | null;
    textContent?: string | null;
    length?: number | null;
    excerpt?: string | null;
    byline?: string | null;
    dir?: string | null;
    siteName?: string | null;
    lang?: string | null;
    publishedTime?: string | null;
  } | null;
  paragraphs: string[];
  detectedCodeOrUnd: DetectedLangCode;
  detectSource: DetectMethod;
}

/**
 * Minimal webpage context used as context for AI translation prompts
 */
export interface WebPageContext {
  webTitle: string;
}

/**
 * Cached webpage context keyed by URL
 */
export interface CachedWebPageContext extends WebPageContext {
  url: string;
  webContent: string;
}
