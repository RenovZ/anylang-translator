<script lang="ts">
  import { twMerge } from 'tailwind-merge';
  import Icon from '@iconify/svelte';

  import LocalIcon, { icons as localIcons } from './LocalIcon.svelte';

  interface Props {
    icon: string;
    class?: string;
    [key: string]: unknown;
  }

  const { icon, class: className = '', ...rest }: Props = $props();

  const isLocal = $derived(icon in localIcons);
</script>

{#if isLocal}
  <LocalIcon {icon} class={twMerge('h-auto shrink-0', className)} {...rest} />
{:else}
  <Icon {icon} class={twMerge('h-auto shrink-0', className)} {...rest} />
{/if}
