import configStore from '@/lib/config';
import urlUtils from '@/lib/url';
import type { LangCode } from '@/types/lang';

class AutoTranslation {
  async run(url: string, detectedCodeOrUnd: LangCode | 'und'): Promise<boolean> {
    const config = configStore.get();
    const autoAppliedSites = config.quickTranslate.autoAppliedSites ?? [];
    const autoAppliedLangs = config.quickTranslate.autoAppliedLangs ?? [];

    const doesMatchPattern =
      autoAppliedSites.some((pattern) => urlUtils.matchDomainPattern(url, pattern)) ?? false;

    let doesMatchLanguage = false;
    if (detectedCodeOrUnd !== 'und') {
      doesMatchLanguage = autoAppliedLangs.includes(detectedCodeOrUnd);
    }

    return doesMatchPattern || doesMatchLanguage;
  }
}

export default new AutoTranslation();
