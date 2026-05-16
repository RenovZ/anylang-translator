<script lang="ts">
  import { basicSetup } from 'codemirror';
  import { onMount } from 'svelte';
  import { twMerge } from 'tailwind-merge';
  import type { LanguageSupport } from '@codemirror/language';
  import { EditorState } from '@codemirror/state';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { placeholder as cmPlaceholder, EditorView } from '@codemirror/view';

  interface Props {
    value?: string;
    lang?: LanguageSupport;
    placeholder?: string;
    class?: string;
    onChange?: (value: string) => void;
  }

  let { value = $bindable(''), lang, placeholder, class: className, onChange }: Props = $props();

  let container: HTMLDivElement | undefined;
  let view: EditorView | undefined;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  function isDarkMode(): boolean {
    return (
      document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  }

  onMount(() => {
    if (!container) return;

    const extensions = [
      basicSetup,
      EditorView.theme({
        '&': {
          fontSize: '14px',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          minHeight: '160px'
        },
        '.cm-content': {
          padding: '12px'
        },
        '&.cm-focused': {
          outline: '2px solid #3b82f6',
          outlineOffset: '-2px'
        }
      }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            const newValue = update.state.doc.toString();
            value = newValue;
            onChange?.(newValue);
          }, 300);
        }
      })
    ];

    if (placeholder) {
      extensions.push(cmPlaceholder(placeholder));
    }

    if (lang) {
      extensions.push(lang);
    }

    if (isDarkMode()) {
      extensions.push(oneDark);
    }

    const state = EditorState.create({
      doc: value,
      extensions
    });

    view = new EditorView({
      state,
      parent: container
    });

    return () => {
      clearTimeout(debounceTimer);
      view?.destroy();
      view = undefined;
    };
  });

  // Sync external value changes
  $effect(() => {
    if (view && value !== view.state.doc.toString()) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value }
      });
    }
  });
</script>

<div bind:this={container} class={twMerge('min-h-80 w-full', className)}></div>
