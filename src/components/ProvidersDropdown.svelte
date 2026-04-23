<script lang="ts">
  import { Dropdown, DropdownGroup, DropdownItem, DropdownHeader } from 'flowbite-svelte';
  import { browser } from 'wxt/browser';

  import { config } from '@/lib/config';
  import { paidUserProviders } from '@/lib/preset';
  import { i18n } from '@/lib/i18n';
</script>

<Dropdown simple placement="bottom-end" class="max-h-72 overflow-y-auto">
  <DropdownGroup class="py-0">
    <DropdownHeader class="py-1 text-sm text-slate-400">
      {i18n('free_user', { defaultValue: 'Free User' })}
    </DropdownHeader>
    {#each $config.enabledProviders as provider ((provider.type, provider.name))}
      <DropdownItem onclick={() => ($config.translateProvider = { ...provider })}>
        {provider.name}
      </DropdownItem>
    {/each}
  </DropdownGroup>
  <DropdownGroup class="py-0">
    <DropdownHeader class="py-1 text-sm text-slate-400">
      {i18n('paid_user', { defaultValue: 'Paid User' })}
    </DropdownHeader>
    {#each paidUserProviders as provider ((provider.type, provider.name))}
      <DropdownItem onclick={() => ($config.translateProvider = { ...provider })}>
        {provider.name}
      </DropdownItem>
    {/each}
  </DropdownGroup>
  <DropdownGroup class="py-0">
    <DropdownHeader class="py-1 text-sm text-slate-400">
      {i18n('custom', { defaultValue: 'Custom' })}
    </DropdownHeader>
    {#each $config.customProviders as provider ((provider.type, provider.name))}
      <DropdownItem onclick={() => ($config.translateProvider = { ...provider })}>
        {provider.name}
      </DropdownItem>
    {/each}
    <DropdownItem
      onclick={() =>
        browser.tabs.create({ url: browser.runtime.getURL('/options.html#api-providers') })}>
      {i18n('custom_provider', { defaultValue: 'Custom Providers' })}
    </DropdownItem>
  </DropdownGroup>
</Dropdown>
