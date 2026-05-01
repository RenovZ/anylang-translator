<script module lang="ts">
  // 本地图标 — 打包用到的 SVG，数据来源 https://api.iconify.design
  // 注意：每个 <path> 自带 fill/stroke 属性，外层 <svg> 不强制设置

  export const icons = {
    // ========== Tabler ==========
    'tabler:arrow-right': {
      body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-6 6l6-6m-6-6l6 6"/>',
      width: 24,
      height: 24
    },
    'tabler:chevron-down': {
      body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9l6 6l6-6"/>',
      width: 24,
      height: 24
    },
    'tabler:grip-vertical': {
      body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a1 1 0 1 0 2 0a1 1 0 1 0-2 0m0 7a1 1 0 1 0 2 0a1 1 0 1 0-2 0m0 7a1 1 0 1 0 2 0a1 1 0 1 0-2 0m6-14a1 1 0 1 0 2 0a1 1 0 1 0-2 0m0 7a1 1 0 1 0 2 0a1 1 0 1 0-2 0m0 7a1 1 0 1 0 2 0a1 1 0 1 0-2 0"/>',
      width: 24,
      height: 24
    },
    'tabler:list-search': {
      body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 15a4 4 0 1 0 8 0a4 4 0 1 0-8 0m7.5 3.5L21 21M4 6h16M4 12h4m-4 6h4"/>',
      width: 24,
      height: 24
    },
    'tabler:scan-traces': {
      body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2m8-16h2a2 2 0 0 1 2 2v2m-4 12h2a2 2 0 0 0 2-2v-2m-9-4h6M8 8h5m-4 8h5"/>',
      width: 24,
      height: 24
    },
    'tabler:feather-filled': {
      body: '<g fill="currentColor"><path d="M8 9.585V16h6.414l-2.707 2.707a1 1 0 0 1-.112.097l-.11.071l-.114.054l-.105.035l-.149.03L11 19H6.414l-1.707 1.707a1 1 0 1 1-1.414-1.414L5 17.584V13l.003-.075l.017-.126l.03-.111l.044-.111l.052-.098l.067-.096l.08-.09z"/><path d="m19.414 11l-3 3H11.5l2.914-3zM13 4.586v4.998l-3 3V7.585zM16.482 3A4.515 4.515 0 0 1 21 7.514a4.7 4.7 0 0 1-.239 1.487L15 9V3.24c.469-.158.968-.24 1.482-.24"/></g>',
      width: 24,
      height: 24
    },
    'tabler:keyboard': {
      body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm4 2v.01m4-.01v.01m4-.01v.01m4-.01v.01M6 14v.01M18 14v.01M10 14l4 .01"/>',
      width: 24,
      height: 24
    },
    'tabler:subtitles': {
      body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 5a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zM7 15h5m3 0h2m0-3h-3m-3 0h-1"/>',
      width: 24,
      height: 24
    },
    'tabler:command': {
      body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>',
      width: 24,
      height: 24
    },

    // ========== Lucide ==========
    'lucide:book-open-text': {
      body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 7v14m4-9h2m-2-4h2M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4a4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3a3 3 0 0 0-3-3zm3-6h2M6 8h2"/>',
      width: 24,
      height: 24
    },

    // ========== Remix Icon ==========
    'ri:translate': {
      body: '<path fill="currentColor" d="M5 15v2a2 2 0 0 0 1.85 1.994L7 19h3v2H7a4 4 0 0 1-4-4v-2zm13-5l4.4 11h-2.155l-1.201-3h-4.09l-1.199 3h-2.154L16 10zm-1 2.885L15.753 16h2.492zM8 2v2h4v7H8v3H6v-3H2V4h4V2zm9 1a4 4 0 0 1 4 4v2h-2V7a2 2 0 0 0-2-2h-3V3zM6 6H4v3h2zm4 0H8v3h2z"/>',
      width: 24,
      height: 24
    },
    'ri:translate-ai': {
      body: '<path fill="currentColor" d="m19.713 8.128l-.246.566a.506.506 0 0 1-.934 0l-.246-.566a4.36 4.36 0 0 0-2.22-2.25l-.759-.339a.53.53 0 0 1 0-.963l.717-.319a4.37 4.37 0 0 0 2.251-2.326l.253-.611a.506.506 0 0 1 .942 0l.253.61a4.37 4.37 0 0 0 2.25 2.327l.718.32a.53.53 0 0 1 0 .962l-.76.338a4.36 4.36 0 0 0-2.219 2.251M5 17v-2H3v2a4 4 0 0 0 4 4h3v-2H7l-.15-.006A2 2 0 0 1 5 17m17.4 4L18 10h-2l-4.399 11h2.154l1.199-3h4.09l1.201 3zm-6.647-5L17 12.885L18.245 16zM8 4V2H6v2H2v7h4v3h2v-3h4V4zM4 6h2v3H4zm4 0h2v3H8z"/>',
      width: 24,
      height: 24
    },

    // ========== 占位 ==========
    placeholder: {
      body: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" opacity="0.3"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M12 8v4m0 4h.01" opacity="0.5"/>',
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
    {...rest}>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html iconData.body}
  </svg>
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
