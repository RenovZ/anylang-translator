import { browser } from "wxt/browser";
import { syncShortcutsFromBrowser } from "@/lib/preset/shortcut";

export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  // 启动时同步一次
  syncShortcutsFromBrowser();

  // 监听 extension 更新/安装事件（用户可能在更新后修改快捷键）
  browser.runtime.onInstalled.addListener(() => {
    syncShortcutsFromBrowser();
  });
});
