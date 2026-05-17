import '@/zod-config';

import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';

import config from '@/lib/config';
import logger from '@/lib/logger';
import { onMessage } from '@/lib/protocol';
import { adaptiveTranslateSession } from '@/lib/session';
import shortcut from '@/lib/shortcut';

import { registerGenerateText } from './generate-text';
import { setUpSubtitlesTranslationQueue, setUpWebPageTranslationQueue } from './translate-queue';
import { registerTranslate } from './translate-signal';

export default defineBackground({
  type: 'module',
  main: () => {
    logger.info('Welcome.');
    logger.debug({ id: browser.runtime.id });

    browser.runtime.onInstalled.addListener(async (details) => {
      await config.init();

      // Open tutorial page when extension is installed
      if (details.reason === 'install') {
        // TODO: do something on install
      }

      // Clear blog cache on extension update to fetch latest blog posts
      if (details.reason === 'update') {
        logger.info('Extension updated, fetching latest change logs');
        // TODO: fetch latest change logs
      }
    });

    void shortcut.main();

    registerGenerateText();

    void adaptiveTranslateSession.init();
    registerTranslate();

    void setUpWebPageTranslationQueue();
    void setUpSubtitlesTranslationQueue();

    onMessage('instantLookup', async (msg) => {
      logger.debug({ msg });
    });
    onMessage('intelligentInput', async (msg) => {
      logger.debug({ msg });
    });
    onMessage('bilingualSubtitles', async (msg) => {
      logger.debug({ msg });
    });
    onMessage('panoramaReading', async (msg) => {
      logger.debug({ msg });
    });
    onMessage('writingCopilot', async (msg) => {
      logger.debug({ msg });
    });

    onMessage('openPage', async (message) => {
      const { url, active } = message.data;
      await browser.tabs.create({ url, active: active ?? true });
    });

    onMessage('openOptionsPage', async () => {
      await browser.runtime.openOptionsPage();
    });
  }
});
