import { browser, type Browser } from 'wxt/browser';

import { config } from '@/lib/config';
import { checkedLastError } from '@/lib/error';
import { tabsCreate } from '@/lib/tabs';

export class Controller {
  private readonly tabToMimeType: Record<number, string | undefined> = {};
  private readonly tabHasContentScript: Record<number, boolean> = {};
  private currentTabId: number | null = null;

  private readonly navigationsInfo: Record<
    number,
    {
      sourceTabId?: number;
      sourceHost?: string;
      sourcePageLanguageState?: string;
      beforeNavigateIsExecuted?: boolean;
      transitionType?: string;
      promiseResolve?: () => void;
    }
  > = {};

  private readonly tabsInfo: Record<number, { pageLanguageState: string; host: string }> = {};

  constructor(
    private readonly i18n: {
      getMessage(name: string, substitutions?: string | string[] | null): string;
    },
    private readonly lang: { codeToLanguage(code: string): string },
    private readonly platformInfo: {
      isMobile: { any: unknown };
      isDesktop: { any: boolean };
      isFirefox: boolean;
      isOpera: unknown;
    },
    private readonly translationCache: { deleteTranslationCache(reload?: boolean): Promise<void> }
  ) {
    this.initialize();
  }

  /**
   * 初始化后台控制器，集中绑定消息、菜单和导航相关监听器。
   */
  initialize(): void {
    this.bindMimeTypeObserver();
    this.bindRuntimeMessages();
    this.bindInstallAndUpdateHooks();
    this.bindActionContextMenus();
    this.bindCommands();
    this.bindBrowserAndPageActions();
    this.bindAutoTranslateOnLinkFlow();

    config.onReady(() => {
      this.updateContextMenu();
      this.updateTranslateSelectedContextMenu();
      if (!config.get('installDateTime')) {
        config.set('installDateTime', Date.now());
      }
      config.onChanged((name) => {
        if (name === 'showTranslateSelectedContextMenu') {
          this.updateTranslateSelectedContextMenu();
        }
      });
    });
  }

  private bindMimeTypeObserver(): void {
    browser.webRequest.onHeadersReceived.addListener(
      (details) => {
        if (details.tabId === -1) return undefined;
        const contentTypeHeader = details.responseHeaders?.find(
          (header) => header.name.toLowerCase() === 'content-type'
        );
        this.tabToMimeType[details.tabId] = contentTypeHeader?.value?.split(';', 1)[0];
        return undefined;
      },
      { urls: ['*://*/*'], types: ['main_frame'] },
      ['responseHeaders']
    );
  }

  private bindRuntimeMessages(): void {
    // 页面语言状态管理 - 处理页面翻译状态相关消息
    // 主要处理popup、options与content script之间的页面状态同步
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      const action = (request as { action?: string }).action;
      if (!action) return;

      // 获取主框架页面的翻译状态(original/translated)
      if (action === 'getMainFramePageLanguageState') {
        this.sendMessageToMainFrame(
          sender.tab?.id,
          { action: 'getCurrentPageLanguageState' },
          sendResponse
        );
        return true;
      }
      // 获取主框架页面的原始语言
      if (action === 'getMainFrameTabLanguage') {
        this.sendMessageToMainFrame(
          sender.tab?.id,
          { action: 'getOriginalTabLanguage' },
          sendResponse
        );
        return true;
      }
      // 更新上下文菜单的翻译状态
      if (action === 'setPageLanguageState') {
        this.updateContextMenu(
          String((request as { pageLanguageState: string }).pageLanguageState)
        );
      }
      // 打开扩展选项页面
      if (action === 'openOptionsPage') {
        tabsCreate(browser.runtime.getURL('/options.html'));
      }
      // 检测当前标签页的语言
      if (action === 'detectTabLanguage') {
        if (!sender.tab?.id) {
          // 某些场景下消息可能拿不到 tabId，此时退回到未知语言。参考 issue #478。
          sendResponse('und');
          return;
        }
        try {
          if (
            (this.platformInfo.isMobile.any && !this.platformInfo.isFirefox) ||
            (this.platformInfo.isDesktop.any && this.platformInfo.isOpera)
          ) {
            browser.tabs.sendMessage(
              sender.tab.id,
              { action: 'detectLanguageUsingTextContent' },
              { frameId: 0 },
              (result) => sendResponse(result)
            );
          } else {
            browser.tabs.detectLanguage(sender.tab.id, (result) => {
              checkedLastError();
              sendResponse(result);
            });
          }
        } catch (e) {
          console.error(e);
          sendResponse('und');
        }
        return true;
      }
      // 获取当前标签页的主机名
      if (action === 'getTabHostName') {
        const url = sender.tab?.url;
        if (!url) return;
        sendResponse(new URL(url).hostname);
      }
      // 通知所有frame当前frame获得焦点(用于选中文本翻译)
      if (action === 'thisFrameIsInFocus') {
        const tabId = sender.tab?.id;
        if (!tabId) return;
        browser.tabs.sendMessage(tabId, { action: 'anotherFrameIsInFocus' }, checkedLastError);
      }
      // 获取标签页的MIME类型
      if (action === 'getTabMimeType') {
        browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          sendResponse(this.tabToMimeType[tabs[0]?.id ?? -1]);
        });
        return true;
      }
      // 恢复使用指定服务名称的所有标签页
      if (action === 'restorePagesWithServiceNames') {
        browser.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            if (!tab.id) return;
            browser.tabs.sendMessage(tab.id, request, checkedLastError);
          });
        });
      }
      // 授权打开选项页面
      if (action === 'authorizationToOpenOptions') {
        browser.storage.local.set({
          authorizationToOpenOptions: (request as { authorizationToOpenOptions: string })
            .authorizationToOpenOptions
        });
      }

      return;
    });
  }

  private updateTranslateSelectedContextMenu(): void {
    if (!browser.contextMenus) return;
    browser.contextMenus.remove('translate-selected-text', checkedLastError);
    if (config.get('showTranslateSelectedContextMenu') === 'yes') {
      browser.contextMenus.create({
        id: 'translate-selected-text',
        title: this.i18n.getMessage('msgTranslateSelectedText'),
        contexts: ['selection']
      });
    }
  }

  private updateContextMenu(pageLanguageState = 'original'): void {
    if (!browser.contextMenus) return;

    const title =
      pageLanguageState === 'translated'
        ? this.i18n.getMessage('btnRestore')
        : this.i18n.getMessage(
            'msgTranslateFor',
            this.lang.codeToLanguage(config.get('targetLanguage'))
          );

    browser.contextMenus.remove('translate-web-page', checkedLastError);
    browser.contextMenus.remove('translate-restore-this-frame', checkedLastError);

    if (config.get('enableIframePageTranslation') === 'yes') {
      if (config.get('showTranslatePageContextMenu') === 'yes') {
        browser.contextMenus.create({
          id: 'translate-web-page',
          title,
          contexts: ['page', 'frame'],
          documentUrlPatterns: ['http://*/*', 'https://*/*', 'file://*/*', 'ftp://*/*']
        });
      }
    } else {
      if (config.get('showTranslatePageContextMenu') === 'yes') {
        browser.contextMenus.create({
          id: 'translate-web-page',
          title,
          contexts: ['page'],
          documentUrlPatterns: ['http://*/*', 'https://*/*', 'file://*/*', 'ftp://*/*']
        });
      }
      browser.contextMenus.create({
        id: 'translate-restore-this-frame',
        title: this.i18n.getMessage('btnTranslateRestoreThisFrame'),
        contexts: ['frame'],
        documentUrlPatterns: ['http://*/*', 'https://*/*']
      });
    }
  }

  private openPageActionPopup(): void {
    if (!browser.pageAction) return;
    const popupCapable: typeof browser.pageAction & { openPopup?: () => void } = browser.pageAction;
    popupCapable.openPopup?.();
  }

  private openBrowserActionPopup(): void {
    const popupCapable: typeof browser.browserAction & { openPopup?: () => void } =
      browser.browserAction;
    popupCapable.openPopup?.();
  }

  private resetPageAction(tabId: number, forceShow = false): void {
    if (!browser.pageAction) return;
    if (config.get('translateClickingOnce') === 'yes' && !forceShow) {
      browser.pageAction.setPopup({ popup: '', tabId });
      return;
    }
    browser.pageAction.setPopup({
      popup: '/popup.html',
      tabId
    });
  }

  private resetBrowserAction(forceShow = false): void {
    if (config.get('translateClickingOnce') === 'yes' && !forceShow) {
      browser.browserAction.setPopup({ popup: '' });
      return;
    }
    browser.browserAction.setPopup({
      popup: '/popup.html'
    });
  }

  private sendToggleTranslationMessage(tabId: number): void {
    if (config.get('enableIframePageTranslation') === 'yes') {
      browser.tabs.sendMessage(tabId, { action: 'toggle-translation' }, checkedLastError);
    } else {
      browser.tabs.sendMessage(
        tabId,
        { action: 'toggle-translation' },
        { frameId: 0 },
        checkedLastError
      );
    }
  }

  private sendTranslatePageMessage(tabId: number, targetLanguage: string): void {
    if (config.get('enableIframePageTranslation') === 'yes') {
      browser.tabs.sendMessage(
        tabId,
        { action: 'translatePage', targetLanguage },
        checkedLastError
      );
    } else {
      browser.tabs.sendMessage(
        tabId,
        { action: 'translatePage', targetLanguage },
        { frameId: 0 },
        checkedLastError
      );
    }
  }

  private updateActionContextMenu(): void {
    if (!browser.contextMenus) return;
    [
      'browserAction-showPopup',
      'pageAction-showPopup',
      'never-translate',
      'more-options',
      'browserAction-translate-pdf',
      'pageAction-translate-pdf'
    ].forEach((id) => browser.contextMenus.remove(id, checkedLastError));

    browser.contextMenus.create({
      id: 'browserAction-showPopup',
      title: this.i18n.getMessage('btnShowPopup'),
      contexts: ['browser_action']
    });
    browser.contextMenus.create({
      id: 'pageAction-showPopup',
      title: this.i18n.getMessage('btnShowPopup'),
      contexts: ['page_action']
    });
    browser.contextMenus.create({
      id: 'never-translate',
      title: this.i18n.getMessage('btnNeverTranslate'),
      contexts: ['browser_action', 'page_action']
    });
    browser.contextMenus.create({
      id: 'more-options',
      title: this.i18n.getMessage('btnMoreOptions'),
      contexts: ['browser_action', 'page_action']
    });
    browser.contextMenus.create({
      id: 'browserAction-translate-pdf',
      title: this.i18n.getMessage('msgTranslatePDF'),
      contexts: ['browser_action']
    });
    browser.contextMenus.create({
      id: 'pageAction-translate-pdf',
      title: this.i18n.getMessage('msgTranslatePDF'),
      contexts: ['page_action']
    });
  }

  private bindActionContextMenus(): void {
    if (!browser.contextMenus) return;
    this.updateActionContextMenu();

    browser.tabs.onActivated.addListener((activeInfo) => {
      this.currentTabId = activeInfo.tabId;
      this.updateActionContextMenu();
      config.onReady(() => {
        this.updateContextMenu();
        this.updateTranslateSelectedContextMenu();
      });

      browser.tabs.sendMessage(
        activeInfo.tabId,
        { action: 'getCurrentPageLanguageState' },
        { frameId: 0 },
        (state) => {
          checkedLastError();
          if (!state) return;
          config.onReady(() => this.updateContextMenu(String(state)));
        }
      );
    });

    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (tab.active && changeInfo.status === 'loading') {
        config.onReady(() => this.updateContextMenu());
      } else if (changeInfo.status === 'complete') {
        browser.tabs.sendMessage(
          tabId,
          { action: 'contentScriptIsInjected' },
          { frameId: 0 },
          (response) => {
            checkedLastError();
            this.tabHasContentScript[tabId] = Boolean(response);
          }
        );
      }
    });

    browser.tabs.onRemoved.addListener((tabId) => {
      delete this.tabHasContentScript[tabId];
      delete this.tabToMimeType[tabId];
      delete this.navigationsInfo[tabId];
      delete this.tabsInfo[tabId];
    });

    browser.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (!tab.id) return;
        browser.tabs.sendMessage(
          tab.id,
          { action: 'contentScriptIsInjected' },
          { frameId: 0 },
          (response) => {
            checkedLastError();
            if (response) this.tabHasContentScript[tab.id as number] = true;
          }
        );
      });
    });

    browser.contextMenus.onClicked.addListener((info, tab) => {
      if (!tab?.id) return;

      if (info.menuItemId === 'translate-web-page') {
        const mimeType = this.tabToMimeType[tab.id];
        if (mimeType?.toLowerCase() === 'application/pdf' && browser.pageAction) {
          this.openPageActionPopup();
        } else {
          this.sendToggleTranslationMessage(tab.id);
        }
      } else if (info.menuItemId === 'translate-restore-this-frame') {
        browser.tabs.sendMessage(
          tab.id,
          { action: 'toggle-translation' },
          { frameId: info.frameId },
          checkedLastError
        );
      } else if (info.menuItemId === 'translate-selected-text') {
        const tabState = tab as Browser.tabs.Tab & { isInReaderMode?: boolean };
        if (
          browser.pageAction &&
          (!this.tabHasContentScript[tab.id] || Boolean(tabState.isInReaderMode))
        ) {
          browser.pageAction.setPopup({
            popup: `/popup-translate-text.html#text=${encodeURIComponent(info.selectionText ?? '')}`,
            tabId: tab.id
          });
          this.openPageActionPopup();
          this.resetPageAction(tab.id);
        } else {
          browser.tabs.sendMessage(
            tab.id,
            { action: 'TranslateSelectedText', selectionText: info.selectionText },
            checkedLastError
          );
        }
      } else if (info.menuItemId === 'browserAction-showPopup') {
        this.resetBrowserAction(true);
        this.openBrowserActionPopup();
        this.resetBrowserAction();
      } else if (info.menuItemId === 'pageAction-showPopup') {
        this.resetPageAction(tab.id, true);
        this.openPageActionPopup();
        this.resetPageAction(tab.id);
      } else if (info.menuItemId === 'never-translate') {
        if (!tab.url) return;
        config.addSiteToNeverTranslate(new URL(tab.url).hostname);
      } else if (info.menuItemId === 'more-options') {
        tabsCreate(browser.runtime.getURL('/options.html'));
      } else if (info.menuItemId === 'browserAction-translate-pdf') {
        const mimeType = this.tabToMimeType[tab.id];
        if (mimeType?.toLowerCase() === 'application/pdf') {
          this.openBrowserActionPopup();
        } else {
          tabsCreate('https://pdf.translatewebpages.org/');
        }
      } else if (info.menuItemId === 'pageAction-translate-pdf') {
        const mimeType = this.tabToMimeType[tab.id];
        if (mimeType?.toLowerCase() === 'application/pdf') {
          this.openPageActionPopup();
        } else {
          tabsCreate('https://pdf.translatewebpages.org/');
        }
      }
    });
  }

  private bindBrowserAndPageActions(): void {
    config.onReady(() => {
      if (this.platformInfo.isMobile.any) {
        browser.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            if (browser.pageAction && tab.id) browser.pageAction.hide(tab.id);
          });
        });

        browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
          if (changeInfo.status === 'loading' && browser.pageAction) {
            browser.pageAction.hide(tabId);
          }
        });

        browser.browserAction.onClicked.addListener((tab) => {
          if (!tab.id) return;
          browser.tabs.sendMessage(
            tab.id,
            { action: 'showPopupMobile' },
            { frameId: 0 },
            checkedLastError
          );
        });
      } else {
        if (browser.pageAction) {
          browser.pageAction.onClicked.addListener((tab) => {
            if (!tab.id) return;
            if (config.get('translateClickingOnce') === 'yes') {
              this.sendToggleTranslationMessage(tab.id);
            }
          });
        }
        browser.browserAction.onClicked.addListener((tab) => {
          if (!tab.id) return;
          if (config.get('translateClickingOnce') === 'yes') {
            this.sendToggleTranslationMessage(tab.id);
          }
        });

        this.resetBrowserAction();

        config.onChanged((name) => {
          if (name === 'translateClickingOnce') {
            this.resetBrowserAction();
            browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
              if (tabs[0]?.id) this.resetPageAction(tabs[0].id);
            });
          }
        });
      }
    });
  }

  private bindCommands(): void {
    if (!browser.commands) return;
    browser.commands.onCommand.addListener((command) => {
      if (command === 'hotkey-toggle-translation') {
        browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
          if (tabs[0]?.id) this.sendToggleTranslationMessage(tabs[0].id);
        });
      } else if (command === 'hotkey-translate-selected-text') {
        browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
          if (tabs[0]?.id) {
            browser.tabs.sendMessage(
              tabs[0].id,
              { action: 'TranslateSelectedText' },
              checkedLastError
            );
          }
        });
      } else if (command === 'hotkey-swap-page-translation-service') {
        browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
          if (!tabs[0]?.id) return;
          browser.tabs.sendMessage(
            tabs[0].id,
            {
              action: 'swapTranslationService',
              newServiceName: config.swapTranslateProvider()
            },
            checkedLastError
          );
        });
      } else if (command === 'hotkey-show-original') {
        browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
          if (!tabs[0]?.id) return;
          browser.tabs.sendMessage(
            tabs[0].id,
            { action: 'translatePage', targetLanguage: 'original' },
            checkedLastError
          );
        });
      } else if (
        command === 'hotkey-translate-page-1' ||
        command === 'hotkey-translate-page-2' ||
        command === 'hotkey-translate-page-3'
      ) {
        const index =
          command === 'hotkey-translate-page-1' ? 0 : command === 'hotkey-translate-page-2' ? 1 : 2;
        browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
          if (!tabs[0]?.id) return;
          const target = config.get('targetLanguage');
          if (!target) return;
          config.set('targetLanguage', target);
          this.sendTranslatePageMessage(tabs[0].id, target);
        });
      } else if (command === 'hotkey-hot-translate-selected-text') {
        browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
          if (!tabs[0]?.id) return;
          browser.tabs.sendMessage(
            tabs[0].id,
            { action: 'hotTranslateSelectedText' },
            checkedLastError
          );
        });
      }
    });
  }

  private bindInstallAndUpdateHooks(): void {
    browser.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        tabsCreate(browser.runtime.getURL('/options.html'));
        config.onReady(() => {
          if (browser.i18n.getUILanguage() === 'zh-CN') {
            config.set('translateProvider', { name: 'bing' });
          }
        });
      } else if (
        details.reason === 'update' &&
        browser.runtime.getManifest().version !== (details.previousVersion ?? '')
      ) {
        const previousVersion = details.previousVersion ?? '';
        config.onReady(() => {
          if (this.platformInfo.isMobile.any && previousVersion.split('.')[0] === '9') {
            config.set('neverTranslateLangs', []);
            config.set('neverTranslateSites', []);
            config.set('alwaysTranslateLangs', []);
            config.set('alwaysTranslateSites', []);
          }

          if (config.get('showReleaseNotes') === 'yes' && !this.platformInfo.isMobile.any) {
            const last: number | null = config.get('lastTimeShowingReleaseNotes');
            const date = new Date();
            date.setDate(date.getDate() - 26);
            const canShow = !last || date.getTime() > last;
            if (canShow) {
              config.set('lastTimeShowingReleaseNotes', Date.now());
              tabsCreate(browser.runtime.getURL('/options.html#release_notes'));
            }
          }

          this.translationCache.deleteTranslationCache();
          config.set('proxyServers', {});
        });
      }

      // this.config.onReady(() => {
      //   if (this.platformInfo.isMobile.any) {
      //     const enabledProviders = config.get('enabledProviders');
      //     config.set('enabledProviders', enabledProviders);
      //   }
      // });
    });

    browser.runtime.onUpdateAvailable.addListener(() => {
      let reloaded = false;
      setTimeout(() => {
        if (!reloaded) {
          reloaded = true;
          browser.runtime.reload();
        }
      }, 2200);

      browser.tabs.query({}, (tabs) => {
        const cleanUpsPromises = tabs
          .filter((tab): tab is Browser.tabs.Tab & { id: number } => typeof tab.id === 'number')
          .map(
            (tab) =>
              new Promise<void>((resolve) => {
                browser.tabs.sendMessage(tab.id, { action: 'cleanUp' }, () => resolve());
              })
          );

        Promise.all(cleanUpsPromises).finally(() => {
          if (reloaded) return;
          reloaded = true;
          browser.runtime.reload();
        });
      });
    });
  }

  private bindAutoTranslateOnLinkFlow(): void {
    const tabsOnRemoved = (tabId: number): void => {
      delete this.navigationsInfo[tabId];
      delete this.tabsInfo[tabId];
    };

    // 点击链接自动翻译跟踪 - 记录每个标签页的翻译状态和主机名
    // 用于点击链接时判断是否自动翻译目标页面
    const runtimeOnMessage = (request: unknown, sender: Browser.runtime.MessageSender): void => {
      if ((request as { action?: string }).action !== 'setPageLanguageState') return;
      if (!sender.tab?.id) return;
      // 保存标签页的翻译状态和主机信息
      this.tabsInfo[sender.tab.id] = {
        pageLanguageState: String(
          (request as { pageLanguageState?: string }).pageLanguageState ?? 'original'
        ),
        host: new URL(sender.tab.url ?? 'https://example.com').host
      };
    };

    const webNavigationOnCreatedNavigationTarget = (
      details: Browser.webNavigation.WebNavigationSourceCallbackDetails
    ): void => {
      const nav = this.navigationsInfo[details.tabId] ?? {};
      nav.sourceTabId = details.sourceTabId;
      this.navigationsInfo[details.tabId] = nav;
    };

    const webNavigationOnBeforeNavigate = (
      details: Browser.webNavigation.WebNavigationBaseCallbackDetails
    ): void => {
      if (details.frameId !== 0) return;
      const nav = this.navigationsInfo[details.tabId] ?? { sourceTabId: details.tabId };
      nav.beforeNavigateIsExecuted = true;
      if (nav.sourceTabId && this.tabsInfo[nav.sourceTabId]) {
        nav.sourceHost = this.tabsInfo[nav.sourceTabId].host;
        nav.sourcePageLanguageState = this.tabsInfo[nav.sourceTabId].pageLanguageState;
      }
      this.navigationsInfo[details.tabId] = nav;
      nav.promiseResolve?.();
    };

    const webNavigationOnCommitted = async (
      details: Browser.webNavigation.WebNavigationTransitionCallbackDetails
    ): Promise<void> => {
      if (details.frameId !== 0) return;
      const nav = this.navigationsInfo[details.tabId] ?? { sourceTabId: details.tabId };
      nav.transitionType = details.transitionType;
      this.navigationsInfo[details.tabId] = nav;
      if (!nav.beforeNavigateIsExecuted) {
        await new Promise<void>((resolve) => {
          nav.promiseResolve = resolve;
        });
      }
    };

    const webNavigationOnDOMContentLoaded = (
      details: Browser.webNavigation.WebNavigationFramedCallbackDetails
    ): void => {
      if (details.frameId !== 0) return;
      const nav = this.navigationsInfo[details.tabId];
      if (nav?.sourceHost) {
        const host = new URL(details.url).host;
        if (
          nav.transitionType === 'link' &&
          nav.sourcePageLanguageState === 'translated' &&
          nav.sourceHost === host
        ) {
          setTimeout(() => {
            browser.tabs.sendMessage(
              details.tabId,
              { action: 'autoTranslateBecauseClickedALink' },
              { frameId: 0 },
              checkedLastError
            );
          }, 500);
        }
      }
      delete this.navigationsInfo[details.tabId];
    };

    const disable = (): void => {
      Object.keys(this.navigationsInfo).forEach((key) => delete this.navigationsInfo[Number(key)]);
      Object.keys(this.tabsInfo).forEach((key) => delete this.tabsInfo[Number(key)]);
      browser.tabs.onRemoved.removeListener(tabsOnRemoved);
      browser.runtime.onMessage.removeListener(runtimeOnMessage);
      if (browser.webNavigation) {
        browser.webNavigation.onCreatedNavigationTarget.removeListener(
          webNavigationOnCreatedNavigationTarget
        );
        browser.webNavigation.onBeforeNavigate.removeListener(webNavigationOnBeforeNavigate);
        browser.webNavigation.onCommitted.removeListener(webNavigationOnCommitted);
        browser.webNavigation.onDOMContentLoaded.removeListener(webNavigationOnDOMContentLoaded);
      }
    };

    const enable = (): void => {
      disable();
      if (!browser.webNavigation) return;
      browser.tabs.onRemoved.addListener(tabsOnRemoved);
      browser.runtime.onMessage.addListener(runtimeOnMessage);
      browser.webNavigation.onCreatedNavigationTarget.addListener(
        webNavigationOnCreatedNavigationTarget
      );
      browser.webNavigation.onBeforeNavigate.addListener(webNavigationOnBeforeNavigate);
      browser.webNavigation.onCommitted.addListener(webNavigationOnCommitted);
      browser.webNavigation.onDOMContentLoaded.addListener(webNavigationOnDOMContentLoaded);
    };

    config.onChanged((name, newValue) => {
      if (name !== 'autoTranslateWhenClickingALink') return;
      if (newValue === 'yes') enable();
      else disable();
    });

    if (browser.permissions.onRemoved) {
      browser.permissions.onRemoved.addListener((permissions) => {
        if (permissions.permissions?.indexOf('webNavigation') !== -1) {
          config.set('autoTranslateWhenClickingALink', 'no');
        }
      });
    }

    browser.permissions.contains({ permissions: ['webNavigation'] }, (hasPermissions) => {
      if (hasPermissions && config.get('autoTranslateWhenClickingALink') === 'yes') {
        enable();
      } else {
        config.set('autoTranslateWhenClickingALink', 'no');
      }
    });
  }

  private sendMessageToMainFrame(
    tabId: number | undefined,
    message: unknown,
    sendResponse: (value: unknown) => void
  ): void {
    if (!tabId) {
      sendResponse(undefined);
      return;
    }
    browser.tabs.sendMessage(tabId, message, { frameId: 0 }, (response) => {
      checkedLastError();
      sendResponse(response);
    });
  }
}
