<script lang="ts">
  import { Dropdown, DropdownGroup, DropdownItem, DropdownHeader } from 'flowbite-svelte';
  import { browser } from 'wxt/browser';

  import { config, type PaidProvider } from '@/lib/config';
  import { goProviders, zenProviders } from '@/lib/preset';
  import { i18n } from '@/lib/i18n';

  import ProviderIcon from './ProviderIcon.svelte';
</script>

<Dropdown simple placement="bottom-end" class="max-h-72 overflow-y-auto">
  <DropdownGroup class="py-0">
    <DropdownHeader class="py-1 text-sm text-slate-400">
      {i18n('free_user', { defaultValue: 'Free User' })}
    </DropdownHeader>
    {#each $config.freeProviders as provider (provider)}
      <DropdownItem
        class="flex items-center gap-2"
        onclick={() => ($config.pageTranslationProvider = { ...provider })}>
        <ProviderIcon {provider} avatarClass="w-4 h-4" imgClass="w-4 h-4" />
        <span>{provider.name}</span>
      </DropdownItem>
    {/each}
  </DropdownGroup>
  <DropdownGroup class="py-0">
    <DropdownHeader class="py-1 text-sm text-slate-400">
      {i18n('go_users', { defaultValue: 'Go Users' })}
    </DropdownHeader>
    {#each goProviders as PaidProvider[] as provider (provider)}
      <DropdownItem
        class="flex items-center gap-2"
        onclick={() => ($config.pageTranslationProvider = { ...provider })}>
        <ProviderIcon {provider} avatarClass="w-4 h-4" imgClass="w-4 h-4" />
        <span>{provider.name} ({provider.model})</span>
      </DropdownItem>
    {/each}
  </DropdownGroup>
  <DropdownGroup class="py-0">
    <DropdownHeader class="py-1 text-sm text-slate-400">
      {i18n('zen_users', { defaultValue: 'Zen Users' })}
    </DropdownHeader>
    {#each zenProviders as PaidProvider[] as provider (provider)}
      <DropdownItem
        class="flex items-center gap-2"
        onclick={() => ($config.pageTranslationProvider = { ...provider })}>
        <ProviderIcon {provider} avatarClass="w-4 h-4" imgClass="w-4 h-4" />
        <span>{provider.name} ({provider.model})</span>
      </DropdownItem>
    {/each}
  </DropdownGroup>
  <DropdownGroup class="py-0">
    <DropdownHeader class="py-1 text-sm text-slate-400">
      {i18n('custom', { defaultValue: 'Custom' })}
    </DropdownHeader>
    {#each $config.customProviders as PaidProvider[] as provider (provider)}
      <DropdownItem
        class="flex items-center gap-2"
        onclick={() => ($config.pageTranslationProvider = { ...provider })}>
        <ProviderIcon {provider} avatarClass="w-4 h-4" imgClass="w-4 h-4" />
        <span>
          {provider.name}
          {#if provider.model}
            ({provider.model})
          {/if}
        </span>
      </DropdownItem>
    {/each}
    <DropdownItem
      onclick={() =>
        browser.tabs.create({ url: browser.runtime.getURL('/options.html#api-providers') })}>
      {i18n('custom_providers', { defaultValue: 'Custom Providers' })}
    </DropdownItem>
  </DropdownGroup>
</Dropdown>
