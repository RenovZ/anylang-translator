<script module lang="ts">
  export interface IsolatedToastProp {
    show: boolean;
    type: 'success' | 'error' | 'warn' | 'info';
    message?: string;
    title?: string;
    onclose?: () => void;
  }
</script>

<script lang="ts">
  import { NOTRANSLATE_CLASS } from '@/preset/dom';

  let { show = $bindable(false), type, title, message, onclose }: IsolatedToastProp = $props();

  function close() {
    show = false;
    onclose?.();
  }
</script>

{#if show}
  <div
    class={`anylang-toast ${NOTRANSLATE_CLASS}`}
    class:anylang-toast--success={type === 'success'}
    class:anylang-toast--error={type === 'error'}
    class:anylang-toast--warn={type === 'warn'}
    class:anylang-toast--info={type === 'info'}
    role="alert">
    <div class="anylang-toast__icon">
      {#if type === 'success'}
        <!-- Check circle -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25z"
            clip-rule="evenodd" />
        </svg>
      {:else if type === 'error'}
        <!-- Exclamation circle -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z"
            clip-rule="evenodd" />
        </svg>
      {:else if type === 'warn'}
        <!-- Warning triangle -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z"
            clip-rule="evenodd" />
        </svg>
      {:else}
        <!-- Info circle -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022zM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z"
            clip-rule="evenodd" />
        </svg>
      {/if}
    </div>
    <div class="anylang-toast__body" class:anylang-toast__body--centered={!title}>
      {#if title}
        <span class="anylang-toast__title">{title}</span>
      {/if}
      {#if message}
        <p class="anylang-toast__message">{message}</p>
      {/if}
    </div>
    <button class="anylang-toast__close" type="button" onclick={close} aria-label="Close">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
{/if}

<style>
  /*:global([data-anylang-toast-host]) {
    position: relative;
    width: 100vw;
    height: 100vh;
    background-color: green;
  }*/
  .anylang-toast,
  .anylang-toast *,
  .anylang-toast *::before,
  .anylang-toast *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    border: 0;
    font: inherit;
    color: inherit;
    vertical-align: baseline;
    text-decoration: none;
    line-height: normal;
  }

  .anylang-toast {
    all: initial;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    position: fixed;
    top: 100px;
    left: 20px;
    z-index: 2147483647;
    padding: 16px;
    border-radius: 8px;
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #1f2937;
    background-color: #fff;
    border: 1px solid #e5e7eb;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -2px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    min-width: 240px;
    box-sizing: border-box;
  }

  /* --- Icon --- */
  .anylang-toast__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    margin-top: 2px;
  }

  .anylang-toast__icon svg {
    display: block;
    width: 20px;
    height: 20px;
  }

  .anylang-toast--success .anylang-toast__icon {
    color: #16a34a;
  }

  .anylang-toast--error .anylang-toast__icon {
    color: #dc2626;
  }

  .anylang-toast--warn .anylang-toast__icon {
    color: #d97706;
  }

  .anylang-toast--info .anylang-toast__icon {
    color: #2563eb;
  }

  /* --- Body --- */
  .anylang-toast__body {
    display: flex;
    flex-direction: column;
    flex: 1 1 0%;
    min-width: 0;
  }

  .anylang-toast__body--centered {
    justify-content: center;
  }

  .anylang-toast__title {
    display: block;
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 600;
    color: #111827;
  }

  .anylang-toast__message {
    display: block;
    font-size: 14px;
    color: #4b5563;
    word-break: break-word;
  }

  /* --- Close button --- */
  .anylang-toast__close {
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    color: #9ca3af;
    cursor: pointer;
    border-radius: 4px;
  }

  .anylang-toast__close:hover {
    color: #4b5563;
    background-color: #f3f4f6;
  }

  .anylang-toast__close svg {
    display: block;
    width: 16px;
    height: 16px;
  }

  /* --- Type accent --- */
  .anylang-toast--success {
    border-left: 4px solid #16a34a;
  }

  .anylang-toast--error {
    border-left: 4px solid #dc2626;
  }

  .anylang-toast--warn {
    border-left: 4px solid #d97706;
  }

  .anylang-toast--info {
    border-left: 4px solid #2563eb;
  }
</style>
