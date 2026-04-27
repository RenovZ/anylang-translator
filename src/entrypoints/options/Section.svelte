<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  interface Props {
    id: string;
    title: string;
    description?: string;
    class?: string;
    children: import('svelte').Snippet;
    headerActions?: import('svelte').Snippet;
  }

  const {
    id,
    title,
    description,
    class: className = '',
    children,
    headerActions
  }: Props = $props();

  const classList = $derived(
    twMerge('rounded-2xl bg-white/80 p-8 shadow-md dark:bg-slate-900/80 flex flex-col', className)
  );
</script>

<section {id} class={classList}>
  <div class="flex items-start justify-between gap-6">
    <div>
      <h2 class="text-lg font-semibold">{title}</h2>
      {#if description}
        <p class="mt-1 text-sm text-slate-400">{description}</p>
      {/if}
    </div>
    {@render headerActions?.()}
  </div>

  <div class="mt-10 space-y-10">
    {@render children?.()}
  </div>
</section>
