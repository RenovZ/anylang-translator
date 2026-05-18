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
  import { sendMessage } from '@/lib/protocol';
  import type { FeatureField } from '@/preset/feature';
  import { ICON_BY_NAME, ICON_BY_PROVIDER_ID } from '@/preset/provider';
  import type { CustomProvider, FreeProvider, GoProvider, ZenProvider } from '@/types/provider';

  import ProviderIcon from './ProviderIcon.svelte';

  interface Prop {
    showFreeProviders?: boolean;
    field: FeatureField;
    class?: string;
  }

  let { showFreeProviders = true, field, class: className }: Prop = $props();

  // ── Derived: filter providers by type once per config change ─────────────
  const freeProvidersList = $derived(
    $config.providers.filter(
      (item): item is FreeProvider =>
        item.type === 'free' && item.enabled && !!item.features[field]?.state
    )
  );
  const goProvidersList = $derived(
    $config.providers.filter(
      (item): item is GoProvider =>
        item.type === 'go' && item.enabled && !!item.features[field]?.state
    )
  );
  const zenProvidersList = $derived(
    $config.providers.filter(
      (item): item is ZenProvider =>
        item.type === 'zen' && item.enabled && !!item.features[field]?.state
    )
  );
  const customProvidersList = $derived(
    $config.providers.filter(
      (item): item is CustomProvider =>
        item.type === 'custom' && item.enabled && !!item.features[field]?.state
    )
  );
</script>

<Dropdown
  simple
  placement="bottom-end"
  class={twMerge('max-h-72 overflow-y-auto shadow-md', className)}>
  {#if showFreeProviders}
    <DropdownGroup class="py-0">
      <DropdownHeader class="py-1 text-sm text-slate-400">
        {i18n('free_users', { defaultValue: 'Free Users' })}
      </DropdownHeader>
      {#each freeProvidersList as provider (provider.name)}
        <DropdownItem
          class="flex items-center gap-2"
          onclick={() => ($config[field].provider = { ...provider })}>
          <ProviderIcon name={provider.name} icon={ICON_BY_NAME[provider.name]} class="w-4" />
          <span>{provider.name}</span>
        </DropdownItem>
      {/each}
    </DropdownGroup>
  {/if}
  <DropdownGroup class="py-0">
    <DropdownHeader class="py-1 text-sm text-slate-400">
      {i18n('go_users', { defaultValue: 'Go Users' })}
    </DropdownHeader>
    {#each goProvidersList as provider (provider.name)}
      <DropdownItem
        class="flex items-center gap-2"
        onclick={() => ($config[field].provider = { ...provider })}>
        <ProviderIcon name={provider.name} icon={ICON_BY_NAME[provider.name]} class="w-4" />
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
    {#each zenProvidersList as provider (provider.name)}
      <DropdownItem
        class="flex items-center gap-2"
        onclick={() => ($config[field].provider = { ...provider })}>
        <ProviderIcon name={provider.name} icon={ICON_BY_NAME[provider.name]} class="w-4" />
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
    {#each customProvidersList as provider (provider.name)}
      <DropdownItem
        class="flex items-center gap-2"
        onclick={() => ($config[field].provider = { ...provider })}>
        <ProviderIcon
          name={provider.name}
          icon={ICON_BY_PROVIDER_ID[provider.provider]}
          class="w-4" />
        <span>
          {provider.name}
          {#if provider.model.name}
            ({provider.model.name})
          {/if}
        </span>
      </DropdownItem>
    {/each}
    <DropdownItem
      class="flex items-center gap-2"
      onclick={() =>
        sendMessage('openPage', {
          url: browser.runtime.getURL(`/options.html#${apiProvidersId}`)
        })}>
      <PlusOutline class="h-4 w-4" />
      <span>{i18n('custom_providers', { defaultValue: 'Custom Providers' })}</span>
    </DropdownItem>
  </DropdownGroup>
</Dropdown>
