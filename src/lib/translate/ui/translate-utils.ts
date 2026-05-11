import { FORCE_INLINE_TAGS } from '@/lib/dom/constants';
import domFilter from '@/lib/dom/filter';
import type { TransNode } from '@/types/dom';

import textPreparation from '../text-preparation';

// Pattern matches numbers with optional thousand separators and decimal points
// Examples: "123", "1,234", "1,234.56", "1 234", "1.234,56" (European format)
const NUMERIC_PATTERN = /^[\d\s,.-]+$/;
const CONTAINS_DIGIT_RE = /\d/;

class TranslateUtils {
  // Helper function to check if content is purely numeric
  isNumericContent(text: string): boolean {
    // Remove whitespace and check if remaining content is numeric
    const cleanedText = text.trim();
    if (!cleanedText) return false;
    // Allow numbers, decimals, commas, and common numeric separators
    if (!NUMERIC_PATTERN.test(cleanedText)) return false;
    // Additional check: ensure there's at least one digit
    return CONTAINS_DIGIT_RE.test(cleanedText);
  }

  isForceInline(targetNode: TransNode): boolean {
    if (domFilter.isHTMLElement(targetNode)) {
      const computedStyle = window.getComputedStyle(targetNode);
      return FORCE_INLINE_TAGS.has(targetNode.tagName) || computedStyle.display.includes('flex');
    }
    return false;
  }

  getDisplayTranslation(
    sourceText: string,
    translatedText: string | undefined
  ): string | undefined {
    if (translatedText === undefined) return undefined;
    return textPreparation.prepareTranslationText(sourceText) ===
      textPreparation.prepareTranslationText(translatedText)
      ? ''
      : translatedText;
  }
}

export default new TranslateUtils();
