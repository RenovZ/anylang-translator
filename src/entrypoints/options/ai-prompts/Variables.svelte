<script lang="ts">
  import { Button, Tooltip } from 'flowbite-svelte';

  import { promptVariables } from '@/lib/preset';

  interface Props {
    handleInsert?: (variable: string) => void;
    textareaRef?: HTMLTextAreaElement;
  }

  const defaultInsert = (variable: string) => {
    if (!textareaRef) return;

    // Focus first
    textareaRef.focus();

    // Use execCommand to insert text - this preserves browser's undo history (Ctrl+Z / Cmd+Z)
    // Note: execCommand is deprecated but still works in all browsers for this use case
    // The modern alternative (Input Events Level 2) does not yet support undo history
    if (document.execCommand('insertText', false, variable)) {
      // Trigger Svelte's bind:value update
      textareaRef.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // Fallback for browsers where execCommand fails
      const start = textareaRef.selectionStart;
      const end = textareaRef.selectionEnd;
      const text = textareaRef.value;
      const before = text.substring(0, start);
      const after = text.substring(end);

      textareaRef.value = before + variable + after;
      textareaRef.selectionStart = textareaRef.selectionEnd = start + variable.length;
      textareaRef.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  let { handleInsert = defaultInsert, textareaRef = $bindable(undefined) }: Props = $props();

  const insertCallback = (variableValue: string) => {
    handleInsert(variableValue);
  };
</script>

<div class="flex flex-wrap gap-2">
  {#each promptVariables as variable (variable.value)}
    <Button
      color="alternative"
      class="rounded-md border-none px-2 py-1 text-xs shadow"
      onclick={() => insertCallback(variable.value)}>
      {variable.value}
    </Button>
    {#if variable.label}
      <Tooltip class="max-w-80 text-sm">{variable.label}</Tooltip>
    {/if}
  {/each}
</div>
