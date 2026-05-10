import configStore from '@/lib/config';

import type { PageTranslationManager } from './page-translation';

function isEditable(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase();
  const editableElements = ['input', 'textarea', 'select'];
  if (editableElements.includes(tagName)) {
    return true;
  }
  if (element.isContentEditable) {
    return true;
  }
  return false;
}

/**
 * Binds page translation shortcut key from the given config.
 * Uses sync cached config inside the hotkey callback to avoid async overhead.
 */
export function bindTranslationShortcutKey(
  pageTranslationManager: PageTranslationManager
): () => void {
  const cfg = configStore.get();
  if (!cfg) {
    return () => {};
  }

  const shortcut = cfg.quickTranslate.shortcut;
  if (!shortcut || shortcut.length === 0) {
    return () => {};
  }

  const keyCombo = shortcut.join('+');

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.target instanceof HTMLElement && isEditable(event.target)) return;

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
