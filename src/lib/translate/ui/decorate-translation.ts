import domNode from '@/lib/dom/node';
import { TRANS_STYLE_KEY } from '@/preset/dom';
import type { TranslationNodeStyleConfig } from '@/types/translate';
import { translationNodeStylePresetSchema } from '@/types/translate';

import styleInjector from './style-injector';

class DecorateTranslation {
  async decorateTranslationNode(
    translatedNode: HTMLElement,
    styleConfig: TranslationNodeStyleConfig
  ): Promise<void> {
    if (translationNodeStylePresetSchema.safeParse(styleConfig.preset).error) return;

    const root = domNode.getContainingShadowRoot(translatedNode) ?? document;

    if (styleConfig.isCustom && styleConfig.customCSS) {
      translatedNode.dataset[TRANS_STYLE_KEY] = 'custom';
      await styleInjector.ensureCustomCSS(root, styleConfig.customCSS);
      return;
    }

    translatedNode.dataset[TRANS_STYLE_KEY] = styleConfig.preset;
    styleInjector.ensurePresetStyles(root);
  }
}

export default new DecorateTranslation();
