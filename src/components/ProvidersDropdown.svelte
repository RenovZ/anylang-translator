<script module lang="ts">
  export const apiProvidersId = 'api-providers';
</script>

<script lang="ts">
  import { A, Dropdown, DropdownGroup, DropdownHeader, DropdownItem } from 'flowbite-svelte';
  import { PlusOutline } from 'flowbite-svelte-icons';
  import { twMerge } from 'tailwind-merge';
  import { browser } from 'wxt/browser';

  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import type { FeatureField, PaidProvider, Provider } from '@/lib/types';

  import ProviderIcon from './ProviderIcon.svelte';

  interface Prop {
    showFreeProviders?: boolean;
    field: FeatureField;
    class?: string;
  }

  let { showFreeProviders = true, field, class: className }: Prop = $props();
</script>

<Dropdown simple placement="bottom-end" class={twMerge('max-h-72 overflow-y-auto', className)}>
  {#if showFreeProviders}
    <DropdownGroup class="py-0">
      <DropdownHeader class="py-1 text-sm text-slate-400">
        {i18n('free_users', { defaultValue: 'Free Users' })}
      </DropdownHeader>
      {#each $config.customProviders.filter((item) => item.type === 'free') as provider (provider)}
        <DropdownItem
          class="flex items-center gap-2"
          onclick={() => ($config[field].provider = { ...provider })}>
          <ProviderIcon {provider} class="w-4" />
          <span>{provider.name}</span>
        </DropdownItem>
      {/each}
    </DropdownGroup>
  {/if}
  <DropdownGroup class="py-0">
    <DropdownHeader class="py-1 text-sm text-slate-400">
      {i18n('go_users', { defaultValue: 'Go Users' })}
    </DropdownHeader>
    {#each $config.customProviders.filter((item) => item.type === 'go') as PaidProvider[] as provider (provider)}
      <DropdownItem
        class="flex items-center gap-2"
        onclick={() => ($config[field].provider = { ...provider })}>
        <ProviderIcon {provider} class="w-4" />
        <div class="flex w-full items-center justify-between text-sm font-medium">
          <!--
          TODO: 判断用户是否需要升级, 否则就正常展示+去掉upgrade升级提示
          -->
          <span class={`line-clamp-1 flex ${true ? 'cursor-not-allowed text-slate-400' : ''}`}>
            {provider.model}
          </span>
          <A>{i18n('upgrade', { defaultValue: 'Upgrade' })}</A>
        </div>
      </DropdownItem>
    {/each}
  </DropdownGroup>
  <DropdownGroup class="py-0">
    <DropdownHeader class="py-1 text-sm text-slate-400">
      {i18n('zen_users', { defaultValue: 'Zen Users' })}
    </DropdownHeader>
    {#each $config.customProviders.filter((item) => item.type === 'zen') as PaidProvider[] as PaidProvider[] as provider (provider)}
      <DropdownItem
        class="flex items-center gap-2"
        onclick={() => ($config[field].provider = { ...provider })}>
        <ProviderIcon {provider} class="w-4" />
        <div class="flex w-full items-center justify-between text-sm font-medium">
          <!--
          TODO: 判断用户是否需要升级, 否则就正常展示+去掉upgrade升级提示
          -->
          <span class={`line-clamp-1 flex ${true ? 'cursor-not-allowed text-slate-400' : ''}`}>
            {provider.model}
          </span>
          <A>{i18n('upgrade', { defaultValue: 'Upgrade' })}</A>
        </div>
      </DropdownItem>
    {/each}
  </DropdownGroup>
  <DropdownGroup class="py-0">
    <DropdownHeader class="py-1 text-sm text-slate-400">
      {i18n('custom', { defaultValue: 'Custom' })}
    </DropdownHeader>
    {#each $config.customProviders.filter((item) => item.type === 'custom') as PaidProvider[] as provider (provider)}
      <DropdownItem
        class="flex items-center gap-2"
        onclick={() => ($config[field].provider = { ...provider })}>
        <ProviderIcon {provider} class="w-4" />
        <span>
          {provider.name}
          {#if provider.model}
            ({provider.model})
          {/if}
        </span>
      </DropdownItem>
    {/each}
    <DropdownItem
      class="flex items-center gap-2"
      onclick={() =>
        browser.tabs.create({ url: browser.runtime.getURL(`/options.html#${apiProvidersId}`) })}>
      <PlusOutline class="h-4 w-4" />
      <span>{i18n('custom_providers', { defaultValue: 'Custom Providers' })}</span>
    </DropdownItem>
  </DropdownGroup>
</Dropdown>
