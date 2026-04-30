import { browser } from 'wxt/browser';
import shortcut from '@/lib/shortcut';

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  // 启动时同步一次
  shortcut.syncFromBrowser();

  // 监听 extension 更新/安装事件（用户可能在更新后修改快捷键）
  browser.runtime.onInstalled.addListener(() => {
    shortcut.syncFromBrowser();
  });
});
