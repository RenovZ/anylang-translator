import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import Icons from 'unplugin-icons/vite';
import { loadEnv, type Plugin } from 'vite';
import { defineConfig, type UserConfig } from 'wxt';

import { loggerCallerPlugin } from './plugins/logger-caller';

const configFile = fileURLToPath(import.meta.url);
const env = loadEnv('dev', process.cwd(), '');
const workspaceRoot = path.dirname(configFile);
const sourceRoot = path.join(workspaceRoot, 'src');
const extractionScript = path.join(workspaceRoot, 'scripts', 'extract-i18n.mjs');
const sourceExtensions = new Set(['.js', '.svelte', '.ts']);

function runI18nExtraction() {
  execFileSync(process.execPath, [extractionScript], {
    cwd: workspaceRoot,
    stdio: 'inherit'
  });
}

function shouldExtract(filePath: string) {
  return filePath.startsWith(sourceRoot) && sourceExtensions.has(path.extname(filePath));
}

function i18nExtractionPlugin(): Plugin {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const scheduleExtraction = (filePath?: string) => {
    if (filePath && !shouldExtract(filePath)) {
      return;
    }

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = undefined;
      runI18nExtraction();
    }, 25);
  };

  return {
    name: 'anylang-i18n-extraction',
    configureServer(server) {
      for (const event of ['add', 'change', 'unlink'] as const) {
        server.watcher.on(event, scheduleExtraction);
      }
    }
  };
}

function createProfileDir(profileDir: string) {
  // const profileDir = process.cwd() + '/' + dir;
  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }
  return profileDir;
}

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  dev: {
    reloadCommand: false
  },
  suppressWarnings: {
    firefoxDataCollection: true
  },
  webExt: {
    firefoxArgs: ['--width=1600', '--height=1000'],
    firefoxPref: {
      // 核心：禁用欢迎页
      'browser.aboutwelcome.enabled': false,
      'browser.startup.homepage_override.mstone': 'ignore',
      'startup.homepage_welcome_url': '',
      'startup.homepage_override_url': '',
      'browser.shell.checkDefaultBrowser': false,
      // 控制启动行为
      'browser.startup.homepage': 'about:blank',
      'browser.startup.page': 0, // 0=空白页, 1=主页, 3=恢复上次会话
      // 禁用首次运行体验
      'browser.startup.firstrunSkipsHomepage': true,
      'browser.feeds.showFirstRunUI': false,
      'browser.uitour.enabled': false,
      // 禁用 ASRouter 推荐内容
      'browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons': false,
      'browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features': false,
      // 禁用新标签页的推荐内容
      'browser.newtabpage.activity-stream.feeds.section.topstories': false,
      'browser.newtabpage.activity-stream.showSearch': false
    },
    openDevtools: true,
    // openConsole: true,
    keepProfileChanges: true,
    chromiumProfile: createProfileDir('.data/chrome-data'),
    firefoxProfile: createProfileDir('.data/firefox-data'),
    chromiumArgs: [
      '--window-position=0,0',
      '--window-size=1700,1000',
      '--auto-open-devtools-for-tabs'
    ],
    startUrls: env.START_URLS.split(',')
  },
  hooks: {
    'build:before': () => {
      runI18nExtraction();
    }
  },
  manifest: () => ({
    default_locale: 'en',
    permissions: ['storage', 'scripting', 'activeTab', 'tabs', 'webNavigation'],
    host_permissions: [
      '*://*/*' // Required for scripting.executeScript in any frame
    ],
    commands: {
      'adaptive-translate': {
        suggested_key: {
          default: 'Alt+A'
        },
        description: 'Adaptive Translate'
      },
      // 'instant-lookup': {
      //   description: 'Instant Lookup'
      // },
      'intelligent-input': {
        suggested_key: {
          default: 'Alt+E'
        },
        description: 'Intelligent Input'
      },
      'bilingual-subtitles': {
        suggested_key: {
          default: 'Alt+S'
        },
        description: 'Bilingual Subtitles'
      },
      'panorama-reading': {
        description: 'Panorama Reading'
      },
      'writing-copilot': {
        suggested_key: {
          default: 'Alt+C'
        },
        description: 'Writing Copilot'
      }
    }
  }),
  experimental: {
    viteNode: false
  },
  vite: () => ({
    plugins: [
      i18nExtractionPlugin(),
      loggerCallerPlugin(),
      Icons({
        compiler: 'svelte',
        customCollections: {
          lobehub: FileSystemIconLoader('./node_modules/@lobehub/icons-static-svg/icons')
        }
      })
    ],
    test: { include: ['src/**/*.{test,spec}.{js,ts}'] }
  })
} as UserConfig);
