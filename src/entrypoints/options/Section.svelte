<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  interface Props {
    title?: string | import('svelte').Snippet;
    subtitle?: string | import('svelte').Snippet;
    description?: string | import('svelte').Snippet;
    class?: string;
    children: import('svelte').Snippet;
    headerActions?: import('svelte').Snippet;
  }

  const {
    title,
    subtitle,
    description,
    class: className = '',
    children,
    headerActions
  }: Props = $props();

  const classList = $derived(
    twMerge(
      'rounded-2xl bg-white/80 p-8 shadow-md dark:bg-slate-900/80 flex flex-col h-full min-h-0 max-w-7xl w-full mx-auto',
      className
    )
  );
</script>

<section class={classList}>
  <div class="flex shrink-0 flex-col items-start gap-2">
    {#if title || subtitle || description}
      {#if title}
        {#if typeof title === 'string'}
          <h2 class="text-lg font-semibold">{title}</h2>
        {:else}
          {@render title()}
        {/if}
      {/if}
      <div>
        {#if subtitle}
          {#if typeof subtitle === 'string'}
            <h3 class="text-sm font-semibold text-slate-400">{subtitle}</h3>
          {:else}
            {@render subtitle()}
          {/if}
        {/if}
        {#if description}
          {#if typeof description === 'string'}
            <p class="text-sm text-slate-400">{description}</p>
          {:else}
            {@render description()}
          {/if}
        {/if}
      </div>
    {/if}
    {@render headerActions?.()}
  </div>

  <div class="min-h-0 flex-1 space-y-10 overflow-y-auto py-10 pr-1">
    {@render children?.()}
  </div>
</section>
