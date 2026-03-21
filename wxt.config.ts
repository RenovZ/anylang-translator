import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    default_locale: 'en'
  },
  vite: () => ({
    server: {
      host: '0.0.0.0'
    },
    test: { include: ['src/**/*.{test,spec}.{js,ts}'] }
  })
});
