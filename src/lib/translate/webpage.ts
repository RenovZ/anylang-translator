import { Readability } from '@mozilla/readability';

import domPrune from '@/lib/dom/prune';
import logger, { formatError } from '@/lib/logger';
import { sendMessage } from '@/lib/protocol';
import type { CachedWebPageContext } from '@/types/content';
import type { ProviderConfig } from '@/types/provider';

class Util {
  readonly CONTENT_LIMIT = 2000;

  truncate(text: string): string {
    return text.slice(0, this.CONTENT_LIMIT);
  }
}

const util = new Util();

class Context {
  cachedWebPageContext: CachedWebPageContext | null = null;

  private async extractWebpageContent(): Promise<string> {
    try {
      const documentClone = document.cloneNode(true) as Document;
      // Use domPrune to remove noise nodes before Readability parsing
      domPrune.prune(documentClone);
      const article = new Readability(documentClone, { serializer: (el) => el }).parse();
      if (article?.textContent) return article.textContent;
    } catch (error) {
      logger.warn('Readability parsing failed, falling back to body textContent:', {
        error: formatError(error)
      });
    }
    return document.body?.textContent || '';
  }

  async get(): Promise<CachedWebPageContext | null> {
    if (typeof window === 'undefined' || typeof document === 'undefined') return null;

    const currentUrl = window.location.href;
    if (this.cachedWebPageContext?.url === currentUrl) {
      return this.cachedWebPageContext;
    }

    this.cachedWebPageContext = {
      url: currentUrl,
      webTitle: document.title || '',
      webContent: util.truncate(await this.extractWebpageContent())
    };
    return this.cachedWebPageContext;
  }
}

export const context = new Context();

class Summary {
  async get(
    webPageContext: CachedWebPageContext | null,
    providerConfig: ProviderConfig,
    enableAIContentAware: boolean
  ): Promise<string | null> {
    // Only LLM (non-free) providers can generate summaries
    if (!enableAIContentAware || providerConfig.type === 'free' || !webPageContext) {
      return null;
    }

    const { webTitle, webContent } = webPageContext;
    if (!webTitle.trim() || !webContent.trim()) {
      return null;
    }

    const msg = {
      webTitle,
      webContent,
      providerConfig
    };
    logger.debug('getOrGenerateWebPageSummary', { msg });
    const summary = await sendMessage('getOrGenerateWebPageSummary', msg);

    return summary || null;
  }
}

export const summary = new Summary();

// class FilterSmallParagraph {
//   private countWords(text: string, langCode: LangCode): number {
//     // Convert language code to a locale for Intl.Segmenter
//     // LangCode in this project is already in BCP-47 format (e.g. 'en', 'zh-CN')
//     const locale = langCode ?? 'en';
//     const segmenter = new Intl.Segmenter(locale, { granularity: 'word' });
//     return [...segmenter.segment(text)].filter((s) => s.isWordLike).length;
//   }

//   // NOTE: we dont need this check anymore
//   // async isSmallParagraph(_text: string): Promise<boolean> {
//   //   const config = configStore.get();
//   //   const { minCharactersPerNode, minWordsPerNode } = config.quickTranslate.translate;
//   //   // Use the detected language code for word-counting locale; fall back to target language
//   //   const sourceCode = config.sourceLangCode ?? (config.langDetection.langCode as LangCode) ?? 'en';

//   //   if (minCharactersPerNode > 0 && text.length < minCharactersPerNode) return true;

//   //   if (minWordsPerNode > 0) {
//   //     if (this.countWords(text, sourceCode as LangCode) < minWordsPerNode) return true;
//   //   }

//   //   return false;
//   // }
// }
