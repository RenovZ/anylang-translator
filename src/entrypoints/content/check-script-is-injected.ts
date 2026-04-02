import { browser } from 'wxt/browser';

/**
 * 响应后台的注入探测消息。
 * 如果内容脚本未成功注入，后台就不会收到这里的确认回复。
 */
export class CheckScriptIsInjected {
  constructor() {
    browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      if ((request as { action?: string }).action === 'contentScriptIsInjected') {
        sendResponse(true);
      }
    });
  }
}
