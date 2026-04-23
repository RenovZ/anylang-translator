<script lang="ts">
  import { AccordionItem } from 'flowbite-svelte';
  import { ChevronRightOutline, ChevronDownOutline } from 'flowbite-svelte-icons';
  import { twMerge } from 'tailwind-merge';

  interface Props {
    children: import('svelte').Snippet;
    title: import('svelte').Snippet;
    open?: boolean;
    contentClass?: string;
    buttonClass?: string;
  }

  let { children, title, open = $bindable(false), contentClass, buttonClass }: Props = $props();
</script>

<AccordionItem
  {open}
  classes={{
    button: twMerge(
      'border-0 group-first:border-0 py-2 px-0 rounded-0 group-first:rounded-0 bg-transparent dark:bg-transparent hover:bg-transparent dark:hover:bg-transparent focus:ring-0 dark:focus:ring-0',
      buttonClass
    ),
    content: twMerge('border-none p-0 mb-4', contentClass)
  }}>
  {#snippet header()}
    {@render title()}
  {/snippet}
  {#snippet arrowup()}
    <ChevronDownOutline class="h-6 w-6" />
  {/snippet}
  {#snippet arrowdown()}
    <ChevronRightOutline class="h-6 w-6" />
  {/snippet}
  {@render children()}
</AccordionItem>
