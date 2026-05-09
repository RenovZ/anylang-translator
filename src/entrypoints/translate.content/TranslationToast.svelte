<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';

  import { CLASS_NOTRANSLATE } from '@/preset/constants';

  let visible = $state(true);
  let message = $state('Translation active');

  onMount(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TRANSLATION_STATUS') {
        message = event.data.message;
        visible = true;
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  });
</script>

{#if visible}
  <div
    class={`anylang-translate-toast ${CLASS_NOTRANSLATE}`}
    transition:fly={{ y: 20, duration: 300 }}>
    {message}
  </div>
{/if}

<style lang="postcss">
  .anylang-translate-toast {
    bottom: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;

    @apply fixed z-2147483647;
  }
</style>
