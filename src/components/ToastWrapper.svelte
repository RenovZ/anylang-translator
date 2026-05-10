<script module lang="ts">
  export interface ToastProp {
    show: boolean;
    type: 'success' | 'error' | 'info' | 'debug';
    message?: string | import('svelte').Snippet;
    title?: string | import('svelte').Snippet;
    titleClass?: string;
  }
</script>

<script lang="ts">
  import { Toast } from 'flowbite-svelte';
  import { CheckCircleSolid, ExclamationCircleSolid } from 'flowbite-svelte-icons';
  import { twMerge } from 'tailwind-merge';

  const TYPED_COLOR = {
    success: 'green',
    error: 'red',
    info: 'blue',
    debug: 'gray'
  } as const;

  let {
    show = $bindable(false),
    type,
    title,
    titleClass,
    message
  }: ToastProp & { children?: import('svelte').Snippet } = $props();
</script>

{#if show}
  <Toast
    align={!title}
    class="fixed top-25 left-5 z-9999"
    color={TYPED_COLOR[type]}
    onclose={() => (show = false)}>
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
