import configStore from '@/lib/config';
import type { LangCode } from '@/types/lang';

class FilterSmallParagraph {
  private countWords(text: string, langCode: LangCode): number {
    // Convert language code to a locale for Intl.Segmenter
    // LangCode in this project is already in BCP-47 format (e.g. 'en', 'zh-CN')
    const locale = langCode ?? 'en';
    const segmenter = new Intl.Segmenter(locale, { granularity: 'word' });
    return [...segmenter.segment(text)].filter((s) => s.isWordLike).length;
  }

  async isSmallParagraph(text: string): Promise<boolean> {
    const config = configStore.get();
    const { minCharactersPerNode, minWordsPerNode } = config.quickTranslate.translate;
    // Use the detected language code for word-counting locale; fall back to target language
    const sourceCode = config.sourceLangCode ?? (config.langDetection.langCode as LangCode) ?? 'en';

    if (minCharactersPerNode > 0 && text.length < minCharactersPerNode) return true;

    if (minWordsPerNode > 0) {
      if (this.countWords(text, sourceCode as LangCode) < minWordsPerNode) return true;
    }

    return false;
  }
}

export default new FilterSmallParagraph();
