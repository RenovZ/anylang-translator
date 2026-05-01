<script module lang="ts">
  // 本地图标定义 - 只打包用到的 SVG
  // 从 https://icones.js.org 或 https://iconify.design 复制 path 数据

  export const icons = {
    // Tabler icons
    'tabler:arrow-right': {
      body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7-7l7 7-7 7"/>',
      width: 24,
      height: 24
    },
    'tabler:chevron-down': {
      body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9l6 6l6-6"/>',
      width: 24,
      height: 24
    },

    'tabler:grip-vertical': {
      body: '<circle cx="9" cy="5" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="19" r="1" fill="currentColor"/><circle cx="15" cy="5" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="19" r="1" fill="currentColor"/>',
      width: 24,
      height: 24
    },
    'tabler:list-search': {
      body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.5 18.5l2.5 2.5"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12h4"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 18h4"/>',
      width: 24,
      height: 24
    },
    'tabler:scan-traces': {
      body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7V5a2 2 0 0 1 2-2h2"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 3h2a2 2 0 0 1 2 2v2"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 17v2a2 2 0 0 1-2 2h-2"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 17v2a2 2 0 0 0 2 2h2"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 7v10"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17h6"/>',
      width: 24,
      height: 24
    },
    'tabler:feather-filled': {
      body: '<path fill="currentColor" d="M12 2C7.5 2 4 6.5 4 12s5 10 10 10s10-5 10-10S16.5 2 12 2m-1 15l-3-3l1.5-1.5L11 14l4.5-4.5L17 11z"/>',
      width: 24,
      height: 24
    },
    // Quick Translate (Remix Icon)
    'ri:translate': {
      body: '<path fill="currentColor" d="M5 15v2a2 2 0 0 0 2 2h4v-2H7v-2zm13-2h-4v2h4v2h2v-2a2 2 0 0 0-2-2m-6-4V3H7a2 2 0 0 0-2 2v4zm2 0h4a2 2 0 0 0 2-2V5h-2v4h-4z"/>',
      width: 24,
      height: 24
    },
    // Context Translate (Remix Icon)
    'ri:translate-ai': {
      body: '<path fill="currentColor" d="M5 15v2a2 2 0 0 0 2 2h4v-2H7v-2zm13-2h-4v2h4v2h2v-2a2 2 0 0 0-2-2m-6-4V3H7a2 2 0 0 0-2 2v4zm2 0h4a2 2 0 0 0 2-2V5h-2v4h-4zm-2 7l-2 3h12l-2-3z"/>',
      width: 24,
      height: 24
    },
    // Instant Lookup (Lucide)
    'lucide:book-open-text': {
      body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 7v14m-9-3a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4H3zm18 0a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v4h10z"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 10V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 10h4"/>',
      width: 24,
      height: 24
    },
    // Intelligent Input
    'tabler:keyboard': {
      body: '<rect width="20" height="16" x="2" y="4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" rx="2"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>',
      width: 24,
      height: 24
    },
    // Bilingual Subtitles
    'tabler:subtitles': {
      body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2m2 8v.01M10 13v.01M14 13v.01M18 13v.01"/>',
      width: 24,
      height: 24
    }
  } as const;

  export type IconName = keyof typeof icons;
</script>

<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  interface Props {
    icon: IconName;
    class?: string;
    [key: string]: unknown;
  }

  const { icon, class: className = '', ...rest }: Props = $props();

  const iconData = $derived(icons[icon]);
</script>

{#if iconData}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 {iconData.width} {iconData.height}"
    class={twMerge('h-5 w-5 shrink-0', className)}
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    {...rest}>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html iconData.body}
  </svg>
{:else}
  <!-- 图标不存在时显示占位 -->
  <span class={twMerge('h-5 w-5', className)} {...rest}>?</span>
{/if}
