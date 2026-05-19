<script lang="ts">
  import { Popover } from 'flowbite-svelte';
  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  interface Props {
    class?: string;
    isOpen?: boolean;
    children?: Snippet;
    offset?: number;
    onbeforetoggle?: (ev: ToggleEvent) => void;
  }

  let {
    isOpen = $bindable(false),
    children,
    offset,
    onbeforetoggle,
    class: className
  }: Props = $props();
</script>

<!--
  TODO: Popover content will be rendered by flowbite-svelte.
  The trigger element must be the previousElementSibling of this
  component in the DOM (enforced by flowbite-svelte/Popper internals).
-->
<Popover
  arrow={false}
  bind:isOpen
  {offset}
  {onbeforetoggle}
  trigger="click"
  placement="bottom"
  class={twMerge('z-2147483647', className)}>
  {@render children?.()}
</Popover>
