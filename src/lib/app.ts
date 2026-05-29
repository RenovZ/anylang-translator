import { browser } from 'wxt/browser';

const manifest = browser.runtime.getManifest();
export const EXTENSION_VERSION = manifest.version;
export const APP_VERSION = `v${EXTENSION_VERSION}`;
export const APP_NAME = 'Anylang Translator';
