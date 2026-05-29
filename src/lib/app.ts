import { browser } from 'wxt/browser';

export const APP_VERSION = 'v0.0.1';
export const APP_NAME = 'Anylang Translator';
const manifest = browser.runtime.getManifest();
export const EXTENSION_VERSION = manifest.version;
