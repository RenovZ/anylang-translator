<script lang="ts">
  import type { ThemeMode } from '@/preset/shadow-host';

  import ThemeProvider from './ThemeProvider.svelte';

  interface Props {
    container: HTMLElement;
    themeMode?: ThemeMode;
    children?: import('svelte').Snippet;
  }

  let { container, themeMode = 'system', children }: Props = $props();
</script>

<ThemeProvider {container} {themeMode}>
  {@render children?.()}
</ThemeProvider>
