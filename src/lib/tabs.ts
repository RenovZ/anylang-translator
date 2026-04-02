import { type Browser, browser } from 'wxt/browser';

/**
 * 创建新标签页；桌面端会尽量把当前标签页设置为 opener，便于保持跳转关系。
 */
export function tabsCreate(url: string, callback?: (tab: Browser.tabs.Tab) => void): void {
  const userAgent = navigator.userAgent;
  const isMobile =
    /Android/i.test(userAgent) ||
    /BlackBerry/i.test(userAgent) ||
    /iPhone|iPad|iPod/i.test(userAgent) ||
    /Opera Mini/i.test(userAgent) ||
    /IEMobile/i.test(userAgent) ||
    /WPDesktop/i.test(userAgent);

  const createTab = (openerTabId?: number) => {
    if (callback) {
      browser.tabs.create({ url, openerTabId }, callback);
    } else {
      browser.tabs.create({ url, openerTabId });
    }
  };

  if (isMobile) {
    createTab();
    return;
  }

  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    createTab(tabs[0]?.id);
  });
}
