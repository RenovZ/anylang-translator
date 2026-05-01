import ContentScriptManager from './content-script-manager';

export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    ContentScriptManager.main();
  }
});
