import type { Config, DefaultConfig, DefaultConfigName } from "../lib/Config";
// import type { I18n } from "../lib/I18n";
// import type { Languages } from "../lib/Languages";
// import type { PlatformInfo } from "../lib/PlatformInfo";
// import type { PageTranslator } from "../contentScript/PageTranslator";
// import type { ShowOriginal } from "../contentScript/ShowOriginal";

declare global {
  const twpConfig: Config;
  // const twpI18n: I18n;
  // const twpLang: Languages;
  // const platformInfo: PlatformInfo;
  // const pageTranslator: PageTranslator;
  // const showOriginal: ShowOriginal;

  // function checkedLastError(): void;
  // function tabsCreate(url: string, callback?: (tab?: chrome.tabs.Tab) => void): void;

  // interface Window {
  //   isTranslatingSelected?: boolean;
  // }

  // interface TWPBrowserLike {
  //   commands?: {
  //     update(data: { name: string; shortcut: string }): Promise<void>;
  //   };
  //   theme?: {
  //     getCurrent(): Promise<unknown>;
  //     onUpdated: {
  //       addListener(callback: () => void): void;
  //     };
  //   };
  // }

  // const browser: TWPBrowserLike | undefined;
}

export type { DefaultConfig, DefaultConfigName };

export {};
