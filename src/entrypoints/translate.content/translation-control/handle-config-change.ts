import type { Config } from '@/types/config';

import type { PageTranslationManager } from './page-translation';

/**
 * Handles config changes and re-translates page when translation mode changes
 * while page translation is active.
 */
export function handleTranslationModeChange(
  newConfig: Config | null,
  oldConfig: Config | null,
  manager: PageTranslationManager
): void {
  const modeChanged =
    newConfig &&
    oldConfig &&
    newConfig.adaptiveTranslate.translate.mode !== oldConfig.adaptiveTranslate.translate.mode;

  if (modeChanged && manager.isActive) {
    manager.stop();
    void manager.start();
  }
}
