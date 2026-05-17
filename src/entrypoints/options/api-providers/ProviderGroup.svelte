<script lang="ts">
  import { A, Toggle } from 'flowbite-svelte';

  import AccordionItem from '@/components/AccordionItem.svelte';
  import ProviderIcon from '@/components/ProviderIcon.svelte';
  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import { getProviderIcon } from '@/preset/provider';
  import { isPaidProvider, type AIProviderType } from '@/types/provider';

  interface Props {
    title: string;
    currentType?: 'free' | AIProviderType;
    selectedIndex: number;
    open?: boolean;
    callback?: () => void;
  }

  let {
    title,
    selectedIndex = $bindable(0),
    currentType,
    open = $bindable(false),
    callback
  }: Props = $props();
</script>

<AccordionItem {open} contentClass="space-y-1">
  {#snippet title()}
    <span>{title}</span>
  {/snippet}

  {#each $config.providers as provider, index (provider.name)}
    {#if provider.type === currentType}
      <button
        data-index={index}
        type="button"
        class="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-left transition"
        class:bg-slate-100={selectedIndex === index}
        class:dark:bg-slate-600={selectedIndex === index}
        class:hover:bg-slate-50={selectedIndex !== index}
        class:dark:hover:bg-slate-700={selectedIndex !== index}
        onclick={() => {
          selectedIndex = index;
          callback?.();
        }}>
        <ProviderIcon name={provider.name} icon={getProviderIcon(provider)} class="w-6" />
        {#if provider.type === 'free'}
          <span class="line-clamp-1 flex flex-1 text-sm font-medium">{provider.name}</span>
        {:else if isPaidProvider(provider)}
          <div class="flex w-full items-center justify-between text-sm font-medium">
            <span class="line-clamp-1 flex">{provider.model}</span>
            <!--
            TODO: 判断用户是否需要升级, 否则就去掉upgrade升级提示
            -->
            <A>{i18n('upgrade', { defaultValue: 'Upgrade' })}</A>
          </div>
        {:else if provider.type === 'custom'}
          <div class="line-clamp-1 w-full text-sm font-medium">
            <span>{provider.name}</span>
            {#if provider.model.name}
              <span>({provider.model.name})</span>
            {/if}
          </div>
        {/if}
        <Toggle
          size="small"
          bind:checked={$config.providers[index].enabled}
          classes={{ span: 'm-0' }} />
      </button>
    {/if}
  {/each}
</AccordionItem>
