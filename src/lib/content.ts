import { generateText } from 'ai';
import { franc } from 'franc';
import { Readability } from '@mozilla/readability';

import { GenerateTextParams } from '@/types/background';
import type {
  DetectLanguageOptions,
  DetectLanguageResult,
  DocumentInfo,
  FaviconCandidate,
  LanguageDirectionAndLang
} from '@/types/content';
import { langCodeSchema, type LangCode } from '@/types/lang';
import { AIProvider } from '@/types/provider';

import configStore from './config';
import domManager from './dom';
import langManager from './lang';
import logger, { formatError } from './logger';
import promptManager from './prompt';
import { sendMessage } from './protocol';
import providerManager from './provider';

const MAX_TEXT_LENGTH = 3000;
const ZERO_WIDTH_CHARS_RE = /[\u200B-\u200D\uFEFF]/g;
const WHITESPACE_RUN_RE = /\s+/g;

const DEFAULT_MIN_LENGTH = 10;
const DEFAULT_MAX_LENGTH_FOR_LLM = 500;

class ContentManager {
  private readonly MAX_ATTEMPTS = 3; // 1 original + 2 retries

  /**
   * Clean and truncate article text for post processing
   */
  cleanText(textContent: string, maxLength: number = MAX_TEXT_LENGTH): string {
    const cleaned = textContent
      .replace(ZERO_WIDTH_CHARS_RE, '') // 零宽字符
      .replace(WHITESPACE_RUN_RE, ' ')
      .trim();

    return cleaned.length <= maxLength ? cleaned : cleaned.slice(0, maxLength);
  }

  /**
   * Get document info including article content and language detection
   * @param featureConfig - Optional feature config to check for auto-applied sites/languages
   */
  async getDocumentInfo(featureConfig?: {
    autoAppliedSites?: string[];
    autoAppliedLangs?: string[];
  }): Promise<DocumentInfo> {
    const documentClone = document.cloneNode(true);
    const cfg = configStore.get();
    domManager.prune(documentClone as Document, cfg.quickTranslate.translate.pageRange);
    const article = new Readability(documentClone as Document, {
      serializer: (el) => el
    }).parse();
    const paragraphs = article?.content ? this.flattenToParagraphs(article.content) : [];

    logger.info({ article });

    // Combine title and content for detection
    const title = article?.title || '';
    const content = article?.textContent || '';
    const textForDetection = `${title}\n\n${content}`;

    // Detect language with optional LLM enhancement
    // Only use LLM when user has configured auto-translate or skip languages,
    // otherwise detecting page language with LLM is wasteful since nothing depends on the result.
    const hasAutoAppliedSiteOrLang =
      (featureConfig?.autoAppliedSites?.length ?? 0) > 0 ||
      (featureConfig?.autoAppliedLangs?.length ?? 0) > 0;
    const enableLLM = cfg.languageDetection.mode === 'llm' && hasAutoAppliedSiteOrLang;
    const { code: detectedCodeOrUnd, source: detectionSource } =
      await this.detectLanguageWithSource(textForDetection, {
        enableLLM,
        maxLengthForLLM: 1500
      });

    logger.info({ detectionSource, detectedCodeOrUnd });

    return {
      article,
      paragraphs,
      detectedCodeOrUnd,
      detectionSource
    };
  }

  /**
   * 扁平化提取"块级叶子"中的文本段落，并返回扁平化后的文本数组。
   */
  private flattenToParagraphs(root: Node): string[] {
    const TRAILING_PUNCTUATION_RE = /[.!?,:;'"…)}\]]$/;
    const WHITESPACE_RUN_RE = /\s+/g;
    const MIN_PARAGRAPH_LENGTH = 20;

    // —— 1. 定义哪些标签（或 computedStyle）算"块级"
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
      // 只有元素节点才能是块级
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      const el = node as Element;
      // 如果标签名在列表里，或者 computedStyle.display=block
      if (semanticBlocks.has(el.tagName.toLowerCase())) return true;
      const disp = window.getComputedStyle(el).display;
      return disp === 'block' || disp === 'list-item';
    };

    const hasBlockDescendant = (node: Node): boolean => {
      // 非元素节点不会有块级后代
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      const el = node as Element;
      // 检查子孙是否存在任一块级元素
      for (let i = 0; i < el.children.length; i++) {
        const child = el.children[i];
        if (isBlockLevel(child) || hasBlockDescendant(child)) {
          return true;
        }
      }
      return false;
    };

    const paragraphs: string[] = [];

    // 获取元素的文本内容，同时考虑内联元素之间的空格
    const getTextWithSpaces = (element: Element): string => {
      let text = '';
      // 为每个子节点递归处理
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
      // 跳过注释节点、处理指令等非内容节点
      if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.TEXT_NODE) {
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        // 如果它是一个"块级叶子"，就提取成段落；否则下降
        if (isBlockLevel(element) && !hasBlockDescendant(element)) {
          // 使用新的方法获取文本，保留内联元素之间的空格
          const raw = getTextWithSpaces(element).replace(WHITESPACE_RUN_RE, ' ').trim();
          if (raw?.length && raw.length > MIN_PARAGRAPH_LENGTH) {
            // 可根据需求调整最小长度过滤
            paragraphs.push(raw);
          }
        } else {
          // 继续遍历子节点
          for (const child of Array.from(element.childNodes)) {
            walk(child);
          }
        }
      }
      // 如果是文本节点，且其父容器也不是"块级叶子"时，可以视作一个独立段落
      else if (node.nodeType === Node.TEXT_NODE) {
        const txt = node.textContent?.replace(WHITESPACE_RUN_RE, ' ').trim();
        if (txt?.length && txt.length > MIN_PARAGRAPH_LENGTH) {
          paragraphs.push(txt);
        }
      }
    };

    // 从 root 开始遍历
    walk(root);
    // 返回段落数组
    return paragraphs;
  }

  /**
   * Get the favicon url
   */
  getFaviconUrl(): string {
    // 优先级列表：常见 rel 属性
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

    // 按以下优先级排序：
    // 1. 更大的尺寸优先
    // 2. SVG 格式优先（通常更清晰）
    // 3. PNG 格式优先于 ICO
    candidates.sort((a, b) => {
      if (a.size !== b.size) return b.size - a.size;
      if (a.type === 'image/svg+xml' && b.type !== 'image/svg+xml') return -1;
      if (b.type === 'image/svg+xml' && a.type !== 'image/svg+xml') return 1;
      if (a.type === 'image/png' && b.type === 'image/x-icon') return -1;
      if (b.type === 'image/png' && a.type === 'image/x-icon') return 1;
      return 0;
    });

    // 如果找到了候选图标，返回最优的那个
    if (candidates.length > 0) {
      return candidates[0].url;
    }

    // 如果依然没找到，就回退到站点根目录的 /favicon.ico
    const { origin } = window.location;
    return `${origin}/favicon.ico`;
  }

  /**
   * Get language direction (LTR/RTL) and language code
   */
  getLanguageDirectionAndLang(targetCode: string): LanguageDirectionAndLang {
    const dir = langManager.getLangDirection(targetCode);

    const parseResult = langCodeSchema.safeParse(targetCode);
    if (parseResult.success) return { dir, lang: parseResult.data };

    logger.warn('Unsupported language code', { targetCode, error: parseResult.error });
    return { dir, lang: undefined };
  }

  /**
   * Detect language of text using franc, with optional LLM enhancement.
   * Returns both the detected code and the detection source.
   */
  async detectLanguageWithSource(
    text: string,
    options?: DetectLanguageOptions
  ): Promise<DetectLanguageResult> {
    const trimmedText = text.trim();
    const minLength = options?.minLength ?? DEFAULT_MIN_LENGTH;

    if (trimmedText.length < minLength) {
      return { code: 'und', source: 'fallback' };
    }

    // Try LLM detection first if enabled
    if (options?.enableLLM) {
      try {
        const maxLength = options.maxLengthForLLM ?? DEFAULT_MAX_LENGTH_FOR_LLM;
        const textForLLM = this.cleanText(trimmedText, maxLength);
        const llmResult = await this.detectLanguageWithLLM(textForLLM);
        if (llmResult && llmResult !== 'und') {
          return { code: llmResult, source: 'llm' };
        }
      } catch (error) {
        logger.warn('falling back to franc', {
          error: formatError(error)
        });
        // TODO: 这里怎么用flowbite-svelte/Toast封装toast
        // Replaced sonner toast with logger
        logger.warn('LLM language detection failed, using franc instead');
      }
    }

    // Fallback to franc
    const francResult = franc(trimmedText);
    if (francResult === 'und') {
      return { code: 'und', source: 'fallback' };
    }
    return { code: francResult, source: 'franc' };
  }

  /**
   * Detect language of text using franc, with optional LLM enhancement.
   */
  async detectLanguage(text: string, options?: DetectLanguageOptions): Promise<string | null> {
    const result = await this.detectLanguageWithSource(text, options);
    return result.code === 'und' ? null : result.code;
  }

  /**
   * Detect language using LLM with retry logic
   */
  private async detectLanguageWithLLM(text: string): Promise<LangCode | null> {
    if (!text.trim()) {
      logger.warn('No text provided');
      return null;
    }

    // Get provider config - use passed or fall back to global
    const config = configStore.get();
    const providerConfig = config.languageDetection.provider;
    if (!providerConfig) {
      logger.warn('No provider configured');
      return null;
    }
    if (!providerConfig.enabled) {
      logger.warn('Provider is disabled');
      return null;
    }

    // TODO: Implement go/zen provider detection
    if (providerConfig.type === 'go' || providerConfig.type === 'zen') {
      throw new Error('detectLanguageWithLLM: go/zen provider will come soon');
    }

    try {
      const { model, provider, providerOptions: userOptions, temperature } = providerConfig;
      const providerOptions = providerManager.overrideOptions(model, provider, userOptions);
      const system = promptManager.getLanguageDetection();
      const params: GenerateTextParams = {
        model,
        system,
        prompt: text,
        temperature,
        providerOptions,
        maxRetries: 0
      };

      for (let attempt = 1; attempt <= this.MAX_ATTEMPTS; attempt++) {
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
      logger.error({
        error: formatError(error)
      });
      return null;
    }
  }

  /**
   * Generate a brief summary of article content for translation context
   */
  async generateArticleSummary(
    title: string,
    textContent: string,
    providerConfig: AIProvider
  ): Promise<string | null> {
    const preparedText = this.cleanText(textContent);
    if (!preparedText) {
      return null;
    }

    // TODO: Implement go/zen provider detection
    if (providerConfig.type === 'go' || providerConfig.type === 'zen') {
      throw new Error('generateArticleSummary: go/zen provider will come soon');
    }

    try {
      const { model, provider, providerOptions: userOptions, temperature } = providerConfig;
      const providerOptions = providerManager.overrideOptions(model, provider, userOptions);
      const languageModel = await providerManager.getLanguageModel(model);

      const prompt = `Summarize the following article in 2-3 sentences. Focus on the main topic and key points. Return ONLY the summary, no explanations or formatting.

Title: ${title}

Content:
${preparedText}`;

      const { text: summary } = await generateText({
        model: languageModel,
        prompt,
        temperature,
        providerOptions
      });

      const cleanedSummary = summary.trim();
      logger.info({
        summary: `${cleanedSummary.slice(0, 100)}...`
      });

      return cleanedSummary;
    } catch (error) {
      logger.error({
        error: formatError(error)
      });
      return null;
    }
  }
}

export default new ContentManager();
