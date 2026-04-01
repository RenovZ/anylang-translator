import { browser } from "wxt/browser";

export interface MobileFlags {
  Android: RegExpMatchArray | null;
  BlackBerry: RegExpMatchArray | null;
  iOS: RegExpMatchArray | null;
  Opera: RegExpMatchArray | null;
  Windows: RegExpMatchArray | null;
  any: RegExpMatchArray | null;
}

export interface DesktopFlags {
  any: boolean;
  // Firefox: boolean;
}

export class PlatformInfo {
  public isMobile: MobileFlags = {
    Android: null,
    BlackBerry: null,
    iOS: null,
    Opera: null,
    Windows: null,
    any: null,
  };

  public isDesktop: DesktopFlags = {
    any: true,
    // Firefox: typeof browser !== "undefined",
  };

  public isFirefox = typeof browser !== "undefined";
  public isOpera: RegExpMatchArray | null = null;

  constructor(config: { get<T>(name: string): T; set<T>(name: string, value: T): void }) {
    if (browser.tabs) {
      config.set("originalUserAgent", navigator.userAgent);
    }

    const userAgent =
      (config.get<string | null>("originalUserAgent") ?? navigator.userAgent) || navigator.userAgent;

    this.isMobile = {
      Android: userAgent.match(/Android/i),
      BlackBerry: userAgent.match(/BlackBerry/i),
      iOS: userAgent.match(/iPhone|iPad|iPod/i),
      Opera: userAgent.match(/Opera Mini/i),
      Windows: userAgent.match(/IEMobile/i) || userAgent.match(/WPDesktop/i),
      any: null,
    };

    this.isMobile.any =
      this.isMobile.Android ||
      this.isMobile.BlackBerry ||
      this.isMobile.iOS ||
      this.isMobile.Opera ||
      this.isMobile.Windows;

    this.isDesktop = {
      any: !this.isMobile.any,
      // Firefox: typeof browser !== "undefined",
    };

    this.isFirefox = typeof browser !== "undefined";
    this.isOpera = userAgent.match(/OPR/i);
  }
}
