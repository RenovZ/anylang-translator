<script lang="ts">
  import { A } from 'flowbite-svelte';

  import { type Provider } from '@/lib/types';
  import AccordionItem from '@/components/AccordionItem.svelte';
  import ProviderIcon from '@/components/ProviderIcon.svelte';
  import i18n from '@/lib/i18n';

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
      {#if provider.type === 'free'}
        <span class="line-clamp-1 text-sm font-medium">{provider.name}</span>
      {:else if provider.type === 'go'}
        <div class="flex w-full items-center justify-between text-sm font-medium">
          <span class="line-clamp-1 flex">{provider.model}</span>
          <!--
          TODO: 判断用户是否需要升级, 否则就去掉upgrade升级提示
          -->
          <A>{i18n('upgrade', { defaultValue: 'Upgrade' })}</A>
        </div>
      {:else if provider.type === 'zen'}
        <div class="flex w-full items-center justify-between text-sm font-medium">
          <span class="line-clamp-1 flex">{provider.model}</span>
          <!--
          TODO: 判断用户是否需要升级, 否则就去掉upgrade升级提示
          -->
          <A>{i18n('upgrade', { defaultValue: 'Upgrade' })}</A>
        </div>
      {:else if provider.type === 'custom'}
        <div class="line-clamp-1 text-sm font-medium">
          <span>{provider.name}</span>
          {#if provider.model}
            <span>({provider.model})</span>
          {/if}
        </div>
      {:else}
        <span class="line-clamp-1 text-sm font-medium">
          {i18n('unsupported_provider', { defaultValue: 'Unsupported Provider' })}
        </span>
      {/if}
    </button>
  {/each}
</AccordionItem>
