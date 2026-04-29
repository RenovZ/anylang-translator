<script lang="ts">
  import { Modal } from 'flowbite-svelte';
  import { twMerge } from 'tailwind-merge';

  interface Props {
    open?: boolean;
    children: import('svelte').Snippet;
    placement?: 'top-center' | 'center' | 'bottom-center';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    outsideclose?: boolean;
    class?: string;
  }

  let {
    open = $bindable(false),
    children,
    placement = 'top-center',
    size = 'lg',
    outsideclose = true,
    class: className
  }: Props = $props();
</script>

<Modal
  {placement}
  bind:open
  {size}
  {outsideclose}
  class={twMerge('mt-20 rounded-2xl backdrop:backdrop-blur-xs', className)}
  classes={{ body: 'border-none max-h-[calc(100vh-10rem)] max-w-full overflow-y-auto' }}>
  {@render children()}
</Modal>
