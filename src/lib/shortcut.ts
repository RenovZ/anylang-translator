import { browser } from 'wxt/browser';

import { CMD_ADAPTIVE_TRANSLATE, FEAT_ADAPTIVE_TRANSLATE } from '@/preset/feature';
import { featureConfigSchema, type FeatureConfig } from '@/types/config';

import configStore from './config';
import i18n from './i18n';
import logger from './logger';
import { sendMessage } from './protocol';
import { adaptiveTranslateSession } from './session';

/**
 * 快捷键管理器 - 统一处理快捷键的显示、解析和同步
 */
class Shortcut {
  // ========== 静态配置 ==========
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

  // ========== 平台检测 ==========
  isMac(): boolean {
    if (typeof navigator === 'undefined') return false;
    return navigator.userAgent.toUpperCase().includes('MAC');
  }

  // ========== 格式化 ==========
  /**
   * 将单个键名格式化为当前平台的显示名称
   * Windows/Linux: Alt → Alt
   * macOS: Alt → ⌥
   */
  formatKey(key: string): string {
    const normalized = key.charAt(0).toUpperCase() + key.slice(1);
    const mapped = this.KEY_MAP[normalized];
    return mapped ? (this.isMac() ? mapped.mac : mapped.win) : key.toUpperCase();
  }

  /**
   * 将快捷键数组格式化为当前平台的显示数组
   * ['Alt', 'Q'] → ['⌥', 'Q'] (macOS)
   */
  formatForDisplay(shortcut: string[]): string[] {
    if (!shortcut?.length) return [];
    return shortcut.map((k) => this.formatKey(k));
  }

  /**
   * 将快捷键数组格式化为字符串（用于 manifest）
   * ['Alt', 'Q'] → 'Alt+Q'
   */
  toString(shortcut: string[]): string {
    if (!shortcut?.length) return '';
    return shortcut.join('+');
  }

  // ========== 解析 ==========
  /**
   * 将快捷键字符串解析为数组
   * 支持格式："Alt+Q", "Alt+Shift+Q", "⌥C", "⌘⇧A"
   */
  parse(shortcut: string): string[] {
    // 先处理特殊符号，再按 + 分割
    const normalized = shortcut
      .replace(/[⌥⌘⇧⌃⎇]/g, (match) => `${this.MAC_SYMBOL_MAP[match]}+`)
      .replace(/\+$/, '');

    return normalized.split(/\+/).map((k) => {
      const key = k.trim();
      if (key === 'Command' || key === 'Cmd') return 'Command';
      if (key === 'Option') return 'Alt';
      // 单个字母/数字直接大写
      if (key.length === 1) return key.toUpperCase();
      // 其他键名首字母大写
      return key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
    });
  }

  // ========== 浏览器设置 ==========
  /**
   * 获取快捷键设置页面的 URL 和说明
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
    browser.commands.onCommand.addListener(async (command) => {
      logger.info({ command });
      const featureKey = this.COMMAND_MAP[command as keyof typeof this.COMMAND_MAP];
      if (!featureKey) return;
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      const tabId = tab?.id;
      logger.debug({ tabId, featureKey, command });
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
   * 尝试打开快捷键设置页面
   */
  async tryOpenSettings(
    onCopySuccess?: (url: string) => void,
    onCopyFail?: (url: string) => void
  ): Promise<void> {
    const { url } = this.getSettingsUrl();

    // 尝试直接打开页面；某些 URL（如 Firefox 的 about:addons）无法通过 tabs.create 打开
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
