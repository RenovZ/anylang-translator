import { browser } from "wxt/browser";

export class CheckScriptIsInjected {
  constructor() {
    browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      if ((request as { action?: string }).action === "contentScriptIsInjected") {
        sendResponse(true);
      }
    });
  }
}
