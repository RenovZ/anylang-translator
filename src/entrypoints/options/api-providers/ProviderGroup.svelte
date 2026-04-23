<script lang="ts">
  import { type Provider } from '@/lib/config';
  import AccordionItem from '@/components/AccordionItem.svelte';
  import ProviderIcon from '@/components/ProviderIcon.svelte';

  interface Props {
    title: string;
    providers: Provider[];
    open?: boolean;
    selectedProvider: Provider | null;
    // selectedProviderIndex: number;
  }

  let {
    title,
    providers = $bindable([]),
    open = $bindable(false),
    selectedProvider = $bindable(null)
    // selectedProviderIndex = $bindable(-1),
  }: Props = $props();

  const isSelected = (provider: Provider) =>
    selectedProvider &&
    selectedProvider.name === provider.name &&
    selectedProvider.type === provider.type;
</script>

<AccordionItem {open}>
  {#snippet title()}
    <span>{title}</span>
  {/snippet}

  {#each providers as provider (provider)}
    <button
      type="button"
      class="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-left transition"
      class:bg-slate-100={isSelected(provider)}
      class:dark:bg-slate-700={isSelected(provider)}
      class:hover:bg-slate-50={!isSelected(provider)}
      class:dark:hover:bg-slate-800={!isSelected(provider)}
      onclick={() => (selectedProvider = provider)}>
      <ProviderIcon {provider} />
      <span class="line-clamp-1 text-sm font-medium">
        <span>{provider.name}</span>
        {#if provider.type !== 'free' && provider.model}
          <span>({provider.model})</span>
        {/if}
      </span>
    </button>
  {/each}
</AccordionItem>
