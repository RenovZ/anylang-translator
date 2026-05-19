<script lang="ts">
  import { setContext } from 'svelte';

  import {
    applyTheme,
    resolveTheme,
    SHADOW_WRAPPER_CONTEXT_KEY,
    type ThemeMode
  } from '@/preset/dom/shadow';

  interface Props {
    container: HTMLElement;
    themeMode?: ThemeMode;
    children?: import('svelte').Snippet;
  }

  let { container, themeMode = 'system', children }: Props = $props();

  // Expose the container via context so nested components can use it
  // (mirrors ShadowWrapperContext in the React version).
  setContext(SHADOW_WRAPPER_CONTEXT_KEY, { container: () => container });

  // Reactively compute the resolved theme and apply it to the container.
  $effect(() => {
    const theme = resolveTheme(themeMode);
    applyTheme(container, theme);

    // When mode is 'system', subscribe to OS-level changes in real time.
    if (themeMode !== 'system') return;

    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;

    const handler = () => applyTheme(container, mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  });
</script>

{@render children?.()}
