import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'wxt';

import { loggerCallerPlugin } from './plugins/logger-caller';

const configFile = fileURLToPath(import.meta.url);
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

function i18nExtractionPlugin() {
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
    configureServer(server: {
      watcher: { on: (event: 'add' | 'change' | 'unlink', cb: (file: string) => void) => void };
    }) {
      for (const event of ['add', 'change', 'unlink'] as const) {
        server.watcher.on(event, scheduleExtraction);
      }
    }
  };
}

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  hooks: {
    'build:before': () => {
      runI18nExtraction();
    }
  },
  manifest: {
    default_locale: 'en',
    permissions: ['storage', 'scripting', 'activeTab'],
    commands: {
      'quick-translate': {
        suggested_key: {
          default: 'Alt+Q'
        },
        description: 'Quick Translate'
      },
      'context-translate': {
        suggested_key: {
          default: 'Alt+C'
        },
        description: 'Context Translate'
      },
      'instant-lookup': {
        suggested_key: {
          default: 'Alt+L'
        },
        description: 'Instant Lookup'
      },
      'intelligent-input': {
        suggested_key: {
          default: 'Alt+I'
        },
        description: 'Intelligent Input'
      },
      'bilingual-subtitles': {
        description: 'Bilingual Subtitles'
      },
      'panorama-reading': {
        description: 'Panorama Reading'
      },
      'writing-copilot': {
        description: 'Writing Copilot'
      }
    }
  },
  vite: () => ({
    plugins: [i18nExtractionPlugin(), loggerCallerPlugin(), Icons({ compiler: 'svelte' })],
    server: {
      host: '0.0.0.0'
    },
    test: { include: ['src/**/*.{test,spec}.{js,ts}'] }
  })
});
