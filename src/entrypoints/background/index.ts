import '@/zod-config';

import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';

import logger from '@/lib/logger';
import { onMessage } from '@/lib/protocol';
import { adaptiveTranslateSession } from '@/lib/session';
import shortcut from '@/lib/shortcut';

import { registerGenerateText } from './generate-text';
import { setUpWebPageTranslationQueue } from './translate-queue';
import { registerTranslate } from './translate-signal';

export default defineBackground({
  type: 'module',
  main: () => {
    logger.info('Welcome.');
    logger.debug({ id: browser.runtime.id });

    void shortcut.main();

    registerGenerateText();

    void adaptiveTranslateSession.init();
    registerTranslate();

    void setUpWebPageTranslationQueue();

    onMessage('openPage', async (message) => {
      const { url, active } = message.data;
      await browser.tabs.create({ url, active: active ?? true });
    });

    onMessage('openOptionsPage', async () => {
      await browser.runtime.openOptionsPage();
    });
  }
});
