<script lang="ts">
  import {
    A,
    Accordion,
    Button,
    Checkbox,
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
  import { isEmpty, isEqual } from 'lodash';
  import { untrack } from 'svelte';
  import { json } from '@codemirror/lang-json';

  import AccordionItem from '@/components/AccordionItem.svelte';
  import CodeMirrorWrapper from '@/components/CodeMirrorWrapper.svelte';
  import ConfirmPopover from '@/components/ConfirmPopover.svelte';
  import IconWrapper from '@/components/IconWrapper.svelte';
  import ProviderIcon from '@/components/ProviderIcon.svelte';
  import { toast } from '@/components/toast-wrapper';
  import config from '@/lib/config';
  import errorManager from '@/lib/error';
  import i18n from '@/lib/i18n';
  import logger from '@/lib/logger';
  import { uniqueName } from '@/lib/naming';
  import { getAdaptiveTranslatePrompt } from '@/lib/prompt';
  import providerManager from '@/lib/provider';
  import { translate } from '@/lib/translate/sw';
  import type { FeatureKey } from '@/preset/feature';
  import {
    COMPATIBLE_PROVIDERS,
    defaultAIFeatures,
    featureItems,
    featureKeys,
    getModelsForProvider,
    getProviderIcon
  } from '@/preset/provider';
  import type { FeatureValue } from '@/types/feature';
  import {
    customProviderSchema,
    isCompatibleProvider,
    isCustomProvider,
    isPaidProvider,
    type AIProvider,
    type CustomProvider,
    type PresetItem,
    type ProviderConfig
  } from '@/types/provider';

  import { apiProvidersNav } from '../data';
  import Section from '../Section.svelte';

  import AddModal from './AddModal.svelte';
  import ProviderGroup from './ProviderGroup.svelte';

  let showPopover = $state(false);
  let showModal = $state(false);
  let showApiKey = $state(false);
  let selectedIndex = $state(0);

  const handleAdd = (preset: PresetItem) => {
    const isCompatible = isCompatibleProvider(preset);

    const DEFAULT_PROMPT = { system: '', prompt: '', output: [] as never[] };
    const newProvider: ProviderConfig = {
      type: 'custom',
      name: preset.name,
      description: preset.company ? `by ${preset.company}` : undefined,
      enabled: true,
      features: { ...defaultAIFeatures },
      provider: preset.provider,
      model: { isCustom: false, ...(preset.models.length ? { name: preset.models[0] } : {}) },
      ...(isCompatible ? { baseURL: '' } : {}),
      prompt: { ...DEFAULT_PROMPT }
    };

    newProvider.name = uniqueName(
      preset.name,
      $config.providers.map((p) => p.name)
    );

    $config.providers = [...$config.providers, newProvider];
    selectedIndex = $config.providers.length - 1;
  };

  const handleDelete = () => {
    if (selectedIndex < 0) return;

    $config.providers = $config.providers.filter((p, index) => index !== selectedIndex);
    selectedIndex = Math.min(selectedIndex, $config.providers.length - 1);
    showPopover = false;
  };

  interface ModelsResponse {
    object: string;
    data: Array<{ id: string; object: string; created: number; owned_by: string }>;
  }

  let customModels: string[] = $state([]);

  const fetchModels = async (providerConfig: CustomProvider) => {
    const { apiKey, baseURL } = providerConfig;
    if (!apiKey) {
      throw new Error(i18n('api_key_required', { defaultValue: 'Api key is required' }));
    }

    const response = await fetch(`${baseURL}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    if (!response.ok) {
      throw new Error(await errorManager.extractErrorMessage(response));
    }

    const data: ModelsResponse = await response.json();
    customModels = data.data.map((m) => m.id);
  };

  const getProviderOptions = () => {
    const providerConfig = $config.providers[selectedIndex];
    if (!providerConfig || providerConfig.type !== 'custom') return;

    const { providerOptions } = providerConfig;
    if (!isEmpty(providerOptions)) return JSON.stringify(providerOptions, null, 2);

    const modelName = providerConfig.model.name;
    const recommendedOptions = modelName
      ? providerManager.matchRecommendedOptions(modelName)
      : undefined;

    return JSON.stringify(recommendedOptions, null, 2);
  };

  const getProviderHeaders = () => {
    const providerConfig = $config.providers[selectedIndex];
    if (!providerConfig || providerConfig.type !== 'custom') return;

    const { headers } = providerConfig;
    if (!isEmpty(headers)) return JSON.stringify(headers, null, 2);

    const recommendedHeaders = providerManager.matchRecommendedHeaders(providerConfig.provider);

    return JSON.stringify(recommendedHeaders, null, 2);
  };

  const handleTest = async () => {
    try {
      await translate(
        'Hi',
        $config.sourceLangCode ?? 'auto',
        $config.targetLangCode,
        $config.providers[selectedIndex],
        getAdaptiveTranslatePrompt
      );
      toast.success(
        i18n('test_connection_success', { defaultValue: 'Test connection successful' })
      );
    } catch (error) {
      logger.error('Failed to test connection', { error });
      toast.error(i18n('test_connection_failed', { defaultValue: 'Test connection failed' }));
    }
  };

  // $effect(() => {
  //   if (selectedIndex < 0) return;
  //   if ($config.providers[selectedIndex].type !== 'custom') return;
  //   untrack(() => getOrInitProviderOptions());
  // });
</script>

<Section title={apiProvidersNav.title} description={apiProvidersNav.description}>
  <div class="grid h-full grid-cols-1 items-start gap-2 lg:grid-cols-[320px_1fr]">
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
            <ProviderIcon
              name={$config.providers[selectedIndex].name}
              icon={getProviderIcon($config.providers[selectedIndex])} />
            <span class="text-lg font-semibold">{$config.providers[selectedIndex].name}</span>
            {#if isPaidProvider($config.providers[selectedIndex])}
              <!--
                TODO: 判断用户是否需要升级, 否则就去掉upgrade升级提示
                -->
              <A class="font-medium">{i18n('upgrade', { defaultValue: 'Upgrade' })}</A>
            {/if}
          </div>
          <button type="button" class="text-sm underline" onclick={handleTest}>
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
              disabled={$config.providers[selectedIndex].type !== 'custom'}
              type="text"
              class="border-none bg-gray-50 shadow dark:bg-gray-600"
              bind:value={$config.providers[selectedIndex].name} />
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <Label class="block text-sm font-medium">
              {i18n('provider_description', { defaultValue: 'Description' })}
            </Label>
            <Textarea
              class="w-full border-none bg-gray-50 shadow dark:bg-gray-600"
              bind:value={$config.providers[selectedIndex].description} />
          </div>

          <!-- API Key -->
          {#if $config.providers[selectedIndex].type === 'custom'}
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
                  bind:value={($config.providers[selectedIndex] as CustomProvider).apiKey}
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
          {#if $config.providers[selectedIndex].type === 'custom'}
            <div class="space-y-2">
              <Label class="text-sm font-medium">
                {i18n('base_url', { defaultValue: 'Base URL' })}
              </Label>
              <Input
                type="text"
                bind:value={($config.providers[selectedIndex] as CustomProvider).baseURL}
                class="border-none bg-gray-50 shadow dark:bg-gray-600" />
            </div>
          {/if}

          <!-- Model (select list only for custom providers; go/zen have fixed models) -->
          {#if $config.providers[selectedIndex].type === 'custom'}
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label class="block text-sm font-medium">
                  {i18n('model', { defaultValue: 'Model' })}
                </Label>
                {#if isCompatibleProvider($config.providers[selectedIndex]) && !($config.providers[selectedIndex] as CustomProvider).model.isCustom}
                  <Button
                    size="xs"
                    color="alternative"
                    class="flex items-center gap-1 border-none text-xs shadow"
                    onclick={async () => {
                      ($config.providers[selectedIndex] as CustomProvider).model.name = undefined;
                      await fetchModels($config.providers[selectedIndex] as CustomProvider);
                    }}>
                    <IconWrapper icon="tabler:list-search" class="h-4 w-4" />
                    <span>
                      {i18n('fetch_available_models', { defaultValue: 'Fetch Available Models' })}
                    </span>
                  </Button>
                {/if}
              </div>
              {#if ($config.providers[selectedIndex] as CustomProvider).model.isCustom}
                <Input
                  type="text"
                  class="border-none bg-gray-50 shadow dark:bg-gray-600"
                  bind:value={($config.providers[selectedIndex] as CustomProvider).model.name} />
              {:else}
                <Select
                  bind:value={($config.providers[selectedIndex] as CustomProvider).model.name}
                  classes={{ select: 'border-none shadow bg-gray-50 dark:bg-gray-600' }}>
                  {#if ($config.providers[selectedIndex] as CustomProvider).model.name}
                    <option value={($config.providers[selectedIndex] as CustomProvider).model.name}>
                      {($config.providers[selectedIndex] as CustomProvider).model.name}
                    </option>
                  {:else if isCompatibleProvider($config.providers[selectedIndex])}
                    {#each customModels as model (model)}
                      <option value={model}>{model}</option>
                    {/each}
                  {:else}
                    {#each getModelsForProvider($config.providers[selectedIndex]) as model (model)}
                      <option value={model}>{model}</option>
                    {/each}
                  {/if}
                </Select>
              {/if}
              <Checkbox
                bind:checked={($config.providers[selectedIndex] as CustomProvider).model.isCustom}>
                {i18n('enter_the_model_name', { defaultValue: 'Enter the model name' })}
              </Checkbox>
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
                  .filter((key: FeatureKey) => key in $config.providers[selectedIndex].features)
                  .map((key: FeatureKey) => [key, $config.providers[selectedIndex].features![key]] as [FeatureKey, FeatureValue]) as [featureKey, featureValue] (featureKey)}
                  <Toggle
                    size="small"
                    disabled={featureValue.disabled}
                    bind:checked={$config.providers[selectedIndex].features![featureKey]!.state}>
                    {featureItems.find((f) => f.key === featureKey)?.label}
                  </Toggle>
                {/each}
              </div>
            </AccordionItem>
          </Accordion>

          <!-- Advanced Options -->
          {#if $config.providers[selectedIndex].type !== 'free'}
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
                      bind:value={($config.providers[selectedIndex] as AIProvider).temperature} />
                  </div>

                  {#if isCustomProvider($config.providers[selectedIndex])}
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
                        <A
                          class="text-xs"
                          target="_blank"
                          href="https://ai-sdk.dev/providers/ai-sdk-providers">
                          {i18n('view_provider_docs', { defaultValue: 'View Provider Docs' })}
                        </A>
                      </div>
                      <!--
                      <Textarea
                        value={JSON.stringify(
                          ($config.providers[selectedIndex] as CustomProvider).providerOptions ?? {
                            field: 'value'
                          },
                          null,
                          2
                        )}
                        onchange={(e) => {
                          if ($config.providers[selectedIndex].type !== 'custom') return;
                          try {
                            const parsed = JSON.parse(e.currentTarget.value);
                            ($config.providers[selectedIndex] as CustomProvider).providerOptions =
                              parsed;
                          } catch (err) {
                            logger.error('API request failed', {
                              error: err instanceof Error ? err.message : String(err)
                            });
                          }
                        }}
                        class="h-32 w-full border-none bg-gray-50 font-mono text-sm shadow dark:bg-gray-600"
                        spellcheck="false"></Textarea>
                      -->
                      <CodeMirrorWrapper
                        class="min-h-32 w-full rounded-xl border-none bg-gray-50 font-mono text-sm shadow dark:bg-gray-600"
                        lang={json()}
                        placeholder={`{
  "field": "value"
}`}
                        value={getProviderOptions()}
                        onchange={(v) => {
                          // if ($config.providers[selectedIndex].type !== 'custom') return;
                          try {
                            const parsed = JSON.parse(v);
                            ($config.providers[selectedIndex] as CustomProvider).providerOptions =
                              parsed;
                          } catch (error) {
                            logger.error('Provider options parse failed', {
                              error
                            });
                            toast.error(
                              i18n('provider_options_parse_failed', {
                                defaultValue: 'Provider options parse failed'
                              })
                            );
                          }
                        }} />
                    </div>
                    <!-- Provider Headers -->
                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <Label class="flex items-center gap-1 text-sm font-medium">
                          {i18n('provider_headers', { defaultValue: 'HTTP Headers' })}
                          <QuestionCircleOutline class="h-4 w-4 shrink-0 cursor-help" />
                          <Tooltip class="max-w-80 text-xs font-normal">
                            {i18n('provider_headers_tooltip', {
                              defaultValue:
                                'Custom HTTP headers sent when creating the AI provider client. Leave empty to use provider defaults; use {} to disable defaults.'
                            })}
                          </Tooltip>
                        </Label>
                        <A
                          class="text-xs"
                          target="_blank"
                          href="https://ai-sdk.dev/providers/ai-sdk-providers">
                          {i18n('view_provider_docs', { defaultValue: 'View Provider Docs' })}
                        </A>
                      </div>
                      <CodeMirrorWrapper
                        class="min-h-32 w-full rounded-xl border-none bg-gray-50 font-mono text-sm shadow dark:bg-gray-600"
                        lang={json()}
                        placeholder={`{
  "X-Custom-Header": "value"
}`}
                        value={getProviderHeaders()}
                        onchange={(v) => {
                          // if ($config.providers[selectedIndex].type !== 'custom') return;
                          try {
                            const parsed = JSON.parse(v);
                            ($config.providers[selectedIndex] as CustomProvider).headers = parsed;
                          } catch (error) {
                            logger.error('Provider http headers parse failed', {
                              error
                            });
                            toast.error(
                              i18n('provider_headers_parse_failed', {
                                defaultValue: 'Provider http headers parse failed'
                              })
                            );
                          }
                        }} />
                    </div>
                  {/if}
                </div>
              </AccordionItem>
            </Accordion>
          {/if}

          <!-- Delete Button -->
          {#if $config.providers[selectedIndex].type === 'custom'}
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
