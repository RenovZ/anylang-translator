import { browser } from 'wxt/browser';

// 读取 runtime.lastError，避免控制台反复输出“Receiving end does not exist”。
export function checkedLastError(): void {
  void browser.runtime.lastError;
}
