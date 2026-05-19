<script lang="ts">
  import { Popover } from 'flowbite-svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    isOpen?: boolean;
    children?: Snippet;
    onbeforetoggle?: (ev: ToggleEvent) => void;
  }

  let { isOpen = $bindable(false), children, onbeforetoggle }: Props = $props();
</script>

<!--
  TODO: Popover content will be rendered by flowbite-svelte.
  The trigger element must be the previousElementSibling of this
  component in the DOM (enforced by flowbite-svelte/Popper internals).
-->
<Popover bind:isOpen {onbeforetoggle} trigger="click" placement="bottom" class="z-2147483647">
  {@render children?.()}
</Popover>
