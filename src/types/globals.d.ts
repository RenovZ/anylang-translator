// import type { I18n } from "../lib/I18n";

declare global {
  // const twpConfig: Config;
  // const twpI18n: I18n;
  // function checkedLastError(): void;
  // function tabsCreate(url: string, callback?: (tab?: chrome.tabs.Tab) => void): void;
  // interface Window {
  //   isTranslatingSelected?: boolean;
  // }
}

export type {};

export {};

// Type definitions for unplugin-icons
// ~icons/tabler/arrow-right
// ~icons/ri/translate
// ~icons/lucide/anything
declare module '~icons/*' {
  import type { Component } from 'svelte';
  const component: Component;
  export default component;
}
