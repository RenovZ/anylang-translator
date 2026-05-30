import { franc } from 'franc';
import { Readability } from '@mozilla/readability';

import { toast } from '@/components/toast-wrapper';
import { removeDummyNodes } from '@/lib/dom';
import { translateUtils } from '@/lib/translate/utils';
import { DEFAULT_MAX_LENGTH_FOR_LLM, DEFAULT_MIN_LENGTH } from '@/preset/content';
import { FRANC_TO_LANG_CODE } from '@/preset/franc-map';
import { DEFAULT_LANG_DETECTION_SYSTEM_PROMPT } from '@/preset/prompt';
import { GenerateTextParams } from '@/types/background';
import type { LangDetectionMode, TranslatePageRange } from '@/types/config';
import type {
  DetectLangOptions,
  DetectLangResult,
  DocumentInfo,
  FaviconCandidate,
  LangDirection
} from '@/types/content';
import { langCodeSchema, type LangCode } from '@/types/lang';

import configStore from './config';
import i18n from './i18n';
import langManager from './lang';
import logger from './logger';
import { sendMessage } from './protocol';
import providerManager from './provider';

class ContentManager {
  private readonly MAX_ATTEMPTS = 3; // 1 original + 2 retries

  /**
   * Get document info including article content and language detection
   * @param featureConfig - Optional feature config to check for auto-applied sites/languages
   */
  async getDocumentInfo(featureConfig: {
    autoTranslatedSites?: string[];
    autoTranslatedLangs?: LangCode[];
    pageRange: TranslatePageRange;
    langDetectionMode: LangDetectionMode;
  }): Promise<DocumentInfo> {
    const { autoTranslatedSites, autoTranslatedLangs, pageRange, langDetectionMode } =
      featureConfig;
    const documentClone = document.cloneNode(true);
    // TODO: Is this good enough?
    removeDummyNodes(documentClone as Document, pageRange);
    const article = new Readability(documentClone as Document, {
      serializer: (el) => el
    }).parse();
    logger.debug({ article });

    const paragraphs = article?.content ? this.flattenToParagraphs(article.content) : [];
    logger.debug({ paragraphs });

    // Combine title and content for detection
    const title = article?.title || '';
    const content = article?.textContent || '';
    const textForDetection = `${title}\n\n${content}`;

    // Detect language with optional LLM enhancement
    // Only use LLM when user has configured auto-translate or skip languages,
    // otherwise detecting page language with LLM is wasteful since nothing depends on the result.
    const hasAutoAppliedSiteOrLang =
      (autoTranslatedSites?.length ?? 0) > 0 || (autoTranslatedLangs?.length ?? 0) > 0;
    const enableLLM = langDetectionMode === 'llm' && hasAutoAppliedSiteOrLang;
    const { langCode: detectedCodeOrUnd, detectMethod: detectSource } =
      await this.detectLangWithMethod(textForDetection, {
        enableLLM,
        maxLengthForLLM: 1500
      });
    logger.debug({ detectSource, detectedCodeOrUnd });

    return {
      article,
      paragraphs,
      detectedCodeOrUnd,
      detectSource
    };
  }

  /**
   * Flatten and extract text paragraphs from "block-level leaves", returning a flat text array.
   */
  private flattenToParagraphs(root: Node): string[] {
    const TRAILING_PUNCTUATION_RE = /[.!?,:;'"…)}\]]$/;
    const WHITESPACE_RUN_RE = /\s+/g;
    const MIN_PARAGRAPH_LENGTH = 20;

    // —— 1. Define which tags (or computedStyle) count as "block-level"
    const semanticBlocks = new Set([
      'p',
      'article',
      'section',
      'figure',
      'figcaption',
      'blockquote',
      'pre',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'div',
      'header',
      'footer',
      'main',
      'nav'
    ]);

    const isBlockLevel = (node: Node): boolean => {
      // Only element nodes can be block-level
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      const el = node as Element;
      // If tag name is in the list, or computedStyle.display=block
      if (semanticBlocks.has(el.tagName.toLowerCase())) return true;
      const disp = window.getComputedStyle(el).display;
      return disp === 'block' || disp === 'list-item';
    };

    const hasBlockDescendant = (node: Node): boolean => {
      // Non-element nodes won't have block-level descendants
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      const el = node as Element;
      // Check if any descendant is a block-level element
      for (let i = 0; i < el.children.length; i++) {
        const child = el.children[i];
        if (isBlockLevel(child) || hasBlockDescendant(child)) {
          return true;
        }
      }
      return false;
    };

    const paragraphs: string[] = [];

    // Get element text content while considering spaces between inline elements
    const getTextWithSpaces = (element: Element): string => {
      let text = '';
      // Recursively process each child node
      for (const child of Array.from(element.childNodes)) {
        let childText = '';
        if (child.nodeType === Node.TEXT_NODE) {
          childText = child.textContent || '';
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          childText = getTextWithSpaces(child as Element);
        }
        if (text.length > 0 && !text.endsWith(' ') && !TRAILING_PUNCTUATION_RE.test(childText)) {
          text += ' ';
        }
        text += childText;
      }
      return text;
    };

    const walk = (node: Node) => {
      // Skip comment nodes, processing instructions, etc.
      if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.TEXT_NODE) {
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        // If it's a "block-level leaf", extract as paragraph; otherwise descend
        if (isBlockLevel(element) && !hasBlockDescendant(element)) {
          // Use the new method to get text, preserving spaces between inline elements
          const raw = getTextWithSpaces(element).replace(WHITESPACE_RUN_RE, ' ').trim();
          if (raw?.length && raw.length > MIN_PARAGRAPH_LENGTH) {
            // Can adjust minimum length filter as needed
            paragraphs.push(raw);
          }
        } else {
          // Continue traversing child nodes
          for (const child of Array.from(element.childNodes)) {
            walk(child);
          }
        }
      }
      // If it's a text node and its parent is not a "block-level leaf", treat as a standalone paragraph
      else if (node.nodeType === Node.TEXT_NODE) {
        const txt = node.textContent?.replace(WHITESPACE_RUN_RE, ' ').trim();
        if (txt?.length && txt.length > MIN_PARAGRAPH_LENGTH) {
          paragraphs.push(txt);
        }
      }
    };

    // Start traversal from root
    walk(root);
    // Return paragraphs array
    return paragraphs;
  }

  /**
   * Get the favicon url
   */
  getFaviconUrl(): string {
    // Priority list: common rel attributes
    const relList = [
      'icon',
      'shortcut icon',
      'apple-touch-icon',
      'apple-touch-icon-precomposed',
      'mask-icon'
    ];

    const candidates: FaviconCandidate[] = [];

    for (const rel of relList) {
      const links = document.head.querySelectorAll(
        `link[rel="${rel}"]`
      ) as NodeListOf<HTMLLinkElement>;

      links.forEach((link) => {
        if (link.href) {
          const size =
            link.sizes.length > 0
              ? Math.max(...Array.from(link.sizes, (s) => Number.parseInt(s) || 0))
              : 0;

          candidates.push({
            url: link.href,
            size,
            type: link.type || ''
          });
        }
      });
    }

    // Sort by priority:
    // 1. Larger size first
    // 2. SVG format preferred (usually sharper)
    // 3. PNG format preferred over ICO
    candidates.sort((a, b) => {
      if (a.size !== b.size) return b.size - a.size;
      if (a.type === 'image/svg+xml' && b.type !== 'image/svg+xml') return -1;
      if (b.type === 'image/svg+xml' && a.type !== 'image/svg+xml') return 1;
      if (a.type === 'image/png' && b.type === 'image/x-icon') return -1;
      if (b.type === 'image/png' && a.type === 'image/x-icon') return 1;
      return 0;
    });

    // If candidates found, return the best one
    if (candidates.length > 0) {
      return candidates[0].url;
    }

    // If still not found, fall back to /favicon.ico at site root
    const { origin } = window.location;
    return `${origin}/favicon.ico`;
  }

  /**
   * Get language direction (LTR/RTL) and language code
   */
  getLangDirection(targetCode: string): LangDirection {
    const dir = langManager.getLangDir(targetCode);

    const { success, data, error } = langCodeSchema.safeParse(targetCode);
    if (success) return { dir, lang: data };

    logger.warn('Unsupported language code', { targetCode, error });
    return { dir, lang: undefined };
  }

  /**
   * Detect language of text using franc, with optional LLM enhancement.
   * Returns both the detected code and the detection source.
   */
  private async detectLangWithMethod(
    text: string,
    options?: DetectLangOptions
  ): Promise<DetectLangResult> {
    const trimmedText = text.trim();
    const minLength = options?.minLength ?? DEFAULT_MIN_LENGTH;

    if (trimmedText.length < minLength) {
      return { langCode: 'und', detectMethod: 'fallback' };
    }

    // Try LLM detection first if enabled
    if (options?.enableLLM) {
      try {
        const maxLength = options.maxLengthForLLM ?? DEFAULT_MAX_LENGTH_FOR_LLM;
        const textForLLM = translateUtils.cleanText(trimmedText, maxLength);
        const llmResult = await this.detectLangCodeByLLM(textForLLM);
        if (llmResult && llmResult !== 'und') {
          return { langCode: llmResult, detectMethod: 'llm' };
        }
      } catch (error) {
        logger.warn('falling back to franc', { error });
        toast.warn(
          i18n('toast_llm_language_detection_fallback', {
            defaultValue: 'LLM language detection failed, using franc instead'
          })
        );
      }
    }

    // Fallback to franc
    const francResult = franc(trimmedText);
    if (francResult === 'und') {
      return { langCode: 'und', detectMethod: 'fallback' };
    }

    const mappedCode = FRANC_TO_LANG_CODE[francResult] ?? francResult;
    const { success, data: langCode, error } = langCodeSchema.safeParse(mappedCode);
    if (!success) {
      logger.trace({ francResult, mappedCode, error });
      return { langCode: 'und', detectMethod: 'fallback' };
    }
    return { langCode, detectMethod: 'franc' };
  }

  /**
   * Detect language of text using franc, with optional LLM enhancement.
   */
  async detectLangCode(text: string, options?: DetectLangOptions): Promise<LangCode | null> {
    const result = await this.detectLangWithMethod(text, options);
    return result.langCode === 'und' ? null : result.langCode;
  }

  /**
   * Detect language using LLM with retry logic
   */
  private async detectLangCodeByLLM(text: string): Promise<LangCode | null> {
    if (!text.trim()) {
      logger.warn('No text provided');
      return null;
    }

    // Get provider config - use passed or fall back to global
    const config = configStore.get();
    const providerConfig = config.langDetection.provider;
    if (!providerConfig) {
      logger.warn('No provider configured');
      return null;
    }
    if (!providerConfig.enabled) {
      logger.warn('Provider is disabled');
      return null;
    }

    const {
      name: providerName,
      model,
      provider,
      providerOptions: userOptions,
      temperature
    } = providerConfig;
    if (!model.name) {
      throw new Error('detectLanguageWithLLM: model must be provided');
    }

    try {
      const providerOptions = providerManager.overrideOptions(model.name, provider, userOptions);
      const params: GenerateTextParams = {
        providerName,
        system: DEFAULT_LANG_DETECTION_SYSTEM_PROMPT,
        prompt: text,
        temperature,
        providerOptions,
        maxRetries: 0
      };

      for (let attempt = 1; attempt <= this.MAX_ATTEMPTS; attempt++) {
        logger.debug(`generateText`, { attempt, params });
        const response = await sendMessage('generateText', params);
        const detectedLangCode = langManager.parseLangCode(response.text);
        if (detectedLangCode) {
          logger.info({
            detectedLangCode,
            attempt,
            responseText: response.text
          });
          return detectedLangCode;
        }

        logger.debug(`Failed on attempt ${attempt}: ${response.text}`);
      }

      return null;
    } catch (error) {
      logger.error({ error });
      return null;
    }
  }
}

export default new ContentManager();
