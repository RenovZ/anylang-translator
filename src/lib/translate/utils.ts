import { MAX_TEXT_LENGTH, WHITESPACE_RUN_RE, ZERO_WIDTH_CHARS_RE } from '@/preset/content';
import type { AdaptiveTranslateContext } from '@/types/prompt';

export class TranslateUtils {
  // Pattern matches numbers with optional thousand separators and decimal points
  // Examples: "123", "1,234", "1,234.56", "1 234", "1.234,56" (European format)
  private readonly NUMERIC_PATTERN = /^[\d\s,.-]+$/;
  private readonly CONTAINS_DIGIT_RE = /\d/;
  private readonly INVISIBLE_TRANSLATION_CHARACTERS_REGEX = /[\u200B-\u200D\uFEFF]/g;

  normalize(value: string | null | undefined): string | null | undefined {
    if (value == null) {
      return value;
    }
    return value.trim() === '' ? null : value;
  }

  normalizeWebPagePromptContext(
    webPageContext?: AdaptiveTranslateContext
  ): AdaptiveTranslateContext | undefined {
    if (!webPageContext) {
      return undefined;
    }

    return {
      webTitle: this.normalize(webPageContext.webTitle),
      webContent: this.normalize(webPageContext.webContent),
      webSummary: this.normalize(webPageContext.webSummary)
    };
  }

  // Helper function to check if content is purely numeric
  isNumericContent(text: string): boolean {
    // Remove whitespace and check if remaining content is numeric
    // Allow numbers, decimals, commas, and common numeric separators
    const cleanedText = text.trim();
    if (!cleanedText) return false;

    if (!this.NUMERIC_PATTERN.test(cleanedText)) return false;

    // Additional check: ensure there's at least one digit
    return this.CONTAINS_DIGIT_RE.test(cleanedText);
  }

  prepareTranslationText(value: string | null | undefined): string {
    return value?.replace(this.INVISIBLE_TRANSLATION_CHARACTERS_REGEX, '').trim() ?? '';
  }

  /**
   * Clean and truncate article text for post processing
   */
  cleanText(textContent: string, maxLength: number = MAX_TEXT_LENGTH): string {
    const cleaned = textContent
      .replace(ZERO_WIDTH_CHARS_RE, '') // zero-width characters
      .replace(WHITESPACE_RUN_RE, ' ')
      .trim();

    return cleaned.length <= maxLength ? cleaned : cleaned.slice(0, maxLength);
  }
}

export const translateUtils = new TranslateUtils();
