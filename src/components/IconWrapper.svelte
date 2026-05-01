<script lang="ts">
  import { twMerge } from 'tailwind-merge';
  import Icon from '@iconify/svelte';

  import LocalIcon, { icons, type IconName } from './LocalIcon.svelte';

  interface Props {
    icon: string;
    class?: string;
    [key: string]: unknown;
  }

  const { icon, class: className = '', ...rest }: Props = $props();

  // Check if icon exists in local icons
  const isLocalIcon = $derived(icon in icons);
</script>

{#if isLocalIcon}
  <LocalIcon icon={icon as IconName} class={twMerge('h-auto shrink-0', className)} {...rest} />
{:else}
  <Icon {icon} class={twMerge('h-auto shrink-0', className)} {...rest} />
{/if}
