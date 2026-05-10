import configStore from '@/lib/config';
import contentManager from '@/lib/content';

class TranslateDir {
  setTranslationDirAndLang(element: HTMLElement): void {
    const config = configStore.get();
    const { dir, langCode: lang } = contentManager.getLanguageDirectionAndLang(
      config.targetLangCode
    );
    element.setAttribute('dir', dir);
    if (lang) {
      element.setAttribute('lang', lang);
    }
  }
}

export default new TranslateDir();
