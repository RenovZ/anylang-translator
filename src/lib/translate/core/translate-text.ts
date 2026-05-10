import contentManager from '@/lib/content';
import { hashCode } from '@/lib/hash';
import logger from '@/lib/logger';
import { sendMessage } from '@/lib/protocol';
import type { WebPagePromptContext } from '@/types/content';
import type { LangCode } from '@/types/lang';
import type { Provider } from '@/types/provider';

import textPreparation from '../text-preparation';

// Minimum text length for skip language detection (shorter than general detection
// to catch short phrases like "Bonjour!" or "こんにちは")
export const MIN_SKIP_LEN = 10;

class TranslateText {
  /**
   * Check if text should be skipped based on language detection.
   * Uses LLM detection if enabled, falls back to franc library.
   * @param text - Text to detect language for
   * @param skipLanguages - List of languages to skip translation for
   * @param enableLLM - Whether to use LLM for language detection
   * @returns true if text language is in skipLanguages list (should skip translation)
   */
  async shouldSkipLang(
    text: string,
    skipLanguages: LangCode[],
    enableLLM: boolean
  ): Promise<boolean> {
    const detectedLang = await contentManager.detectLanguage(text, {
      minLength: MIN_SKIP_LEN,
      enableLLM
    });

    if (!detectedLang) {
      return false;
    }

    return skipLanguages.includes(detectedLang);
  }

  normalizeVal(value: string | null | undefined): string | null | undefined {
    if (value == null) {
      return value;
    }
    return value.trim() === '' ? null : value;
  }

  normalizeCtx(
    webPageContext?: WebPagePromptContext
  ): WebPagePromptContext | undefined {
    if (!webPageContext) {
      return undefined;
    }

    return {
      webTitle: this.normalizeVal(webPageContext.webTitle),
      webContent: this.normalizeVal(webPageContext.webContent),
      webSummary: this.normalizeVal(webPageContext.webSummary)
    };
  }

  private buildHashComponents(
    preparedText: string,
    providerConfig: Provider,
    sourceLangCode: LangCode | 'auto',
    targetLangCode: LangCode,
    normalizedWebPageContext?: WebPagePromptContext
  ): string[] {
    const hashComponents = [
      preparedText,
      JSON.stringify(providerConfig),
      sourceLangCode,
      targetLangCode
    ];

    if (normalizedWebPageContext) {
      if (normalizedWebPageContext.webTitle) {
        hashComponents.push(`webTitle:${normalizedWebPageContext.webTitle}`);
      }
      if (normalizedWebPageContext.webContent) {
        // Use a substring to avoid huge hash inputs while still differentiating contexts.
        hashComponents.push(`webContent:${normalizedWebPageContext.webContent.slice(0, 1000)}`);
      }
      if (normalizedWebPageContext.webSummary) {
        hashComponents.push(`webSummary:${normalizedWebPageContext.webSummary}`);
      }
    }

    return hashComponents;
  }

  /**
   * Core translation function — pure, zero config fetching.
   * All dependencies must be provided explicitly.
   */
  async translateTextCore(options: {
    text: string;
    sourceLangCode: LangCode | 'auto';
    targetLangCode: LangCode;
    providerConfig: Provider;
    enableAIContentAware?: boolean;
    extraHashTags?: string[];
    webPageContext?: WebPagePromptContext;
  }): Promise<string> {
    const {
      text,
      sourceLangCode,
      targetLangCode,
      providerConfig,
      extraHashTags = [],
      webPageContext
    } = options;

    const preparedText = textPreparation.prepareTranslationText(text);
    if (preparedText === '') {
      return '';
    }

    const normalizedWebPageContext = this.normalizeCtx(webPageContext);

    const hashComponents = this.buildHashComponents(
      preparedText,
      providerConfig,
      sourceLangCode,
      targetLangCode,
      normalizedWebPageContext
    );

    // Add extra hash tags for cache differentiation
    hashComponents.push(...extraHashTags);

    const hash = hashCode(hashComponents.join('|'));

    return await sendMessage('enqueueTranslateRequest', {
      text: preparedText,
      sourceLangCode,
      targetLangCode,
      providerConfig,
      scheduleAt: Date.now(),
      hash,
      webTitle: normalizedWebPageContext?.webTitle,
      webContent: normalizedWebPageContext?.webContent,
      webSummary: normalizedWebPageContext?.webSummary
    });
  }

  /**
   * Translate the given text for page translation.
   * This is called by spinner.ts during DOM translation.
   * The full implementation lives in translate-variants.ts (translateTextForPage).
   * This indirection breaks the circular dependency:
   *   translation-modes → spinner → this → translate-variants
   */
  async translateTextForPage(text: string): Promise<string> {
    try {
      // Lazy import to avoid circular dependency at module load time
      const { default: translateVariants } = await import('../translate-variants');
      return await translateVariants.translateTextForPage(text);
    } catch (error) {
      logger.error('translateTextForPage failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      return '';
    }
  }
}

export default new TranslateText();
