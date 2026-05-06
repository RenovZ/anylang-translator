import config from '@/lib/config';
import logger from '@/lib/logger';
import { onMessage } from '@/lib/protocol';
import shortcut from '@/lib/shortcut';

export default defineBackground({
  type: 'module',
  main: () => {
    logger.info('Welcome.', { id: browser.runtime.id });

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

    shortcut.syncFromBrowser();

    onMessage('openPage', async (message) => {
      const { url, active } = message.data;
      logger.info('openPage', { url, active });
      await browser.tabs.create({ url, active: active ?? true });
    });

    onMessage('openOptionsPage', async () => {
      logger.info('openOptionsPage');
      await browser.runtime.openOptionsPage();
    });
  }
});
