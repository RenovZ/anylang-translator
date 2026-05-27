<script lang="ts">
  import { Button, Dropdown, DropdownItem, Tooltip } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';
  import { twMerge } from 'tailwind-merge';

  import { fontFamilyOptions } from '@/preset/translate';

  interface Props {
    classes: { button?: string; tooltip?: string; dropdown?: string };
    value: string;
    onChange?: (value: string) => void;
    showTooltip?: boolean;
  }

  let { classes, value, onChange, showTooltip = false }: Props = $props();

  const currentFont =
    fontFamilyOptions.find((option) => option.value === value)?.label ?? fontFamilyOptions[0].label;
</script>

<Button
  class={twMerge(
    'w-full justify-between rounded-xl border-none bg-slate-100 px-3 py-2 text-slate-900 shadow hover:bg-slate-200/70 dark:bg-slate-700 dark:text-slate-100 hover:dark:bg-slate-600',
    classes.button
  )}>
  <span class="line-clamp-1 text-left break-all">
    {currentFont}
  </span>
  {#if showTooltip}
    <Tooltip class={twMerge('max-w-80 text-left text-xs', classes.tooltip)}>
      {currentFont}
    </Tooltip>
  {/if}
  <ChevronDownOutline class="ms-2 h-6 w-6 text-slate-400" />
</Button>
<Dropdown
  simple
  placement="bottom-end"
  class={twMerge(
    'max-h-80 overflow-y-auto bg-white/80 shadow-md backdrop-blur-xs dark:bg-slate-900/80',
    classes.dropdown
  )}>
  {#each fontFamilyOptions as option (option.value)}
    <DropdownItem onclick={() => onChange?.(option.value)}>
      {option.label}
    </DropdownItem>
  {/each}
</Dropdown>
