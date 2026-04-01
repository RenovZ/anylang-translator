import { browser } from "wxt/browser";

// Avoid outputting the error message "Receiving end does not exist" in the Console.
export function checkedLastError(): void {
  browser.runtime.lastError;
}
