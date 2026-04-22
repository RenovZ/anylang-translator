<script lang="ts">
  export let id: string = '';
  export let title: string;
  export let description: string = '';
</script>

<section {id} class="scroll-mt-28 rounded-2xl bg-white/80 p-8 shadow-md dark:bg-slate-900/80">
  <div class="flex items-start justify-between gap-6">
    <div>
      <h2 class="text-lg font-semibold">{title}</h2>
      {#if description}
        <p class="mt-1 text-sm text-slate-400">{description}</p>
      {/if}
    </div>
    <slot name="header-actions" />
  </div>

  <div class="mt-10 space-y-10">
    <slot />
  </div>
</section>
