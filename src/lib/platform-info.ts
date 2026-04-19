import { browser } from 'wxt/browser';

import { config } from './config';

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
  // 旧版实现曾单独记录 Firefox 桌面标记，这里暂未保留该字段。
}

/**
 * 负责识别当前环境是移动端还是桌面端，并补充浏览器类型信息。
 */
class PlatformInfo {
  public isMobile: MobileFlags = {
    Android: null,
    BlackBerry: null,
    iOS: null,
    Opera: null,
    Windows: null,
    any: null
  };

  public isDesktop: DesktopFlags = {
    any: true
    // 旧版实现曾在此记录 Firefox 状态。
  };

  public isFirefox = typeof browser !== 'undefined';
  public isOpera: RegExpMatchArray | null = null;

  static getInstance() {
    if (!PlatformInfo.instance) {
      PlatformInfo.instance = new PlatformInfo();
    }
    return PlatformInfo.instance;
  }

  private static instance: PlatformInfo;
  private constructor() {
    if (browser.tabs) {
      config.set('originalUserAgent', navigator.userAgent);
    }

    const userAgent =
      (config.get('originalUserAgent') ?? navigator.userAgent) || navigator.userAgent;

    this.isMobile = {
      Android: userAgent.match(/Android/i),
      BlackBerry: userAgent.match(/BlackBerry/i),
      iOS: userAgent.match(/iPhone|iPad|iPod/i),
      Opera: userAgent.match(/Opera Mini/i),
      Windows: userAgent.match(/IEMobile/i) || userAgent.match(/WPDesktop/i),
      any: null
    };

    this.isMobile.any =
      this.isMobile.Android ||
      this.isMobile.BlackBerry ||
      this.isMobile.iOS ||
      this.isMobile.Opera ||
      this.isMobile.Windows;

    this.isDesktop = {
      any: !this.isMobile.any
      // 旧版实现曾在此记录 Firefox 状态。
    };

    this.isFirefox = typeof browser !== 'undefined';
    this.isOpera = userAgent.match(/OPR/i);
  }
}

export const platformInfo = PlatformInfo.getInstance();
