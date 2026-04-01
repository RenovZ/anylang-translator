import { browser } from "wxt/browser";

export class Tab {
  constructor(url: string, callback?: (tab?: browser.tabs.Tab) => void): void {
    const userAgent = navigator.userAgent;
    const isMobile =
      /Android/i.test(userAgent) ||
      /BlackBerry/i.test(userAgent) ||
      /iPhone|iPad|iPod/i.test(userAgent) ||
      /Opera Mini/i.test(userAgent) ||
      /IEMobile/i.test(userAgent) ||
      /WPDesktop/i.test(userAgent);

    if (isMobile && callback) {
      browser.tabs.create({ url }, callback);
      return;
    }

    if (callback) {
      browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const openerTabId = tabs[0]?.id ?? undefined;
        browser.tabs.create({ url, openerTabId }, callback);
      });
    } else {
      console.error("no tab callback provided")
    }
  }
}
