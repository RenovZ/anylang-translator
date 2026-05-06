<script module lang="ts">
  import IconBookOpenText from '~icons/lucide/book-open-text';
  import IconTranslate from '~icons/ri/translate';
  import IconTranslateAi from '~icons/ri/translate-ai';
  import IconArrowRight from '~icons/tabler/arrow-right';
  import IconChevronDown from '~icons/tabler/chevron-down';
  import IconCommand from '~icons/tabler/command';
  import IconFeatherFilled from '~icons/tabler/feather-filled';
  import IconGripVertical from '~icons/tabler/grip-vertical';
  import IconKeyboard from '~icons/tabler/keyboard';
  import IconListSearch from '~icons/tabler/list-search';
  import IconScanTraces from '~icons/tabler/scan-traces';
  import IconSubtitles from '~icons/tabler/subtitles';

  import type { Component } from 'svelte';

  export const icons: Record<string, Component> = {
    'tabler:arrow-right': IconArrowRight,
    'tabler:chevron-down': IconChevronDown,
    'tabler:grip-vertical': IconGripVertical,
    'tabler:list-search': IconListSearch,
    'tabler:scan-traces': IconScanTraces,
    'tabler:feather-filled': IconFeatherFilled,
    'tabler:keyboard': IconKeyboard,
    'tabler:subtitles': IconSubtitles,
    'tabler:command': IconCommand,

    'lucide:book-open-text': IconBookOpenText,

    'ri:translate': IconTranslate,
    'ri:translate-ai': IconTranslateAi
  };
</script>

<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  interface Props {
    icon: keyof typeof icons;
    class?: string;
    [key: string]: unknown;
  }

  const { icon, class: className = '', ...rest }: Props = $props();

  const IconComponent = $derived(icons[icon]);
</script>

{#if IconComponent}
  <IconComponent class={twMerge('h-5 w-5 shrink-0', className)} {...rest} />
{:else}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class={twMerge('h-5 w-5 shrink-0', className)}
    {...rest}>
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      opacity="0.3" />
  </svg>
{/if}
