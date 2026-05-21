<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  import Popper from '@/components/flowbite-svelte/Popper.svelte';

  import { isPopoverOpen, isPopoverPinned } from './state';

  interface Props {
    class?: string;
    isOpen?: boolean;
    offset?: number;
    onbeforetoggle?: (ev: ToggleEvent) => void;
    children?: Snippet;
  }

  let {
    isOpen = $bindable(false),
    offset,
    onbeforetoggle,
    class: className,
    children
  }: Props = $props();
</script>

<Popper
  closeOnClickOutsideCallback={() => {
    if ($isPopoverOpen && $isPopoverPinned) return false;
    return true;
  }}
  arrow={false}
  bind:isOpen
  {offset}
  {onbeforetoggle}
  trigger="click"
  placement="bottom"
  class={twMerge(
    'z-2147483647 max-h-120 w-140 rounded-xl border-none bg-white/80 p-0 shadow-xl dark:bg-slate-900/80',
    className
  )}>
  {@render children?.()}
</Popper>
