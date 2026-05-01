<script lang="ts">
  import {
    A,
    Accordion,
    Button,
    Input,
    Label,
    Select,
    Textarea,
    Toggle,
    Tooltip
  } from 'flowbite-svelte';
  import {
    EyeOutline,
    EyeSlashOutline,
    PlusOutline,
    QuestionCircleOutline
  } from 'flowbite-svelte-icons';

  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import { defaultAIFeatures, featureItems, featureKeys } from '@/lib/preset';
  import type { FeatureKey, FeatureValue, PaidProvider, Provider } from '@/lib/types';
  import AccordionItem from '@/components/AccordionItem.svelte';
  import ConfirmPopover from '@/components/ConfirmPopover.svelte';
  import IconWrapper from '@/components/IconWrapper.svelte';

  import { apiProvidersNav } from '../data';
  import Section from '../Section.svelte';

  import AddModal from './AddModal.svelte';
  import ProviderGroup from './ProviderGroup.svelte';

  let showPopover = $state(false);
  let showModal = $state(false);
  let showApiKey = $state(false);
  let selectedIndex = $state(0);

  const handleAdd = (item: Provider) => {
    const newProvider: Provider = {
      ...item,
      type: 'custom',
      features: { ...defaultAIFeatures }
    };

    const size = $config.customProviders.filter((p) => p.icon === newProvider.icon).length;

    if (size > 0) {
      newProvider.name = `${newProvider.name} ${size}`;
    }

    $config.customProviders = [...$config.customProviders, newProvider];
    selectedIndex = $config.customProviders.length - 1;
  };

  const handleDelete = () => {
    if (selectedIndex < 0) return;

    $config.customProviders = $config.customProviders.filter((p, index) => index !== selectedIndex);
    selectedIndex = Math.min(selectedIndex, $config.customProviders.length - 1);
    showPopover = false;
  };
</script>

<Section limitHeight title={apiProvidersNav.title} description={apiProvidersNav.description}>
  <div class="grid h-full grid-cols-1 items-start gap-2 lg:grid-cols-[280px_1fr]">
    <!-- Left: Provider List -->
    <div class="max-h-full space-y-3 overflow-y-auto px-1 pb-4">
      <Accordion multiple class="rounded-none border-none">
        <ProviderGroup
          open
          title={i18n('free_users', { defaultValue: 'Free Users' })}
          currentType="free"
          bind:selectedIndex />
        <ProviderGroup
          open
          title={i18n('go_users', { defaultValue: 'Go Users' })}
          currentType="go"
          bind:selectedIndex />
        <ProviderGroup
          open
          title={i18n('zen_users', { defaultValue: 'Zen Users' })}
          currentType="zen"
          bind:selectedIndex />
        <ProviderGroup
          open
          title={i18n('custom', { defaultValue: 'Custom' })}
          currentType="custom"
          bind:selectedIndex />
      </Accordion>

      <Button
        color="alternative"
        class="mt-2 w-full rounded-xl border-none text-slate-600 shadow hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-600"
        onclick={() => (showModal = true)}>
        <PlusOutline class="me-2 h-4 w-4" />
        {i18n('add_provider', { defaultValue: 'Add Provider' })}
      </Button>
    </div>

    <!-- Right: Provider Configuration -->
    <div class="max-h-full overflow-y-auto rounded-xl bg-gray-50 p-4 shadow-inner dark:bg-gray-700">
      {#if selectedIndex >= 0}
        <div class="mb-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <picture>
              <source
                media="(prefers-color-scheme: dark)"
                srcset={`https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/${$config.customProviders[selectedIndex].icon}.webp`} />
              <img
                alt={$config.customProviders[selectedIndex].name}
                class="flex h-6 w-6"
                src={`https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/light/${$config.customProviders[selectedIndex].icon}.webp`} />
            </picture>
            <span class="text-lg font-semibold">{$config.customProviders[selectedIndex].name}</span>
            {#if $config.customProviders[selectedIndex].type === 'go' || $config.customProviders[selectedIndex].type === 'zen'}
              <!--
                TODO: 判断用户是否需要升级, 否则就去掉upgrade升级提示
                -->
              <A class="font-medium">{i18n('upgrade', { defaultValue: 'Upgrade' })}</A>
            {/if}
          </div>
          <button
            type="button"
            class="text-sm underline"
            onclick={() => {
              console.log('TODO: this should be finished');
            }}>
            {i18n('click_to_test_this_provider', { defaultValue: 'Click to test this provider' })}
          </button>
        </div>

        <div class="space-y-4">
          <!-- Name -->
          <div class="space-y-2">
            <Label class="block text-sm font-medium">
              {i18n('provider_name', { defaultValue: 'Name' })}
            </Label>
            <Input
              disabled={$config.customProviders[selectedIndex].type !== 'custom'}
              type="text"
              class="border-none bg-gray-50 shadow dark:bg-gray-600"
              bind:value={$config.customProviders[selectedIndex].name} />
          </div>

          <!-- API Key -->
          {#if $config.customProviders[selectedIndex].type === 'custom'}
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label class="text-sm font-medium">
                  {i18n('api_key', { defaultValue: 'API Key' })}
                </Label>
                <!-- <Button
                  size="xs"
                  color="alternative"
                  class="rounded-lg text-xs dark:bg-slate-700 dark:text-white"
                  onclick={() => {}}>
                  {i18n('test_connection', { defaultValue: 'Test Connection' })}
                </Button> -->
              </div>
              <div class="relative">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  bind:value={($config.customProviders[selectedIndex] as PaidProvider).apiKey}
                  class="border-none bg-gray-50 pr-10 shadow dark:bg-gray-600" />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  onclick={() => (showApiKey = !showApiKey)}>
                  {#if showApiKey}
                    <EyeSlashOutline class="h-4 w-4" />
                  {:else}
                    <EyeOutline class="h-4 w-4" />
                  {/if}
                </button>
              </div>
            </div>
          {/if}

          <!-- Base URL -->
          {#if $config.customProviders[selectedIndex].type === 'custom'}
            <div class="space-y-2">
              <Label class="block text-sm font-medium">
                {i18n('base_url', { defaultValue: 'Base URL' })}
              </Label>
              <Input
                type="text"
                bind:value={($config.customProviders[selectedIndex] as PaidProvider).baseUrl}
                class="border-none bg-gray-50 shadow dark:bg-gray-600" />
            </div>
          {/if}

          <!-- Model -->
          {#if $config.customProviders[selectedIndex].type !== 'free'}
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label class="block text-sm font-medium">
                  {i18n('model', { defaultValue: 'Model' })}
                </Label>
                <Button
                  size="xs"
                  color="alternative"
                  class="flex items-center gap-1 border-none text-xs shadow"
                  onclick={() => {}}>
                  <IconWrapper icon="tabler:list-search" class="h-4 w-4" />
                  <span>
                    {i18n('fetch_available_models', { defaultValue: 'Fetch Available Models' })}
                  </span>
                </Button>
              </div>
              <Select
                bind:value={($config.customProviders[selectedIndex] as PaidProvider).model}
                classes={{ select: 'border-none shadow bg-gray-50 dark:bg-gray-600' }}>
                {#each ($config.customProviders[selectedIndex] as PaidProvider).models as model (model)}
                  <option value={model}>{model}</option>
                {/each}
                <!-- <option value="">
                  {i18n('enter_custom_model', {
                    defaultValue: 'Enter the name of the custom model'
                  })}
                </option> -->
              </Select>
            </div>
          {/if}

          <!-- Feature Providers -->
          <Accordion class="space-y-2 rounded-none border-none">
            <AccordionItem open buttonClass="w-fit p-0" contentClass="w-fit">
              {#snippet title()}
                <span>{i18n('feature_providers', { defaultValue: 'Feature Providers' })}</span>
              {/snippet}
              <div class="space-y-2">
                {#each featureKeys
                  .filter((key: FeatureKey) => key in $config.customProviders[selectedIndex].features)
                  .map((key: FeatureKey) => [key, $config.customProviders[selectedIndex].features![key]] as [FeatureKey, FeatureValue]) as [featureKey, featureValue] (featureKey)}
                  <Toggle
                    size="small"
                    disabled={featureValue.disabled}
                    bind:checked={
                      (
                        $config.customProviders[selectedIndex].features as Partial<
                          Record<FeatureKey, FeatureValue>
                        >
                      )[featureKey]!.state
                    }>
                    {featureItems.find((f) => f.key === featureKey)?.label}
                  </Toggle>
                {/each}
              </div>
            </AccordionItem>
          </Accordion>

          <!-- Advanced Options -->
          {#if $config.customProviders[selectedIndex].type !== 'free'}
            <Accordion class="space-y-2 rounded-none border-none">
              <AccordionItem buttonClass="w-fit p-0">
                {#snippet title()}
                  <span>{i18n('advanced_options', { defaultValue: 'Advanced Options' })}</span>
                {/snippet}
                <div class="space-y-2">
                  <!-- Temperature -->
                  <div class="space-y-2">
                    <Label class="flex items-center gap-1 text-sm font-medium">
                      {i18n('temperature', { defaultValue: 'Temperature' })}
                      <QuestionCircleOutline class="h-4 w-4 shrink-0 cursor-help" />
                      <Tooltip class="max-w-80 text-xs font-normal">
                        {i18n('temperature_tooltip', {
                          defaultValue:
                            'Controls randomness in responses. Lower values (0) are more deterministic, higher values are more creative. Range varies by provider. Leave empty to use provider default.'
                        })}
                      </Tooltip>
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      class="border-none bg-gray-50 shadow dark:bg-gray-600"
                      bind:value={
                        ($config.customProviders[selectedIndex] as PaidProvider).temperature
                      } />
                  </div>

                  <!-- Provider Options -->
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <Label class="flex items-center gap-1 text-sm font-medium">
                        {i18n('provider_options', { defaultValue: 'Provider Options' })}
                        <QuestionCircleOutline class="h-4 w-4 shrink-0 cursor-help" />
                        <Tooltip class="max-w-80 text-xs font-normal">
                          {i18n('provider_options_tooltip', {
                            defaultValue:
                              "Provider-specific options for non-standard API features like thinking/reasoning mode. See the Vercel AI SDK docs or your provider's official documentation for configuration details."
                          })}
                        </Tooltip>
                      </Label>
                      <A class="text-xs" href="https://ai-sdk.dev/providers/ai-sdk-providers">
                        {i18n('view_provider_docs', { defaultValue: 'View Provider Docs' })}
                      </A>
                    </div>
                    <Textarea
                      value={JSON.stringify(
                        ($config.customProviders[selectedIndex] as PaidProvider)
                          .providerOptions ?? {
                          field: 'value'
                        },
                        null,
                        2
                      )}
                      onchange={(e) => {
                        if ($config.customProviders[selectedIndex].type === 'free') return;
                        try {
                          const parsed = JSON.parse(e.currentTarget.value);
                          ($config.customProviders[selectedIndex] as PaidProvider).providerOptions =
                            parsed;
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      class="h-32 w-full border-none bg-gray-50 font-mono text-sm shadow dark:bg-gray-600"
                      spellcheck="false"></Textarea>
                  </div>
                </div>
              </AccordionItem>
            </Accordion>
          {/if}

          <!-- Delete Button -->
          {#if $config.customProviders[selectedIndex].type === 'custom'}
            <div class="flex justify-end pt-4">
              <Button color="red">
                {i18n('delete', { defaultValue: 'Delete' })}
              </Button>
              <ConfirmPopover
                bind:showPopover
                title={i18n('delete_provider_title', { defaultValue: 'Delete Provider?' })}
                description={i18n('delete_provider_description', {
                  defaultValue: 'Are you sure to delete this provider?'
                })}
                handleConfirm={handleDelete}
                trigger="click" />
            </div>
          {/if}
        </div>
      {:else}
        <div class="flex h-64 items-center justify-center text-gray-400">
          <p>
            {i18n('select_provider_to_configure', {
              defaultValue: 'Select a provider to configure'
            })}
          </p>
        </div>
      {/if}
    </div>
  </div>
</Section>

<AddModal bind:open={showModal} onSelect={handleAdd} />
