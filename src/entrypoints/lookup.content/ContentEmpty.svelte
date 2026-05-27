<script lang="ts">
  import { Alert, Spinner } from 'flowbite-svelte';
  import { InfoCircleSolid } from 'flowbite-svelte-icons';

  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import { getInstantLookupDictionaryPrompt } from '@/lib/prompt';
  import { REGION_OPTIONS } from '@/preset/instant-lookup';
  import type { DictionaryData } from '@/types/instant-lookup';

  import { detectedLangCodeOrUnd } from './state';
</script>

{#if !$config.instantLookup.provider}
  <Alert color="red" class="font-medium" border>
    {#snippet icon()}<InfoCircleSolid class="h-5 w-5" />{/snippet}
    {i18n('instant_lookup_no_llm_provider', {
      defaultValue: 'No LLM provider selected. Please select a LLM provider in the settings.'
    })}
  </Alert>
{:else if $config.instantLookup.provider.type === 'free'}
  <Alert color="red" class="font-medium" border>
    {#snippet icon()}<InfoCircleSolid class="h-5 w-5" />{/snippet}
    {i18n('instant_lookup_free_provider_not_supported', {
      defaultValue: 'Instant lookup is not supported for free providers. Please use a LLM provider.'
    })}
  </Alert>
{:else if !$detectedLangCodeOrUnd || $detectedLangCodeOrUnd === 'und'}
  <Alert color="yellow" class="font-medium" border>
    {#snippet icon()}<InfoCircleSolid class="h-5 w-5" />{/snippet}
    {i18n('instant_lookup_source_language_undetected', {
      defaultValue:
        'Source language is undetected, please select a LLM provider for language detection.'
    })}
  </Alert>
{:else if $detectedLangCodeOrUnd === $config.instantLookup.selection.targetLangCode}
  <Alert color="secondary" class="font-medium" border>
    {#snippet icon()}<InfoCircleSolid class="h-5 w-5" />{/snippet}
    {i18n('instant_lookup_source_language_and_target_language_is_the_same', {
      defaultValue: 'Source language and target language are the same, instant lookup is skipped.'
    })}
  </Alert>
{:else}
  <div class="flex min-h-32 w-full items-center justify-center">
    <Spinner type="bars" color="primary" class="flex self-center" />
  </div>
{/if}
