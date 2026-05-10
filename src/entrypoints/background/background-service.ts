import { browser } from 'wxt/browser';

import logger, { formatError } from '@/lib/logger';
import shortcut from '@/lib/shortcut';

// import {
//   CMD_BILINGUAL_SUBTITLES,
//   CMD_CONTEXT_TRANSLATE,
//   CMD_INSTANT_LOOKUP,
//   CMD_INTELLIGENT_INPUT,
//   CMD_PANORAMA_READING,
//   CMD_QUICK_TRANSLATE,
//   CMD_WRITING_COPILOT,
//   cmdToMsg,
//   MSG_GET_SHORTCUTS,
//   MSG_PING
// } from '@/preset/constants';

class BackgroundService {
  main(): void {
    logger.info('Welcome to anylang reader.', { id: browser.runtime.id });

    this.syncShortcuts();
    this.setupEventListeners();
  }

  private syncShortcuts(): void {
    shortcut.syncFromBrowser();
  }

  private setupEventListeners(): void {
    browser.runtime.onInstalled.addListener(() => {
      shortcut.syncFromBrowser();
    });

    browser.commands.onCommand.addListener((command) => this.handleCommand(command));
    browser.runtime.onMessage.addListener((message, sender, sendResponse) =>
      this.handleMessage(message, sender, sendResponse)
    );
  }

  private async handleCommand(command: string): Promise<void> {
    logger.info('Command received', { command });

    const activeTab = await this.getActiveTab();
    if (!activeTab?.id) {
      logger.warn('No active tab found');
      return;
    }

    if (this.isInternalPage(activeTab.url)) {
      logger.warn('Cannot inject into browser internal pages');
      return;
    }

    await this.sendCommandToTab(activeTab.id, command);
  }

  private async getActiveTab() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
  }

  private isInternalPage(url?: string): boolean {
    if (!url) return true;
    return (
      url.startsWith('chrome://') ||
      url.startsWith('edge://') ||
      url.startsWith('about:') ||
      url.startsWith('moz-extension://')
    );
  }

  private async sendCommandToTab(tabId: number, command: string): Promise<void> {
    // const messageType = cmdToMsg[command as keyof typeof cmdToMsg];
    // if (!messageType) {
    //   logger.error('Unknown command', { command });
    //   return;
    // }
    // const message = {
    //   type: messageType,
    //   action: command
    // };
    // try {
    //   await browser.tabs.sendMessage(tabId, message);
    // } catch {
    //   await this.injectAndRetry(tabId, message);
    // }
  }

  private async injectAndRetry(
    tabId: number,
    message: { type: string; action: string }
  ): Promise<void> {
    try {
      await browser.scripting.executeScript({
        target: { tabId },
        files: ['/content-scripts/content.js']
      });
      await browser.tabs.sendMessage(tabId, message);
    } catch (error) {
      logger.error('Failed to inject content script', {
        error: formatError(error)
      });
    }
  }

  private handleMessage(
    message: unknown,
    sender: unknown,
    sendResponse: (response?: unknown) => void
  ): boolean {
    logger.info('Background received message', { message, sender });

    this.processMessage(message)
      .then((response) => {
        if (response !== null) {
          sendResponse(response);
        }
      })
      .catch((error) => {
        logger.error('Error handling message', {
          error: formatError(error)
        });
        sendResponse({ error: error.message });
      });

    return true;
  }

  private async processMessage(message: unknown): Promise<unknown> {
    if (typeof message !== 'object' || message === null) {
      return null;
    }

    // const msg = message as { type: string };

    // switch (msg.type) {
    //   case MSG_PING:
    //     return { success: true };
    //   case MSG_GET_SHORTCUTS:
    //     return { shortcuts: shortcut.formatForDisplay(['Alt', 'Q']) };
    //   default:
    //     return null;
    // }
  }
}

export default new BackgroundService();
