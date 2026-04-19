import { browser } from 'wxt/browser';

// 检查脚本是否已注入到页面
// 用于检测页面是否有阻止contentScript运行的限制
// 如果监听器不工作，说明contentScript未能成功注入
export class CheckScriptIsInjected {
  constructor() {
    browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      if ((request as { action?: string }).action === 'contentScriptIsInjected') {
        sendResponse(true);
      }
    });
  }
}
