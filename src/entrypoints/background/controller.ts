import { browser } from "wxt/browser";

import { checkedLastError } from "@/lib/error";
import { tabsCreate } from "@/lib/tabs";

type ConfigLike = {
  get<T>(name: string): T;
  set<T>(name: string, value: T): void;
  onReady(callback?: () => void): Promise<void>;
  onChanged(callback: (name: string, value: unknown) => void): void;
  swapPageTranslationService(): string;
  addSiteToNeverTranslate(hostname: string): void;
  setTargetLanguage?(lang: string, forTextToo?: boolean): void;
};

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
    private readonly config: ConfigLike,
    private readonly i18n: { getMessage(name: string, substitutions?: string | string[] | null): string },
    private readonly lang: { codeToLanguage(code: string): string },
    private readonly platformInfo: {
      isMobile: { any: unknown };
      isDesktop: { any: boolean };
      isFirefox: boolean;
      isOpera: unknown;
    },
    private readonly translationCache: { deleteTranslationCache(reload?: boolean): Promise<void> }
  ) {}

  initialize(): void {
    this.bindMimeTypeObserver();
    this.bindRuntimeMessages();
    this.bindInstallAndUpdateHooks();
    this.bindActionContextMenus();
    this.bindCommands();
    this.bindBrowserAndPageActions();
    this.bindAutoTranslateOnLinkFlow();

    void this.config.onReady(() => {
      this.updateContextMenu();
      this.updateTranslateSelectedContextMenu();
      if (!this.config.get("installDateTime")) {
        this.config.set("installDateTime", Date.now());
      }
      this.config.onChanged((name) => {
        if (name === "showTranslateSelectedContextMenu") {
          this.updateTranslateSelectedContextMenu();
        }
      });
    });
  }

  private bindMimeTypeObserver(): void {
    browser.webRequest.onHeadersReceived.addListener(
      (details) => {
        if (details.tabId === -1) return;
        const contentTypeHeader = details.responseHeaders?.find(
          (header) => header.name.toLowerCase() === "content-type"
        );
        this.tabToMimeType[details.tabId] = contentTypeHeader?.value?.split(";", 1)[0];
      },
      { urls: ["*://*/*"], types: ["main_frame"] },
      ["responseHeaders"]
    );
  }

  private bindRuntimeMessages(): void {
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      const action = (request as { action?: string }).action;
      if (!action) return;

      if (action === "getMainFramePageLanguageState") {
        this.sendMessageToMainFrame(sender.tab?.id, { action: "getCurrentPageLanguageState" }, sendResponse);
        return true;
      }
      if (action === "getMainFrameTabLanguage") {
        this.sendMessageToMainFrame(sender.tab?.id, { action: "getOriginalTabLanguage" }, sendResponse);
        return true;
      }
      if (action === "setPageLanguageState") {
        this.updateContextMenu(String((request as { pageLanguageState: string }).pageLanguageState));
      }
      if (action === "openOptionsPage") {
        tabsCreate(browser.runtime.getURL("/options/options.html"));
      }
      if (action === "openDonationPage") {
        tabsCreate(browser.runtime.getURL("/options/options.html#donation"));
      }
      if (action === "detectTabLanguage") {
        if (!sender.tab?.id) {
          sendResponse("und");
          return;
        }
        try {
          if (
            (this.platformInfo.isMobile.any && !this.platformInfo.isFirefox) ||
            (this.platformInfo.isDesktop.any && this.platformInfo.isOpera)
          ) {
            browser.tabs.sendMessage(
              sender.tab.id,
              { action: "detectLanguageUsingTextContent" },
              { frameId: 0 },
              (result) => sendResponse(result)
            );
          } else {
            browser.tabs.detectLanguage(sender.tab.id, (result) => {
              checkedLastError();
              sendResponse(result);
            });
          }
        } catch {
          sendResponse("und");
        }
        return true;
      }
      if (action === "getTabHostName") {
        sendResponse(new URL(sender.tab?.url ?? "https://example.com").hostname);
      }
      if (action === "thisFrameIsInFocus") {
        if (sender.tab?.id) {
          browser.tabs.sendMessage(sender.tab.id, { action: "anotherFrameIsInFocus" }, checkedLastError);
        }
      }
      if (action === "getTabMimeType") {
        browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          sendResponse(this.tabToMimeType[tabs[0]?.id ?? -1]);
        });
        return true;
      }
      if (action === "restorePagesWithServiceNames") {
        browser.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            if (typeof tab.id === "number") {
              browser.tabs.sendMessage(tab.id, request, checkedLastError);
            }
          });
        });
      }
      if (action === "authorizationToOpenOptions") {
        browser.storage.local.set({
          authorizationToOpenOptions: (request as { authorizationToOpenOptions: string }).authorizationToOpenOptions,
        });
      }

      return;
    });
  }

  private updateTranslateSelectedContextMenu(): void {
    if (!browser.contextMenus) return;
    browser.contextMenus.remove("translate-selected-text", checkedLastError);
    if (this.config.get<string>("showTranslateSelectedContextMenu") === "yes") {
      browser.contextMenus.create({
        id: "translate-selected-text",
        title: this.i18n.getMessage("msgTranslateSelectedText"),
        contexts: ["selection"],
      });
    }
  }

  private openPageActionPopup(): void {
    if (!browser.pageAction) return;
    const popupCapable = browser.pageAction as typeof browser.pageAction & { openPopup?: () => void };
    popupCapable.openPopup?.();
  }

  private openBrowserActionPopup(): void {
    const popupCapable = browser.browserAction as typeof browser.browserAction & { openPopup?: () => void };
    popupCapable.openPopup?.();
  }

  private updateContextMenu(pageLanguageState = "original"): void {
    if (!browser.contextMenus) return;

    const title =
      pageLanguageState === "translated"
        ? this.i18n.getMessage("btnRestore")
        : this.i18n.getMessage("msgTranslateFor", this.lang.codeToLanguage(this.config.get("targetLanguage")));

    browser.contextMenus.remove("translate-web-page", checkedLastError);
    browser.contextMenus.remove("translate-restore-this-frame", checkedLastError);

    if (this.config.get<string>("enableIframePageTranslation") === "yes") {
      if (this.config.get<string>("showTranslatePageContextMenu") === "yes") {
        browser.contextMenus.create({
          id: "translate-web-page",
          title,
          contexts: ["page", "frame"],
          documentUrlPatterns: ["http://*/*", "https://*/*", "file://*/*", "ftp://*/*"],
        });
      }
    } else {
      if (this.config.get<string>("showTranslatePageContextMenu") === "yes") {
        browser.contextMenus.create({
          id: "translate-web-page",
          title,
          contexts: ["page"],
          documentUrlPatterns: ["http://*/*", "https://*/*", "file://*/*", "ftp://*/*"],
        });
      }
      browser.contextMenus.create({
        id: "translate-restore-this-frame",
        title: this.i18n.getMessage("btnTranslateRestoreThisFrame"),
        contexts: ["frame"],
        documentUrlPatterns: ["http://*/*", "https://*/*"],
      });
    }
  }

  private resetPageAction(tabId: number, forceShow = false): void {
    if (!browser.pageAction) return;
    if (this.config.get<string>("translateClickingOnce") === "yes" && !forceShow) {
      browser.pageAction.setPopup({ popup: "", tabId });
      return;
    }
    browser.pageAction.setPopup({
      popup: this.config.get<string>("useOldPopup") === "yes" ? "popup/old-popup.html" : "popup/popup.html",
      tabId,
    });
  }

  private resetBrowserAction(forceShow = false): void {
    if (this.config.get<string>("translateClickingOnce") === "yes" && !forceShow) {
      browser.browserAction.setPopup({ popup: "" });
      return;
    }
    browser.browserAction.setPopup({
      popup: this.config.get<string>("useOldPopup") === "yes" ? "popup/old-popup.html" : "popup/popup.html",
    });
  }

  private sendToggleTranslationMessage(tabId: number): void {
    if (this.config.get<string>("enableIframePageTranslation") === "yes") {
      browser.tabs.sendMessage(tabId, { action: "toggle-translation" }, checkedLastError);
    } else {
      browser.tabs.sendMessage(tabId, { action: "toggle-translation" }, { frameId: 0 }, checkedLastError);
    }
  }

  private sendTranslatePageMessage(tabId: number, targetLanguage: string): void {
    if (this.config.get<string>("enableIframePageTranslation") === "yes") {
      browser.tabs.sendMessage(tabId, { action: "translatePage", targetLanguage }, checkedLastError);
    } else {
      browser.tabs.sendMessage(
        tabId,
        { action: "translatePage", targetLanguage },
        { frameId: 0 },
        checkedLastError
      );
    }
  }

  private updateActionContextMenu(): void {
    if (!browser.contextMenus) return;
    [
      "browserAction-showPopup",
      "pageAction-showPopup",
      "never-translate",
      "more-options",
      "browserAction-translate-pdf",
      "pageAction-translate-pdf",
    ].forEach((id) => browser.contextMenus.remove(id, checkedLastError));

    browser.contextMenus.create({
      id: "browserAction-showPopup",
      title: this.i18n.getMessage("btnShowPopup"),
      contexts: ["browser_action"],
    });
    browser.contextMenus.create({
      id: "pageAction-showPopup",
      title: this.i18n.getMessage("btnShowPopup"),
      contexts: ["page_action"],
    });
    browser.contextMenus.create({
      id: "never-translate",
      title: this.i18n.getMessage("btnNeverTranslate"),
      contexts: ["browser_action", "page_action"],
    });
    browser.contextMenus.create({
      id: "more-options",
      title: this.i18n.getMessage("btnMoreOptions"),
      contexts: ["browser_action", "page_action"],
    });
    browser.contextMenus.create({
      id: "browserAction-translate-pdf",
      title: this.i18n.getMessage("msgTranslatePDF"),
      contexts: ["browser_action"],
    });
    browser.contextMenus.create({
      id: "pageAction-translate-pdf",
      title: this.i18n.getMessage("msgTranslatePDF"),
      contexts: ["page_action"],
    });
  }

  private bindActionContextMenus(): void {
    if (!browser.contextMenus) return;
    this.updateActionContextMenu();

    browser.tabs.onActivated.addListener((activeInfo) => {
      this.currentTabId = activeInfo.tabId;
      this.updateActionContextMenu();
      void this.config.onReady(() => {
        this.updateContextMenu();
        this.updateTranslateSelectedContextMenu();
      });

      browser.tabs.sendMessage(
        activeInfo.tabId,
        { action: "getCurrentPageLanguageState" },
        { frameId: 0 },
        (state) => {
          checkedLastError();
          if (state) {
            void this.config.onReady(() => this.updateContextMenu(String(state)));
          }
        }
      );
    });

    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (tab.active && changeInfo.status === "loading") {
        void this.config.onReady(() => this.updateContextMenu());
      } else if (changeInfo.status === "complete") {
        browser.tabs.sendMessage(
          tabId,
          { action: "contentScriptIsInjected" },
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
        browser.tabs.sendMessage(tab.id, { action: "contentScriptIsInjected" }, { frameId: 0 }, (response) => {
          checkedLastError();
          if (response) this.tabHasContentScript[tab.id as number] = true;
        });
      });
    });

    browser.contextMenus.onClicked.addListener((info, tab) => {
      if (!tab?.id) return;

      if (info.menuItemId === "translate-web-page") {
        const mimeType = this.tabToMimeType[tab.id];
        if (
          mimeType?.toLowerCase() === "application/pdf" &&
          browser.pageAction
        ) {
          this.openPageActionPopup();
        } else {
          this.sendToggleTranslationMessage(tab.id);
        }
      } else if (info.menuItemId === "translate-restore-this-frame") {
        browser.tabs.sendMessage(
          tab.id,
          { action: "toggle-translation" },
          { frameId: info.frameId },
          checkedLastError
        );
      } else if (info.menuItemId === "translate-selected-text") {
        const tabState = tab as browser.tabs.Tab & { isInReaderMode?: boolean };
        if (
          browser.pageAction &&
          (!this.tabHasContentScript[tab.id] || Boolean(tabState.isInReaderMode))
        ) {
          browser.pageAction.setPopup({
            popup: `popup/popup-translate-text.html#text=${encodeURIComponent(info.selectionText ?? "")}`,
            tabId: tab.id,
          });
          this.openPageActionPopup();
          this.resetPageAction(tab.id);
        } else {
          browser.tabs.sendMessage(
            tab.id,
            { action: "TranslateSelectedText", selectionText: info.selectionText },
            checkedLastError
          );
        }
      } else if (info.menuItemId === "browserAction-showPopup") {
        this.resetBrowserAction(true);
        this.openBrowserActionPopup();
        this.resetBrowserAction();
      } else if (info.menuItemId === "pageAction-showPopup") {
        this.resetPageAction(tab.id, true);
        this.openPageActionPopup();
        this.resetPageAction(tab.id);
      } else if (info.menuItemId === "never-translate") {
        this.config.addSiteToNeverTranslate(new URL(tab.url ?? "https://example.com").hostname);
      } else if (info.menuItemId === "more-options") {
        tabsCreate(browser.runtime.getURL("/options/options.html"));
      } else if (info.menuItemId === "browserAction-translate-pdf") {
        const mimeType = this.tabToMimeType[tab.id];
        if (mimeType?.toLowerCase() === "application/pdf") {
          this.openBrowserActionPopup();
        } else {
          tabsCreate("https://pdf.translatewebpages.org/");
        }
      } else if (info.menuItemId === "pageAction-translate-pdf") {
        const mimeType = this.tabToMimeType[tab.id];
        if (mimeType?.toLowerCase() === "application/pdf") {
          this.openPageActionPopup();
        } else {
          tabsCreate("https://pdf.translatewebpages.org/");
        }
      }
    });
  }

  private bindBrowserAndPageActions(): void {
    void this.config.onReady(() => {
      if (this.platformInfo.isMobile.any) {
        browser.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            if (browser.pageAction && tab.id) browser.pageAction.hide(tab.id);
          });
        });

        browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
          if (changeInfo.status === "loading" && browser.pageAction) {
            browser.pageAction.hide(tabId);
          }
        });

        browser.browserAction.onClicked.addListener((tab) => {
          if (!tab.id) return;
          browser.tabs.sendMessage(tab.id, { action: "showPopupMobile" }, { frameId: 0 }, checkedLastError);
        });
      } else {
        if (browser.pageAction) {
          browser.pageAction.onClicked.addListener((tab) => {
            if (!tab.id) return;
            if (this.config.get<string>("translateClickingOnce") === "yes") {
              this.sendToggleTranslationMessage(tab.id);
            }
          });
        }
        browser.browserAction.onClicked.addListener((tab) => {
          if (!tab.id) return;
          if (this.config.get<string>("translateClickingOnce") === "yes") {
            this.sendToggleTranslationMessage(tab.id);
          }
        });

        this.resetBrowserAction();

        this.config.onChanged((name) => {
          if (name === "useOldPopup") {
            this.resetBrowserAction();
          } else if (name === "translateClickingOnce") {
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
      if (command === "hotkey-toggle-translation") {
        browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
          if (tabs[0]?.id) this.sendToggleTranslationMessage(tabs[0].id);
        });
      } else if (command === "hotkey-translate-selected-text") {
        browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
          if (tabs[0]?.id) {
            browser.tabs.sendMessage(tabs[0].id, { action: "TranslateSelectedText" }, checkedLastError);
          }
        });
      } else if (command === "hotkey-swap-page-translation-service") {
        browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
          if (!tabs[0]?.id) return;
          browser.tabs.sendMessage(
            tabs[0].id,
            { action: "swapTranslationService", newServiceName: this.config.swapPageTranslationService() },
            checkedLastError
          );
        });
      } else if (command === "hotkey-show-original") {
        browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
          if (!tabs[0]?.id) return;
          browser.tabs.sendMessage(
            tabs[0].id,
            { action: "translatePage", targetLanguage: "original" },
            checkedLastError
          );
        });
      } else if (command === "hotkey-translate-page-1" || command === "hotkey-translate-page-2" || command === "hotkey-translate-page-3") {
        const index = command === "hotkey-translate-page-1" ? 0 : command === "hotkey-translate-page-2" ? 1 : 2;
        browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
          if (!tabs[0]?.id) return;
          const target = this.config.get<string[]>("targetLanguages")[index];
          if (!target) return;
          this.config.setTargetLanguage?.(target);
          this.sendTranslatePageMessage(tabs[0].id, target);
        });
      } else if (command === "hotkey-hot-translate-selected-text") {
        browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
          if (!tabs[0]?.id) return;
          browser.tabs.sendMessage(tabs[0].id, { action: "hotTranslateSelectedText" }, checkedLastError);
        });
      }
    });
  }

  private bindInstallAndUpdateHooks(): void {
    browser.runtime.onInstalled.addListener((details) => {
      if (details.reason === "install") {
        tabsCreate(browser.runtime.getURL("/options/options.html"));
        void this.config.onReady(() => {
          if (browser.i18n.getUILanguage() === "zh-CN") {
            this.config.set("pageTranslatorService", "bing");
            this.config.set("textTranslatorService", "bing");
          }
        });
      } else if (
        details.reason === "update" &&
        browser.runtime.getManifest().version !== (details.previousVersion ?? "")
      ) {
        const previousVersion = details.previousVersion ?? "";
        void this.config.onReady(() => {
          if (this.platformInfo.isMobile.any && previousVersion.split(".")[0] === "9") {
            this.config.set("neverTranslateLangs", []);
            this.config.set("neverTranslateSites", []);
            this.config.set("alwaysTranslateLangs", []);
            this.config.set("alwaysTranslateSites", []);
          }

          if (this.config.get<string>("showReleaseNotes") === "yes" && !this.platformInfo.isMobile.any) {
            const last = this.config.get<number | null>("lastTimeShowingReleaseNotes");
            const date = new Date();
            date.setDate(date.getDate() - 26);
            const canShow = !last || date.getTime() > last;
            if (canShow) {
              this.config.set("lastTimeShowingReleaseNotes", Date.now());
              tabsCreate(browser.runtime.getURL("/options/options.html#release_notes"));
            }
          }

          void this.translationCache.deleteTranslationCache();
          this.config.set("textTranslatorService", this.config.get<string[]>("enabledServices")[0]);
          this.config.set("proxyServers", {});
        });
      }

      void this.config.onReady(() => {
        if (this.platformInfo.isMobile.any) {
          const enabledServices = this.config.get<string[]>("enabledServices");
          const index = enabledServices.indexOf("deepl");
          if (index !== -1) {
            enabledServices.splice(index, 1);
            this.config.set("enabledServices", enabledServices);
          }
        }
      });
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
          .filter((tab): tab is browser.tabs.Tab & { id: number } => typeof tab.id === "number")
          .map(
            (tab) =>
              new Promise<void>((resolve) => {
                browser.tabs.sendMessage(tab.id, { action: "cleanUp" }, () => resolve());
              })
          );

        void Promise.all(cleanUpsPromises).finally(() => {
          if (!reloaded) {
            reloaded = true;
            browser.runtime.reload();
          }
        });
      });
    });
  }

  private bindAutoTranslateOnLinkFlow(): void {
    const tabsOnRemoved = (tabId: number): void => {
      delete this.navigationsInfo[tabId];
      delete this.tabsInfo[tabId];
    };

    const runtimeOnMessage = (request: unknown, sender: browser.runtime.MessageSender): void => {
      if ((request as { action?: string }).action !== "setPageLanguageState") return;
      if (!sender.tab?.id) return;
      this.tabsInfo[sender.tab.id] = {
        pageLanguageState: String((request as { pageLanguageState?: string }).pageLanguageState ?? "original"),
        host: new URL(sender.tab.url ?? "https://example.com").host,
      };
    };

    const webNavigationOnCreatedNavigationTarget = (
      details: browser.webNavigation.WebNavigationSourceCallbackDetails
    ): void => {
      const nav = this.navigationsInfo[details.tabId] ?? {};
      nav.sourceTabId = details.sourceTabId;
      this.navigationsInfo[details.tabId] = nav;
    };

    const webNavigationOnBeforeNavigate = (
      details: browser.webNavigation.WebNavigationParentedCallbackDetails
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
      details: browser.webNavigation.WebNavigationTransitionCallbackDetails
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
      details: browser.webNavigation.WebNavigationFramedCallbackDetails
    ): void => {
      if (details.frameId !== 0) return;
      const nav = this.navigationsInfo[details.tabId];
      if (nav?.sourceHost) {
        const host = new URL(details.url).host;
        if (
          nav.transitionType === "link" &&
          nav.sourcePageLanguageState === "translated" &&
          nav.sourceHost === host
        ) {
          setTimeout(() => {
            browser.tabs.sendMessage(
              details.tabId,
              { action: "autoTranslateBecauseClickedALink" },
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
        browser.webNavigation.onCreatedNavigationTarget.removeListener(webNavigationOnCreatedNavigationTarget);
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
      browser.webNavigation.onCreatedNavigationTarget.addListener(webNavigationOnCreatedNavigationTarget);
      browser.webNavigation.onBeforeNavigate.addListener(webNavigationOnBeforeNavigate);
      browser.webNavigation.onCommitted.addListener(webNavigationOnCommitted);
      browser.webNavigation.onDOMContentLoaded.addListener(webNavigationOnDOMContentLoaded);
    };

    this.config.onChanged((name, newValue) => {
      if (name !== "autoTranslateWhenClickingALink") return;
      if (newValue === "yes") enable();
      else disable();
    });

    if (browser.permissions.onRemoved) {
      browser.permissions.onRemoved.addListener((permissions) => {
        if (permissions.permissions?.indexOf("webNavigation") !== -1) {
          this.config.set("autoTranslateWhenClickingALink", "no");
        }
      });
    }

    browser.permissions.contains({ permissions: ["webNavigation"] }, (hasPermissions) => {
      if (hasPermissions && this.config.get<string>("autoTranslateWhenClickingALink") === "yes") {
        enable();
      } else {
        this.config.set("autoTranslateWhenClickingALink", "no");
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
