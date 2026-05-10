import { sendMessage } from '@/lib/protocol';
import type { CachedWebPageContext } from '@/types/content';
import type { Provider } from '@/types/provider';

class WebpageSummary {
  async getSummary(
    webPageContext: CachedWebPageContext | null,
    providerConfig: Provider,
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

    const summary = await sendMessage('getSummary', {
      webTitle,
      webContent,
      providerConfig
    });

    return summary || null;
  }
}

export default new WebpageSummary();
