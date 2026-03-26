<script lang="ts">
  export let title: string;
  export let description: string = '';
</script>

<div class="flex flex-col gap-3">
  <div class="grid grid-cols-1 items-start gap-4 md:grid-cols-[1fr_220px] md:gap-8">
    <div>
      <div class="text-lg font-semibold">{title}</div>
      {#if description}
        <p class="mt-1 text-sm text-slate-400">{description}</p>
      {/if}
      <slot name="extra-desc" />
    </div>
    <div class="w-full space-y-3">
      <slot name="controls" />
    </div>
  </div>
  <slot />
</div>
