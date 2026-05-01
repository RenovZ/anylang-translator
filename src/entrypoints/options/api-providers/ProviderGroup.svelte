<script lang="ts">
  import { A } from 'flowbite-svelte';

  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import type { AiProviderType } from '@/lib/types';
  import AccordionItem from '@/components/AccordionItem.svelte';
  import ProviderIcon from '@/components/ProviderIcon.svelte';

  interface Props {
    title: string;
    currentType?: 'free' | AiProviderType;
    selectedIndex: number;
    open?: boolean;
  }

  let {
    title,
    selectedIndex = $bindable(0),
    currentType,
    open = $bindable(false)
  }: Props = $props();
</script>

<AccordionItem {open} contentClass="space-y-1">
  {#snippet title()}
    <span>{title}</span>
  {/snippet}

  {#each $config.customProviders as provider, index (provider)}
    {#if provider.type === currentType}
      <button
        data-index={index}
        type="button"
        class="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-left transition"
        class:bg-slate-100={selectedIndex === index}
        class:dark:bg-slate-600={selectedIndex === index}
        class:hover:bg-slate-50={selectedIndex !== index}
        class:dark:hover:bg-slate-700={selectedIndex !== index}
        onclick={() => (selectedIndex = index)}>
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
    {/if}
  {/each}
</AccordionItem>
