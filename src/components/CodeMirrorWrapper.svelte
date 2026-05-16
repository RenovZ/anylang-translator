<script lang="ts">
  import CodeMirror from 'svelte-codemirror-editor';
  import { twMerge } from 'tailwind-merge';
  import type { LanguageSupport } from '@codemirror/language';

  interface Props {
    value?: string;
    lang?: LanguageSupport;
    class?: string;
    placeholder?: string;
    onchange?: (value: string) => void;
  }

  let { value = $bindable(''), lang, class: className, placeholder, onchange }: Props = $props();

  /*
  "@codemirror/state": "^6.6.0",
  "@codemirror/theme-one-dark": "^6.1.3",
  "@codemirror/view": "^6.43.0",
  */
</script>

<CodeMirror
  bind:value
  {lang}
  class={twMerge('min-h-64 w-full overflow-hidden text-sm placeholder:text-gray-400', className)}
  {placeholder}
  {onchange} />
