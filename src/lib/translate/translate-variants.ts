import { toast } from '@/components/isolated-toast';
import configStore from '@/lib/config';
import contentManager from '@/lib/content';
import cryptoPolyfill from '@/lib/crypto-polyfill';
import domFilter from '@/lib/dom/filter';
import domFind from '@/lib/dom/find';
import domTraversal from '@/lib/dom/traversal';
import i18n from '@/lib/i18n';
import logger from '@/lib/logger';
import type { WebPagePromptContext } from '@/types/content';
import type { Point } from '@/types/dom';
import type { LangCode } from '@/types/lang';
import type { Provider } from '@/types/provider';
import type { InputTranslationLang } from '@/types/translate';

import translateText, { MIN_SKIP_LEN } from './core/translate-text';
import translationWalker from './core/translate-walker';
import webpageContext from './webpage-context';
import webpageSummary from './webpage-summary';

const MIN_LANG_DETECT_LEN = 50;

class TranslateVariants {
  validateConfig(): boolean {
    const config = configStore.get();
    const { langCode: detectedCode } = config.langDetection;

    if (
      config.sourceLangCode === config.targetLangCode ||
      (!config.sourceLangCode && detectedCode === config.targetLangCode)
    ) {
      toast.error(
        i18n('toast_translation_same_langauge', {
          defaultValue: 'Source and target languages are the same'
        })
      );
      logger.info('skipped on same language found');
      return false;
    }

    // TODO: 是否需要验证apiKey
    // // check if the API key is configured
    // if (
    //   isAPIProviderConfig(providerConfig) &&
    //   !providerConfig.apiKey?.trim() &&
    //   !['deeplx', 'ollama'].includes(providerConfig.provider)
    // ) {
    //   toast.error(...)
    //   logger.info('skipped on no API key found');
    //   return false;
    // }

    return true;
  }

  // High-level orchestration function
  async removeOrShowNodeTranslation(point: Point): Promise<void> {
    const node = domFind.blockNodeAt(point);
    if (!node || !domFilter.isHTMLElement(node)) return;

    if (!this.validateConfig()) return;

    const id = cryptoPolyfill.getUUID();
    domTraversal.walkAndLabelElement(node, id);
    await translationWalker.run(node, id, true);
  }

  // TODO: 不确定是否要这个功能
  // async isSmallParagraph(text: string): Promise<boolean> {
  //   const config = configStore.get();
  //   const { minCharactersPerNode, minWordsPerNode } = config.quickTranslate.translate.page;
  //   const { sourceCode } = config.sourceLangCode;

  //   if (minCharactersPerNode > 0 && text.length < minCharactersPerNode) return true;

  //   if (minWordsPerNode > 0) {
  //     const finalSourceCode = await getSourceCode(sourceCode);
  //     if (countWords(text, finalSourceCode) < minWordsPerNode) return true;
  //   }

  //   return false;
  // }

  private async isTargetLang(text: string, targetCode: LangCode): Promise<boolean> {
    if (text.length < MIN_LANG_DETECT_LEN) return false;
    const detected = await contentManager.detectLanguage(text, { enableLLM: false });
    return detected === targetCode;
  }

  private async getPageContext(
    providerConfig: Provider,
    enableAIContentAware: boolean,
    includeSummary: boolean
  ): Promise<WebPagePromptContext | undefined> {
    // Only LLM (non-free) providers can use web page context
    if (providerConfig.type === 'free') {
      return undefined;
    }

    const ctx = await webpageContext.getContext();
    if (!ctx) {
      return undefined;
    }

    const webSummary = includeSummary
      ? await webpageSummary.getSummary(ctx, providerConfig, enableAIContentAware)
      : undefined;

    return {
      webTitle: ctx.webTitle,
      webContent: ctx.webContent,
      webSummary: webSummary ?? undefined
    };
  }

  private async doTranslatePage(
    text: string,
    options: {
      extraHashTags?: string[];
      webPageContext?: WebPagePromptContext;
    } = {}
  ): Promise<string> {
    const config = configStore.get();
    const preparedText = text.trim();
    if (preparedText === '') {
      return '';
    }

    const providerConfig = config.quickTranslate.provider;
    const targetLangCode = config.targetLangCode as LangCode;
    const sourceLangCode = (config.sourceLangCode ?? 'auto') as LangCode | 'auto';

    if (await this.isTargetLang(preparedText, targetLangCode)) {
      logger.info(
        `translateTextForPage: skipping translation because text is already in target language. text: ${preparedText}`
      );
      return '';
    }

    // Skip translation if text is in skipLanguages list (page translation only)
    const { skipLanguages } = config.quickTranslate.translate;
    if (skipLanguages.length > 0 && preparedText.length >= MIN_SKIP_LEN) {
      const shouldSkip = await translateText.shouldSkipLang(
        preparedText,
        skipLanguages as LangCode[],
        config.langDetection.mode === 'llm'
      );
      if (shouldSkip) {
        logger.info(
          `translateTextForPage: skipping translation because text is in skip language list. text: ${preparedText}`
        );
        return '';
      }
    }

    return translateText.translateTextCore({
      text: preparedText,
      sourceLangCode,
      targetLangCode,
      providerConfig,
      extraHashTags: options.extraHashTags,
      webPageContext: options.webPageContext
    });
  }

  /**
   * Page translation — uses the quickTranslate provider.
   * Includes skip-language logic (page translation only).
   */
  async translateTextForPage(text: string): Promise<string> {
    const config = configStore.get();
    const providerConfig = config.quickTranslate.provider;
    const webPageCtx = await this.getPageContext(
      providerConfig,
      false /* enableAIContentAware — TODO wire up when config field exists */,
      true
    );

    return this.doTranslatePage(text, {
      webPageContext: webPageCtx
    });
  }

  /**
   * Page title translation — uses page translation settings, but always treats the
   * current source title as the webpage title context.
   */
  async translateTextForPageTitle(text: string): Promise<string> {
    const config = configStore.get();
    const providerConfig = config.quickTranslate.provider;
    const webPageCtx = await this.getPageContext(
      providerConfig,
      false /* enableAIContentAware */,
      false
    );

    return this.doTranslatePage(text, {
      extraHashTags: ['pageTitleTranslation'],
      webPageContext: {
        webTitle: text,
        webContent: webPageCtx?.webContent,
        webSummary: webPageCtx?.webSummary
      }
    });
  }

  private async resolveLang(
    lang: InputTranslationLang,
    sourceLangCode: LangCode | undefined,
    targetLangCode: LangCode
  ): Promise<LangCode> {
    if (lang === 'sourceCode') {
      return (sourceLangCode ?? targetLangCode) as LangCode;
    }
    if (lang === 'targetCode') {
      return targetLangCode;
    }
    return lang as LangCode;
  }

  /**
   * Input translation — translates user-typed text using configured languages.
   */
  async translateTextForInput(
    text: string,
    fromLang: InputTranslationLang,
    toLang: InputTranslationLang
  ): Promise<string> {
    const config = configStore.get();
    const providerConfig = config.quickTranslate.provider;
    const targetLangCode = config.targetLangCode as LangCode;
    const sourceLangCode = config.sourceLangCode as LangCode | undefined;

    const resolvedFromLang = await this.resolveLang(fromLang, sourceLangCode, targetLangCode);
    const resolvedToLang = await this.resolveLang(toLang, sourceLangCode, targetLangCode);

    if (resolvedFromLang === resolvedToLang) {
      return '';
    }

    const webPageCtx = await this.getPageContext(
      providerConfig,
      false /* enableAIContentAware */,
      true
    );

    return translateText.translateTextCore({
      text,
      sourceLangCode: resolvedFromLang,
      targetLangCode: resolvedToLang,
      providerConfig,
      extraHashTags: [`inputTranslation:${fromLang}->${toLang}`],
      webPageContext: webPageCtx
    });
  }
}

export default new TranslateVariants();
