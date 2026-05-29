import { browser } from 'wxt/browser';

const manifest = browser.runtime.getManifest();
export const APP_VERSION = `v${manifest.version}`;
export const APP_NAME = 'Anylang Translator';
