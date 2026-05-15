<script module lang="ts">
  export interface ToastWrapperProp {
    show: boolean;
    type: 'success' | 'error' | 'warn' | 'info' | 'debug';
    message?: string | import('svelte').Snippet;
    title?: string | import('svelte').Snippet;
    titleClass?: string;
    onclose?: () => void;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  }
</script>

<script lang="ts">
  import { Toast } from 'flowbite-svelte';
  import { CheckCircleSolid, ExclamationCircleSolid } from 'flowbite-svelte-icons';
  import { twMerge } from 'tailwind-merge';

  const TYPED_COLOR = {
    success: 'green',
    error: 'red',
    warn: 'yellow',
    info: 'blue',
    debug: 'gray'
  } as const;

  let {
    show = $bindable(false),
    type,
    title,
    titleClass,
    message,
    onclose,
    position = 'top-right'
  }: ToastWrapperProp & { children?: import('svelte').Snippet } = $props();

  function close() {
    show = false;
    onclose?.();
  }
</script>

{#if show}
  <Toast
    dismissable
    {position}
    align={!title}
    class="fixed z-2147483647"
    color={TYPED_COLOR[type]}
    onclose={close}>
    {#snippet icon()}
      {#if type === 'success'}
        <CheckCircleSolid class="h-5 w-5" />
      {:else}
        <ExclamationCircleSolid class="h-5 w-5" />
      {/if}
    {/snippet}
    {#if typeof title === 'string'}
      <span class={twMerge('mb-1 text-sm font-semibold text-gray-900 dark:text-white', titleClass)}>
        {title}
      </span>
    {:else}
      {@render title?.()}
    {/if}
    {#if typeof message === 'string'}
      <p>{message}</p>
    {:else if message}
      {@render message()}
    {/if}
  </Toast>
{/if}
