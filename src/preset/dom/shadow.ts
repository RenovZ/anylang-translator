export type Theme = 'light' | 'dark';
export type ThemeMode = 'light' | 'dark' | 'system';

export const DEFAULT_THEME_MODE: ThemeMode = 'system';

/** CSS classes applied to the shadow host container to signal the active theme. */
export const THEME_LIGHT_CLASS = 'light';
export const THEME_DARK_CLASS = 'dark';

/** Svelte context key used by ShadowWrapper / ThemeProvider. */
export const SHADOW_WRAPPER_CONTEXT_KEY = Symbol('anylang-shadow-wrapper');

/**
 * Apply the resolved theme to an HTMLElement (adds a class + sets color-scheme).
 * Called both at mount time and whenever the media-query changes.
 */
export function applyTheme(target: HTMLElement, theme: Theme): void {
  target.classList.remove(THEME_LIGHT_CLASS, THEME_DARK_CLASS);
  target.classList.add(theme);
  target.style.colorScheme = theme;
}

/**
 * The shape stored in context under SHADOW_WRAPPER_CONTEXT_KEY.
 * The container getter is used so the reference stays reactive
 * even if the component re-renders.
 */
export interface ShadowWrapperContext {
  container: () => HTMLElement;
}

/**
 * Resolve the current theme from a ThemeMode.
 * When mode is 'system', falls back to the OS preference.
 */
export function resolveTheme(mode: ThemeMode): Theme {
  if (mode === 'system') {
    return typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
      ? 'dark'
      : 'light';
  }
  return mode;
}
