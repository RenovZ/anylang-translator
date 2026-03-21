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
      host: '0.0.0.0',
      proxy: {
        // '/api/v3': {
        //   target: 'http://localhost:9080',
        //   changeOrigin: true
        // },
        '/locales': {
          target: 'http://localhost:4170',
          changeOrigin: true
        }
      }
    },
    test: { include: ['src/**/*.{test,spec}.{js,ts}'] }
  })
});
