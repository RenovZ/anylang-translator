import config from '@/lib/config';

import type { PageTranslationManager } from './page-translation';

/**
 * Binds page translation shortcut key from the given config.
 * Uses sync cached config inside the hotkey callback to avoid async overhead.
 */
export async function bindTranslationShortcutKey(
  pageTranslationManager: PageTranslationManager
): Promise<() => void> {
  const cfg = config.get();
  if (!cfg) {
    return () => {};
  }

  const shortcut = cfg.quickTranslate.shortcut;
  if (!shortcut || shortcut.length === 0) {
    return () => {};
  }

  const keyCombo = shortcut.join('+');

  const handleKeyDown = (event: KeyboardEvent) => {
    const keys: string[] = [];
    if (event.altKey) keys.push('Alt');
    if (event.ctrlKey) keys.push('Control');
    if (event.shiftKey) keys.push('Shift');
    if (event.metaKey) keys.push('Meta');
    keys.push(event.key);

    const pressedCombo = keys.join('+');
    if (pressedCombo === keyCombo) {
      event.preventDefault();
      event.stopPropagation();

      if (pageTranslationManager.isActive) {
        pageTranslationManager.stop();
      } else {
        void pageTranslationManager.start();
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown, { capture: true });

  return () => {
    document.removeEventListener('keydown', handleKeyDown, { capture: true });
  };
}
