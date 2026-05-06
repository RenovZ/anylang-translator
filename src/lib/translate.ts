import type { PaidProvider } from '@/types/provider';

import type { Config } from './config';
import { exampleQuickTranslatePrompt } from './preset/ai-prompts';

export interface TranslateOptions {
  text: string;
  sourceLang?: string;
  targetLang?: string;
}

export interface TranslateResult {
  translation: string;
  sourceLang?: string;
  targetLang?: string;
  error?: string;
}

class Translation {
  async translate(options: TranslateOptions, config: Config): Promise<TranslateResult> {
    const { text, sourceLang, targetLang } = options;
    const provider = config.quickTranslate.provider;

    if (!text.trim()) {
      return { translation: '', error: 'Empty text' };
    }

    const target = targetLang || config.targetLanguage || 'en';

    if (!provider) {
      return await this.fallbackTranslate(text, target, sourceLang);
    }

    if (provider.type === 'free') {
      if (provider.name === 'Google Translator') {
        return await this.googleTranslate(text, target, sourceLang);
      }
      return await this.bingTranslate(text, target, sourceLang);
    }

    return await this.aiTranslate(text, target, provider as PaidProvider, sourceLang);
  }

  private async bingTranslate(
    text: string,
    targetLang: string,
    sourceLang?: string
  ): Promise<TranslateResult> {
    try {
      const response = await fetch('https://api.bing.microsoft.com/v7.0/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': ''
        },
        body: JSON.stringify([{ Text: text }])
      });

      if (!response.ok) {
        return await this.fallbackTranslate(text, targetLang, sourceLang);
      }

      const data = await response.json();
      return {
        translation: data[0]?.translations[0]?.text || text,
        sourceLang: data[0]?.detectedLanguage?.language || sourceLang,
        targetLang
      };
    } catch {
      return await this.fallbackTranslate(text, targetLang, sourceLang);
    }
  }

  private async googleTranslate(
    text: string,
    targetLang: string,
    sourceLang?: string
  ): Promise<TranslateResult> {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${
        sourceLang || 'auto'
      }&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Google translate failed');
      }

      const data = await response.json();
      const translation = data[0]?.map((item: string[]) => item[0]).join('') || text;

      return {
        translation,
        sourceLang: data[2] || sourceLang,
        targetLang
      };
    } catch (error) {
      return {
        translation: text,
        error: error instanceof Error ? error.message : 'Translation failed'
      };
    }
  }

  private async fallbackTranslate(
    text: string,
    targetLang: string,
    sourceLang?: string
  ): Promise<TranslateResult> {
    return await this.googleTranslate(text, targetLang, sourceLang);
  }

  private async aiTranslate(
    text: string,
    targetLang: string,
    provider: PaidProvider,
    sourceLang?: string
  ): Promise<TranslateResult> {
    try {
      const prompt = exampleQuickTranslatePrompt.prompt
        .replace(/\{\{selection\}\}/g, text)
        .replace(/\{\{targetLanguage\}\}/g, targetLang);

      const response = await fetch(provider.baseUrl || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${provider.apiKey || ''}`
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [
            { role: 'system', content: exampleQuickTranslatePrompt.systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: provider.temperature ?? 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`AI translation failed: ${response.statusText}`);
      }

      const data = await response.json();
      const translation = data.choices?.[0]?.message?.content || text;

      return {
        translation,
        sourceLang,
        targetLang
      };
    } catch (error) {
      return {
        translation: text,
        error: error instanceof Error ? error.message : 'AI translation failed'
      };
    }
  }

  getSelectedText(): string {
    const selection = window.getSelection();
    return selection?.toString().trim() || '';
  }

  getSurroundingParagraphs(): string {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return '';

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    let element: HTMLElement | null =
      container.nodeType === Node.TEXT_NODE
        ? (container.parentElement as HTMLElement)
        : (container as HTMLElement);

    while (element && !this.isBlockElement(element)) {
      element = element.parentElement;
    }

    return element?.textContent?.trim() || '';
  }

  private isBlockElement(element: HTMLElement): boolean {
    const blockElements = ['P', 'DIV', 'SECTION', 'ARTICLE', 'LI', 'TD', 'TH', 'BLOCKQUOTE'];
    return blockElements.includes(element.tagName);
  }
}

export default new Translation();
