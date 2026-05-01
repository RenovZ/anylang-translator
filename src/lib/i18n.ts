import { browser } from 'wxt/browser';

const dev = import.meta.env.DEV;

export type I18nSubstitutions = string | string[];

export type I18nOptions = {
  defaultValue?: string;
  description?: string;
  substitutions?: I18nSubstitutions;
};

function i18n(key: string, options?: I18nOptions): string {
  if (dev) {
    return options?.defaultValue ?? key;
  }

  const message = Reflect.apply(browser.i18n.getMessage, browser.i18n, [
    key,
    options?.substitutions
  ]);

  return (typeof message === 'string' && message) || options?.defaultValue || key;
}

export default i18n;
