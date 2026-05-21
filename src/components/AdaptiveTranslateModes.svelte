<script module lang="ts">
  export const translateModeOptions = [
    {
      value: 'bilingual',
      label: i18n('display_mode_bilingual_mode', { defaultValue: 'Bilingual Mode' })
    },
    {
      value: 'translation_only',
      label: i18n('display_mode_translation_only', { defaultValue: 'Translation only' })
    }
  ];
</script>

<script lang="ts">
  import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';
  import { twMerge } from 'tailwind-merge';

  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import { translateModeSchema } from '@/types/config';

  interface Props {
    class?: string;
    children?: import('svelte').Snippet;
  }

  const { class: className, children }: Props = $props();
</script>

{#if children}
  {@render children()}
{:else}
  <Button
    class={twMerge(
      'w-full justify-between rounded-xl border-none bg-slate-100 px-3 py-2 text-slate-900 shadow hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600',
      className
    )}>
    <span>
      {translateModeOptions.find((item) => item.value === $config.adaptiveTranslate.translate.mode)
        ?.label ??
        i18n('unsupported_translate_mode', { defaultValue: 'Unsupported Translate Mode' })}
    </span>
    <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
  </Button>
{/if}
<Dropdown simple placement="bottom-end" class="max-h-80 overflow-y-auto shadow-md">
  {#each translateModeOptions as option (option.value)}
    <DropdownItem
      onclick={() =>
        ($config.adaptiveTranslate.translate.mode = translateModeSchema.parse(option.value))}>
      {option.label}
    </DropdownItem>
  {/each}
</Dropdown>
