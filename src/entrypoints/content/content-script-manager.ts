import config, { type Config } from '@/lib/config';
import translationService from '@/lib/translate';
import {
  MSG_CONTEXT_TRANSLATE,
  MSG_INSTANT_LOOKUP,
  MSG_INTELLIGENT_INPUT,
  MSG_QUICK_TRANSLATE
} from '@/lib/preset/constants';

import NotificationManager from './notification-manager';
import TranslatePopup from './translate-popup';

interface Message {
  type: string;
  action?: string;
}

export class ContentScriptManager {
  private static instance: ContentScriptManager;
  private configCache: Config | null = null;
  private unwatch: (() => void) | null = null;

  private constructor() {}

  static getInstance(): ContentScriptManager {
    if (!ContentScriptManager.instance) {
      ContentScriptManager.instance = new ContentScriptManager();
    }
    return ContentScriptManager.instance;
  }

  main(): void {
    console.log('AnyLang content script loaded');

    this.setupConfigWatcher();
    this.setupMessageListener();
    this.setupCleanupHandler();
  }

  private setupConfigWatcher(): void {
    this.unwatch = config.subscribe((value) => {
      this.configCache = value;
    });
  }

  private setupMessageListener(): void {
    browser.runtime.onMessage.addListener((message: unknown) => {
      this.handleMessage(message as Message);
    });
  }

  private setupCleanupHandler(): void {
    window.addEventListener('unload', () => {
      this.cleanup();
    });
  }

  private async handleMessage(message: Message): Promise<void> {
    if (message.type === MSG_QUICK_TRANSLATE || message.action === 'quick-translate') {
      await this.handleQuickTranslate();
    }
  }

  private async handleQuickTranslate(): Promise<void> {
    const selectedText = translationService.getSelectedText();

    if (!selectedText) {
      NotificationManager.show('Please select text to translate');
      return;
    }

    const currentConfig = this.configCache || config.get();
    if (!currentConfig) {
      NotificationManager.show('Configuration not loaded');
      return;
    }

    TranslatePopup.show(selectedText, 'Translating...', true);

    try {
      const result = await translationService.translate(
        {
          text: selectedText,
          targetLang: currentConfig.targetLanguage
        },
        currentConfig
      );

      if (result.error) {
        TranslatePopup.show(selectedText, `Error: ${result.error}`, false, true);
      } else {
        TranslatePopup.show(selectedText, result.translation, false);
      }
    } catch (error) {
      TranslatePopup.show(
        selectedText,
        `Error: ${error instanceof Error ? error.message : 'Translation failed'}`,
        false,
        true
      );
    }
  }

  private cleanup(): void {
    if (this.unwatch) {
      this.unwatch();
    }
    TranslatePopup.remove();
  }
}

export default ContentScriptManager.getInstance();
