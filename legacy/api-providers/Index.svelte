<script lang="ts">
  import { Button, Input, Label, Select } from 'flowbite-svelte';
  import { EyeOutline, EyeSlashOutline, PlusOutline } from 'flowbite-svelte-icons';

  import { config, type FeatureKey, type Provider } from '@/lib/config';
  import { i18n } from '@/lib/i18n';
  import { allFeatures } from '@/lib/preset';

  import Section from '../Section.svelte';

  import AddProviderModal from './AddProviderModal.svelte';

  let showModal = $state(false);
  let selectedProviderIndex = $state(-1);
  let showApiKey = $state(false);

  let selectedProvider = $derived(
    selectedProviderIndex >= 0 ? $config.enabledProviders[selectedProviderIndex] : null
  );

  function handleAddProvider(provider: Provider) {
    const exists = $config.enabledProviders.some((p) => p.name === provider.name);
    if (exists) return;

    config.update((c) => ({
      ...c,
      enabledProviders: [...c.enabledProviders, provider]
    }));
    selectedProviderIndex = $config.enabledProviders.length - 1;
  }

  function updateSelectedProvider(updates: Partial<Provider>) {
    if (selectedProviderIndex < 0) return;
    config.update((c) => {
      const providers = [...c.enabledProviders];
      providers[selectedProviderIndex] = {
        ...providers[selectedProviderIndex],
        ...updates
      } as Provider;
      return { ...c, enabledProviders: providers };
    });
  }

  function deleteSelectedProvider() {
    if (selectedProviderIndex < 0) return;
    config.update((c) => ({
      ...c,
      enabledProviders: c.enabledProviders.filter((_, i) => i !== selectedProviderIndex)
    }));
    selectedProviderIndex = -1;
  }

  function toggleFeature(feature: FeatureKey) {
    if (!selectedProvider) return;
    const current = selectedProvider.features ?? [];
    const next = current.includes(feature)
      ? current.filter((f) => f !== feature)
      : [...current, feature];
    updateSelectedProvider({ features: next });
  }

  function isFeatureEnabled(feature: FeatureKey): boolean {
    return selectedProvider?.features?.includes(feature) ?? false;
  }
</script>

<Section
  id="api-providers"
  title={i18n('api_providers', { defaultValue: 'API Providers' })}
  description={i18n('api_providers_hint', {
    defaultValue:
      'Configure API providers for translation and vocabulary insight. We have 20+ built-in providers and support any OpenAI-compatible API provider.'
  })}>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
    <!-- Left: Provider List -->
    <div class="space-y-3">
      <Button
        color="alternative"
        class="w-full rounded-xl dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        onclick={() => (showModal = true)}>
        <PlusOutline class="me-2 h-4 w-4" />
        {i18n('add_provider', { defaultValue: 'Add Provider' })}
      </Button>

      <div class="space-y-1">
        {#each $config.enabledProviders as provider, index (provider.name)}
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition"
            class:bg-slate-100={selectedProviderIndex === index}
            class:dark:bg-slate-700={selectedProviderIndex === index}
            class:hover:bg-slate-50={selectedProviderIndex !== index}
            class:dark:hover:bg-slate-800={selectedProviderIndex !== index}
            onclick={() => (selectedProviderIndex = index)}>
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-600 dark:text-gray-300">
              {provider.name.charAt(0)}
            </div>
            <span class="flex-1 truncate text-sm font-medium">{provider.name}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Right: Provider Configuration -->
    <div
      class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {#if selectedProvider}
        <div class="mb-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600 dark:bg-gray-600 dark:text-gray-300">
              {selectedProvider.name.charAt(0)}
            </div>
            <span class="text-lg font-semibold">{selectedProvider.name}</span>
          </div>
          <button
            type="button"
            class="text-sm text-blue-600 hover:underline dark:text-blue-400"
            onclick={() => {}}>
            {i18n('how_to_configure', { defaultValue: 'How to configure?' })}
          </button>
        </div>

        <div class="space-y-6">
          <!-- Name -->
          <div>
            <Label class="mb-2 block text-sm font-medium">
              {i18n('provider_name', { defaultValue: 'Name' })}
            </Label>
            <Input
              type="text"
              value={selectedProvider.name}
              onchange={(e) => updateSelectedProvider({ name: e.currentTarget.value })}
              class="rounded-lg" />
          </div>

          <!-- Description -->
          <div>
            <Label class="mb-2 block text-sm font-medium">
              {i18n('provider_description', { defaultValue: 'Description' })}
            </Label>
            <Input
              type="text"
              value={selectedProvider.description ?? ''}
              onchange={(e) => updateSelectedProvider({ description: e.currentTarget.value })}
              class="rounded-lg" />
          </div>

          <!-- API Key -->
          <div>
            <div class="mb-2 flex items-center justify-between">
              <Label class="text-sm font-medium">
                {i18n('api_key', { defaultValue: 'API Key' })}
              </Label>
              <Button
                size="xs"
                color="alternative"
                class="rounded-lg text-xs dark:bg-slate-700 dark:text-white"
                onclick={() => {}}>
                {i18n('test_connection', { defaultValue: 'Test Connection' })}
              </Button>
            </div>
            <div class="relative">
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={selectedProvider.apiKey ?? ''}
                onchange={(e) => updateSelectedProvider({ apiKey: e.currentTarget.value })}
                class="rounded-lg pr-10" />
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
            <label class="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                class="rounded border-gray-300"
                onchange={() => (showApiKey = !showApiKey)} />
              <span>{i18n('show_api_key', { defaultValue: 'Show API Key' })}</span>
            </label>
          </div>

          <!-- Base URL -->
          <div>
            <Label class="mb-2 block text-sm font-medium">
              {i18n('base_url', { defaultValue: 'Base URL (Optional)' })}
            </Label>
            <Input
              type="text"
              value={selectedProvider.baseUrl ?? ''}
              onchange={(e) => updateSelectedProvider({ baseUrl: e.currentTarget.value })}
              class="rounded-lg" />
          </div>

          <!-- Model -->
          <div>
            <Label class="mb-2 block text-sm font-medium">
              {i18n('model', { defaultValue: 'Model' })}
            </Label>
            <Select
              value={selectedProvider.model ?? ''}
              onchange={(e) =>
                updateSelectedProvider({
                  model: (e.currentTarget as HTMLSelectElement).value
                })}>
              {#if selectedProvider.type === 'ai'}
                {#each selectedProvider.models as model (model)}
                  <option value={model}>{model}</option>
                {/each}
              {/if}
              <option value=""
                >{i18n('enter_custom_model', {
                  defaultValue: 'Enter the name of the custom model'
                })}</option>
            </Select>
          </div>

          <!-- Feature Providers -->
          <div>
            <button
              type="button"
              class="flex items-center gap-1 text-sm font-medium"
              onclick={() => {}}>
              <span>{i18n('feature_providers', { defaultValue: 'Feature Providers' })}</span>
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div class="mt-3 space-y-2">
              {#each allFeatures as feature (feature)}
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    class="relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition"
                    class:bg-primary-600={isFeatureEnabled(feature.key)}
                    class:bg-gray-200={!isFeatureEnabled(feature.key)}
                    class:dark:bg-gray-600={!isFeatureEnabled(feature.key)}
                    onclick={() => toggleFeature(feature.key)}
                    aria-pressed={isFeatureEnabled(feature.key)}
                    aria-label={feature.label}>
                    <span
                      class="inline-block h-3 w-3 transform rounded-full bg-white transition"
                      class:translate-x-4={isFeatureEnabled(feature.key)}
                      class:translate-x-1={!isFeatureEnabled(feature.key)}></span>
                  </button>
                  <span class="text-sm">{feature.label}</span>
                </div>
              {/each}
            </div>
          </div>

          <!-- Advanced Options -->
          <div>
            <button
              type="button"
              class="flex items-center gap-1 text-sm font-medium"
              onclick={() => {}}>
              <span>{i18n('advanced_options', { defaultValue: 'Advanced Options' })}</span>
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div class="mt-3 space-y-4">
              <!-- Temperature -->
              <div>
                <Label class="mb-2 block text-sm font-medium">
                  {i18n('temperature', { defaultValue: 'Temperature' })}
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={selectedProvider.temperature ?? 1}
                  onchange={(e) =>
                    updateSelectedProvider({
                      temperature: parseFloat(e.currentTarget.value)
                    })}
                  class="rounded-lg" />
              </div>

              <!-- Provider Options -->
              <div>
                <div class="mb-2 flex items-center justify-between">
                  <Label class="text-sm font-medium">
                    {i18n('provider_options', { defaultValue: 'Provider Options' })}
                  </Label>
                  <button
                    type="button"
                    class="text-xs text-blue-600 hover:underline dark:text-blue-400"
                    onclick={() => {}}>
                    {i18n('view_provider_docs', { defaultValue: 'View Provider Docs' })}
                  </button>
                </div>
                <textarea
                  value={JSON.stringify(
                    selectedProvider.providerOptions ?? { field: 'value' },
                    null,
                    2
                  )}
                  onchange={(e) => {
                    try {
                      const parsed = JSON.parse(e.currentTarget.value);
                      updateSelectedProvider({ providerOptions: parsed });
                    } catch {
                      /* ignore invalid JSON */
                    }
                  }}
                  class="h-32 w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm dark:border-gray-600 dark:bg-gray-700"
                  spellcheck="false"></textarea>
              </div>
            </div>
          </div>

          <!-- Delete Button -->
          <div class="flex justify-end pt-4">
            <Button color="red" class="rounded-lg" onclick={deleteSelectedProvider}>
              {i18n('delete', { defaultValue: 'Delete' })}
            </Button>
          </div>
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

<AddProviderModal bind:open={showModal} onSelect={handleAddProvider} />
