import { browser } from 'wxt/browser';
import config from '../config';
import i18n from '../i18n';
import type { FeatureConfig, FeatureConfigKey } from '../types';

function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  return navigator.userAgent.toUpperCase().includes('MAC');
}

const keyMap: Record<string, { win: string; mac: string }> = {
  Alt: { win: 'Alt', mac: '⌥' },
  Ctrl: { win: 'Ctrl', mac: '⌃' },
  Shift: { win: 'Shift', mac: '⇧' },
  Command: { win: 'Command', mac: '⌘' },
  Option: { win: 'Option', mac: '⌥' },
  Meta: { win: 'Meta', mac: '⌘' }
};

// 将单个键名格式化为当前平台的显示名称
function formatKeyForDisplay(key: string): string {
  const upperKey = key.charAt(0).toUpperCase() + key.slice(1);
  const mapped = keyMap[upperKey];
  if (mapped) {
    return isMacPlatform() ? mapped.mac : mapped.win;
  }
  // 字母/数字直接返回大写
  return key.toUpperCase();
}

// 将快捷键数组格式化为当前平台的显示数组
// Windows/Linux: ['Alt', 'Q'] → ['Alt', 'Q']
// macOS: ['Alt', 'Q'] → ['⌥', 'Q']
export function getShortcutDisplay(shortcut: string[]): string[] {
  if (!shortcut || shortcut.length === 0) return [];
  return shortcut.map(formatKeyForDisplay);
}

// 将快捷键数组格式化为字符串（用于 manifest）
// ['Alt', 'Q'] → 'Alt+Q'
export function shortcutToString(shortcut: string[]): string {
  if (!shortcut || shortcut.length === 0) return '';
  return shortcut.join('+');
}

export function getShortcutsSettingsUrl(): { url: string; description: string } {
  const configs: Record<string, { url: string; description: string }> = {
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

  return (
    configs[import.meta.env.BROWSER] ?? {
      url: 'chrome://extensions/shortcuts',
      description: i18n('shortcuts_settings_default', {
        defaultValue: 'Please modify in browser extension shortcuts settings page'
      })
    }
  );
}

/**
 * 尝试打开快捷键设置页面
 * 注意：chrome:// 和 edge:// 链接无法通过 window.open 直接打开
 */
export function openShortcutsSettings(
  onCopySuccess?: (url: string) => void,
  onCopyFail?: (url: string) => void
): void {
  const { url } = getShortcutsSettingsUrl();

  // about: 和 x-apple. 协议可以直接打开
  if (url.startsWith('about:') || url.startsWith('x-apple.')) {
    window.open(url, '_blank');
    return;
  }

  // Chrome/Edge 的内部页面无法通过 JS 打开，复制到剪贴板引导用户手动输入
  if (url.startsWith('chrome://') || url.startsWith('edge://')) {
    navigator.clipboard
      .writeText(url)
      .then(() => onCopySuccess?.(url))
      .catch(() => onCopyFail?.(url));
  }
}

const commandMap = {
  'quick-translate': 'quickTranslate',
  'context-translate': 'contextTranslate',
  'instant-lookup': 'instantLookup',
  'intelligent-input': 'intelligentInput',
  'bilingual-subtitles': 'bilingualSubtitles',
  'panorama-reading': 'panoramaReading',
  'writing-copilot': 'writingCopilot'
} as const;

/**
 * 从浏览器同步快捷键配置到本地存储
 * 用户在浏览器扩展设置页面修改快捷键后调用此函数刷新
 */
export async function syncShortcutsFromBrowser(): Promise<boolean> {
  const commands = await browser.commands.getAll();
  const currentConfig = config.get();
  if (!currentConfig) return false;

  let updated = false;
  const newConfig = { ...currentConfig };

  for (const cmd of commands) {
    if (!cmd.shortcut) continue;
    const configKey = commandMap[cmd.name as keyof typeof commandMap];
    if (!configKey) continue;

    const shortcutKeys = parseShortcutString(cmd.shortcut);
    const cfg = newConfig as Record<FeatureConfigKey, FeatureConfig>;
    const current = currentConfig[configKey] as FeatureConfig;

    if (JSON.stringify(current.shortcut) !== JSON.stringify(shortcutKeys)) {
      cfg[configKey] = { ...current, shortcut: shortcutKeys };
      updated = true;
    }
  }

  if (updated) {
    await config.set(newConfig);
  }

  return updated;
}

// macOS 特殊符号映射到标准键名
const macSymbolMap: Record<string, string> = {
  '⌥': 'Alt',
  '⌘': 'Command',
  '⇧': 'Shift',
  '⌃': 'Ctrl',
  '⎇': 'Alt'
};

/**
 * 将快捷键字符串解析为数组
 * 支持格式："Alt+Q", "Alt+Shift+Q", "⌥C", "⌘⇧A"
 */
function parseShortcutString(shortcut: string): string[] {
  // 先处理特殊符号，再按 + 分割
  const normalized = shortcut
    .replace(/[⌥⌘⇧⌃⎇]/g, (match) => `${macSymbolMap[match]}+`)
    .replace(/\+$/, ''); // 移除末尾的 +

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
