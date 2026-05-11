import configStore from '@/lib/config';
import contentManager from '@/lib/content';

class TranslateDir {
  setDirAndLang(element: HTMLElement): void {
    const config = configStore.get();
    const { dir, lang } = contentManager.getLangDirection(config.targetLangCode);
    element.setAttribute('dir', dir);
    if (lang) {
      element.setAttribute('lang', lang);
    }
  }
}

export default new TranslateDir();
