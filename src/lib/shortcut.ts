import { browser } from 'wxt/browser';

import { CMD_ADAPTIVE_TRANSLATE, FEAT_ADAPTIVE_TRANSLATE } from '@/preset/feature';
import { featureConfigSchema, type FeatureConfig } from '@/types/config';

import configStore from './config';
import i18n from './i18n';
import logger from './logger';
import { sendMessage } from './protocol';
import { adaptiveTranslateSession } from './session';

/**
 * Shortcut manager - unified handling of shortcut display, parsing, and syncing
 */
class Shortcut {
  // ========== Static config ==========
  private readonly KEY_MAP: Record<string, { win: string; mac: string }> = {
    Alt: { win: 'Alt', mac: '⌥' },
    Ctrl: { win: 'Ctrl', mac: '⌃' },
    Shift: { win: 'Shift', mac: '⇧' },
    Command: { win: 'Command', mac: '⌘' },
    Option: { win: 'Option', mac: '⌥' },
    Meta: { win: 'Meta', mac: '⌘' }
  };

  private readonly MAC_SYMBOL_MAP: Record<string, string> = {
    '⌥': 'Alt',
    '⌘': 'Command',
    '⇧': 'Shift',
    '⌃': 'Ctrl',
    '⎇': 'Alt'
  };

  private readonly COMMAND_MAP = {
    [CMD_ADAPTIVE_TRANSLATE]: FEAT_ADAPTIVE_TRANSLATE
  } as const;

  private readonly SETTINGS_URLS: Record<string, { url: string; description: string }> = {
    chrome: {
      url: 'chrome://extensions/shortcuts',
      description: i18n('shortcuts_settings_chrome', {
        defaultValue: 'Please modify in Chrome extension shortcuts settings page'
      })
    },
    edge: {
      url: 'edge://extensions/shortcuts',
      description: i18n('shortcuts_settings_edge', {
        defaultValue: 'Please modify in Edge extension shortcuts settings page'
      })
    },
    firefox: {
      url: 'about:addons',
      description: i18n('shortcuts_settings_firefox', {
        defaultValue:
          'Please find this extension in Firefox Add-ons Manager, click the gear icon > Manage Extension Shortcuts'
      })
    },
    safari: {
      url: 'x-apple.systempreferences:com.apple.preference.keyboard',
      description: i18n('shortcuts_settings_safari', {
        defaultValue:
          'Safari extension shortcuts need to be configured in System Settings > Keyboard > Shortcuts'
      })
    }
  };

  private initialized = false;

  // ========== Platform detection ==========
  isMac(): boolean {
    if (typeof navigator === 'undefined') return false;
    return navigator.userAgent.toUpperCase().includes('MAC');
  }

  // ========== Formatting ==========
  /**
   * Format a single key name for the current platform's display
   * Windows/Linux: Alt → Alt
   * macOS: Alt → ⌥
   */
  formatKey(key: string): string {
    const normalized = key.charAt(0).toUpperCase() + key.slice(1);
    const mapped = this.KEY_MAP[normalized];
    return mapped ? (this.isMac() ? mapped.mac : mapped.win) : key.toUpperCase();
  }

  /**
   * Format shortcut array for the current platform's display
   * ['Alt', 'Q'] → ['⌥', 'Q'] (macOS)
   */
  formatForDisplay(shortcut: string[]): string[] {
    if (!shortcut?.length) return [];
    return shortcut.map((k) => this.formatKey(k));
  }

  /**
   * Format shortcut array as string (for manifest)
   * ['Alt', 'Q'] → 'Alt+Q'
   */
  toString(shortcut: string[]): string {
    if (!shortcut?.length) return '';
    return shortcut.join('+');
  }

  // ========== Parsing ==========
  /**
   * Parse shortcut string into array
   * Supported formats: "Alt+Q", "Alt+Shift+Q", "⌥C", "⌘⇧A"
   */
  parse(shortcut: string): string[] {
    // First handle special symbols, then split by +
    const normalized = shortcut
      .replace(/[⌥⌘⇧⌃⎇]/g, (match) => `${this.MAC_SYMBOL_MAP[match]}+`)
      .replace(/\+$/, '');

    return normalized.split(/\+/).map((k) => {
      const key = k.trim();
      if (key === 'Command' || key === 'Cmd') return 'Command';
      if (key === 'Option') return 'Alt';
      // Single letter/digit → uppercase
      if (key.length === 1) return key.toUpperCase();
      // Other key names → capitalize first letter
      return key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
    });
  }

  // ========== Browser settings ==========
  /**
   * Get shortcut settings page URL and description
   */
  getSettingsUrl(): { url: string; description: string } {
    const browser = import.meta.env.BROWSER;
    return (
      this.SETTINGS_URLS[browser] ?? {
        url: 'chrome://extensions/shortcuts',
        description: i18n('shortcuts_settings_default', {
          defaultValue: 'Please modify in browser extension shortcuts settings page'
        })
      }
    );
  }

  private register() {
    browser.commands.onCommand.addListener(async (command, tab) => {
      logger.info({ command, tab });
      const featureKey = this.COMMAND_MAP[command as keyof typeof this.COMMAND_MAP];
      if (!featureKey) return;

      const tabId = tab?.id;
      logger.debug({ tabId, featureKey });
      if (!tabId) {
        logger.debug('No active tab found');
        return;
      }
      if (featureKey === 'adaptiveTranslate') {
        const rawTranslateState = adaptiveTranslateSession.get(tabId);
        const enabled = rawTranslateState ? !rawTranslateState.enabled : true;
        return await sendMessage(featureKey, { enabled }, tabId);
      }
    });
  }

  async main() {
    if (this.initialized) {
      logger.debug('Shortcuts already initialized');
      return;
    }
    logger.debug('Initializing shortcuts');

    await this.sync();
    logger.info('Shortcuts synced from browser');
    this.register();
    this.initialized = true;

    logger.debug('Shortcuts initialized');
  }

  /**
   * Try to open the shortcut settings page
   */
  async tryOpenSettings(
    onCopySuccess?: (url: string) => void,
    onCopyFail?: (url: string) => void
  ): Promise<void> {
    const { url } = this.getSettingsUrl();

    // Try to open the page directly; some URLs (like Firefox's about:addons) cannot be opened via tabs.create
    try {
      if (url.startsWith('about:') || url.startsWith('x-apple.')) {
        await sendMessage('openPage', { url });
        return;
      }
    } catch (err) {
      logger.error('Failed to open settings page, falling back to clipboard copy', { err });
    }

    try {
      await navigator.clipboard
        .writeText(url)
        .then(() => onCopySuccess?.(url))
        .catch(() => onCopyFail?.(url));
    } catch (err) {
      logger.error('Failed to copy settings URL to clipboard', { err });
    }
  }

  private async sync(): Promise<boolean> {
    const commands = await browser.commands.getAll();
    const config = configStore.get();

    let updated = false;
    const newConfig = { ...config };

    for (const cmd of commands) {
      logger.debug({ cmd });
      if (!cmd.shortcut) continue;

      const featureKey = this.COMMAND_MAP[cmd.name as keyof typeof this.COMMAND_MAP];
      if (!featureKey) continue;

      const shortcutKeys = this.parse(cmd.shortcut);
      const { success, data, error } = featureConfigSchema.safeParse(config[featureKey]);
      if (!success) {
        logger.warn(`Failed to parse shortcut for feature`, {
          featureKey,
          error
        });
        continue;
      }

      if (!('shortcut' in data)) continue;
      const current = data as typeof data & { shortcut: string[] };

      if (
        shortcutKeys.length !== current.shortcut.length ||
        !shortcutKeys.every((v, i) => v === current.shortcut[i])
      ) {
        (newConfig as unknown as Record<string, FeatureConfig>)[featureKey] = {
          ...current,
          shortcut: shortcutKeys
        };
        updated = true;
      }
    }

    if (updated) {
      try {
        await configStore.set(newConfig);
      } catch (error) {
        logger.error('Failed to sync shortcut from browser', { error });
      }
    }

    return updated;
  }
}

export default new Shortcut();
