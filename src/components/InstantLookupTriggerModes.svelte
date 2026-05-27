<script module lang="ts">
  export const triggerModeOptions = [
    {
      value: 'show icons',
      label: i18n('trigger_on_selection_show_icons', { defaultValue: 'Show icons' })
    },
    {
      value: 'directly',
      label: i18n('trigger_on_selection_directly', { defaultValue: 'Directly' })
    },
    {
      value: 'noop',
      label: i18n('trigger_on_selection_noop', { defaultValue: 'Noop' })
    }
  ];
</script>

<script lang="ts">
  import { Button, Dropdown, DropdownItem, Tooltip } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';
  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import { triggerModeOnSelectionSchema } from '@/types/config';

  interface Props {
    class?: string;
    children?: Snippet;
    showTooltip?: boolean;
    placement?: 'bottom-end' | 'top-end';
  }

  const {
    class: className,
    children,
    showTooltip = false,
    placement = 'bottom-end'
  }: Props = $props();
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
      {triggerModeOptions.find((item) => item.value === $config.instantLookup.selection.triggerMode)
        ?.label ??
        i18n('unsupported_translate_mode', { defaultValue: 'Unsupported Translate Mode' })}
    </span>
    {#if showTooltip}
      <Tooltip class="max-w-80 text-xs">
        {i18n('trigger_on_select', { defaultValue: 'Trigger on select' })}
      </Tooltip>
    {/if}
    <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
  </Button>
{/if}
<Dropdown
  simple
  {placement}
  class="max-h-80 overflow-y-auto bg-white/80 shadow-md backdrop-blur-xs dark:bg-slate-900/80">
  {#each triggerModeOptions as option (option.value)}
    <DropdownItem
      onclick={() =>
        ($config.instantLookup.selection.triggerMode = triggerModeOnSelectionSchema.parse(
          option.value
        ))}>
      {option.label}
    </DropdownItem>
  {/each}
</Dropdown>
