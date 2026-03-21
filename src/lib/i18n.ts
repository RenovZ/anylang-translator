import { browser } from 'wxt/browser';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { i18nDevServer } from './const';

const dev = import.meta.env.DEV;

if (dev) {
  console.log('dev mode');
} else {
  console.log('prod mode');
}

i18next.use(LanguageDetector);

if (dev) {
  i18next
    .use(
      new HttpBackend({
        loadPath: `${i18nDevServer}/locales/{{lng}}/{{ns}}.json`,
        addPath: `${i18nDevServer}/locales/{{lng}}/{{ns}}.missing.json`
      })
    )
    .init({
      // debug: true,
      initImmediate: false,
      lng: 'en',
      fallbackLng: 'en',
      ns: ['translation'],
      defaultNS: 'translation',
      interpolation: {
        escapeValue: false
      },
      saveMissing: true,
      missingKeyHandler: async function (lng, ns, key, fallbackValue) {
        console.log('Missing translation hit:', lng, ns, key, fallbackValue);
      }
    });
}

type I18nSubstitutions = string | string[];
type I18nKey = Parameters<typeof browser.i18n.getMessage>[0];

export function i18n(key: I18nKey, substitutions?: I18nSubstitutions): string {
  if (dev) {
    console.log('dev mode');
    return i18next.t(key);
  }

  return browser.i18n.getMessage(key, substitutions) || key;
}

export default i18n;
