import { Readability } from '@mozilla/readability';

import domPrune from '@/lib/dom/prune';
import logger from '@/lib/logger';
import type { CachedWebPageContext } from '@/types/content';

import webpageContent from './webpage-content';

let cachedWebPageContext: CachedWebPageContext | null = null;

class WebpageContext {
  private async extractWebpageContent(): Promise<string> {
    try {
      const documentClone = document.cloneNode(true) as Document;
      // Use domPrune to remove noise nodes before Readability parsing
      domPrune.prune(documentClone);
      const article = new Readability(documentClone, { serializer: (el) => el }).parse();
      if (article?.textContent) return article.textContent;
    } catch (error) {
      logger.warn('Readability parsing failed, falling back to body textContent:', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
    return document.body?.textContent || '';
  }

  async getContext(): Promise<CachedWebPageContext | null> {
    if (typeof window === 'undefined' || typeof document === 'undefined') return null;

    const currentUrl = window.location.href;
    if (cachedWebPageContext?.url === currentUrl) {
      return cachedWebPageContext;
    }

    cachedWebPageContext = {
      url: currentUrl,
      webTitle: document.title || '',
      webContent: webpageContent.truncate(await this.extractWebpageContent())
    };
    return cachedWebPageContext;
  }
}

export default new WebpageContext();
