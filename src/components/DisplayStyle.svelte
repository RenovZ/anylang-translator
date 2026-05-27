<script lang="ts">
  import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';
  import { twMerge } from 'tailwind-merge';

  // import '@/assets/custom-translation-node.css';
  // import '@/assets/translation-node-preset.css';

  import config from '@/lib/config';
  import {
    defaultCustomDisplayStyles,
    DISPLAY_STYLES,
    fontFamilyOptions
  } from '@/preset/translate';

  interface Props {
    classes?: { button?: string; dropdown?: string };
    button?: import('svelte').Snippet;
  }

  const { button, classes = {} }: Props = $props();
</script>

{#if button}
  {@render button()}
{:else}
  <Button
    class={twMerge(
      'w-full justify-between rounded-xl border-none bg-slate-100 px-3 py-2 text-slate-900 shadow hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600',
      classes.button
    )}>
    <span>
      {DISPLAY_STYLES.find(
        (item) => item.preset === $config.adaptiveTranslate.translate.displayStyle.preset
      )?.label ?? DISPLAY_STYLES[0].label}
    </span>
    <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
  </Button>
{/if}
<Dropdown
  simple
  placement="bottom-end"
  class={twMerge(
    'max-h-80 overflow-y-auto bg-white/80 shadow-md backdrop-blur-xs dark:bg-slate-900/80',
    classes.dropdown
  )}>
  {#each DISPLAY_STYLES as item (item)}
    <DropdownItem
      onclick={() => {
        const { preset } = item;
        if (preset === 'custom') {
          const { customStyles } = $config.adaptiveTranslate.translate.displayStyle;
          $config.adaptiveTranslate.translate.displayStyle = {
            preset,
            customStyles: {
              ...defaultCustomDisplayStyles,
              ...customStyles
            },
            customCss: undefined
          };
          return;
        }
        if (preset === 'css') {
          const { customCss } = $config.adaptiveTranslate.translate.displayStyle;
          $config.adaptiveTranslate.translate.displayStyle = {
            preset,
            customStyles: undefined,
            customCss
          };
          return;
        }

        $config.adaptiveTranslate.translate.displayStyle = { preset };
      }}>
      {item.label}
    </DropdownItem>
  {/each}
</Dropdown>
