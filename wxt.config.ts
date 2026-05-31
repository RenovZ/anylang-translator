import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import Icons from 'unplugin-icons/vite';
import { loadEnv, type Plugin } from 'vite';
import { defineConfig, type UserConfig } from 'wxt';
import svg from '@poppanator/sveltekit-svg';

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
  zip: {
    exclude: ['**/*.map']
  },
  webExt: {
    firefoxArgs: ['--width=1600', '--height=1000'],
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
    startUrls: (env.START_URLS ?? '').split(',').filter(Boolean)
  },
  hooks: {
    'build:before': () => {
      runI18nExtraction();
    }
  },
  manifestVersion: 3,
  manifest: () => ({
    name: 'Anylang Translator',
    description:
      'A smart browser translation extension. Translate entire web pages or look up words instantly. Powered by 20+ AI models.',
    default_locale: 'en',
    permissions: ['storage', 'scripting', 'activeTab', 'tabs', 'webNavigation'],
    web_accessible_resources: [
      {
        resources: ['fonts/*.woff2'],
        matches: ['<all_urls>']
      }
    ],
    browser_specific_settings: {
      gecko: {
        id: 'anylang-translator@anylang.io',
        data_collection_permissions: {
          required: ['websiteContent', 'websiteActivity']
        }
      }
    },
    host_permissions: [
      '*://*/*' // Required for scripting.executeScript in any frame
    ],
    commands: {
      'adaptive-translate': {
        suggested_key: {
          default: 'Alt+A'
        },
        description: 'Adaptive Translate'
      }
      // 'instant-lookup': {
      //   description: 'Instant Lookup'
      // }
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
      }),
      svg()
    ],
    test: { include: ['src/**/*.{test,spec}.{js,ts}'] }
  })
} as UserConfig);
