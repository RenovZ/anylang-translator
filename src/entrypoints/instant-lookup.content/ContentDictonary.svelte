<script lang="ts">
  import LocalIcon from '@/components/LocalIcon.svelte';
  import { getInstantLookupDictionaryPrompt } from '@/lib/prompt';
  import { REGION_OPTIONS } from '@/preset/instant-lookup';
  import type { DictionaryData } from '@/types/instant-lookup';

  import { getData } from './ContentApi.svelte';
  import ContentEmpty from './ContentEmpty.svelte';
  import { detectedLangCodeOrUnd } from './state';

  interface Props {
    selectedText: string;
  }

  let { selectedText = $bindable('') }: Props = $props();

  let data: DictionaryData | null = $state(null);
  let loading = $state(false);
  $effect(() => {
    const text = selectedText.trim();
    if (!text) {
      data = null;
      loading = false;
      return;
    }

    let cancelled = false;
    loading = true;
    getData<DictionaryData>(text, $detectedLangCodeOrUnd, getInstantLookupDictionaryPrompt).then(
      (result) => {
        if (!cancelled) {
          data = result;
          loading = false;
        }
      }
    );

    return () => {
      cancelled = true;
    };
  });

  function handleAudioClick(region: string | undefined) {
    // TODO: Implement audio playback for pronunciation
    console.log('Play audio for', region);
  }
</script>

<div class="flex flex-1 flex-col space-y-4">
  {#if !data || loading}
    <ContentEmpty />
  {:else}
    <!-- Word header -->
    <div class="flex items-baseline gap-3">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        {data.word}
        {#if !data.pronunciations.length}
          <button
            type="button"
            class="hover:text-primary-600 dark:hover:text-primary-400 ml-0.5 inline-flex items-center justify-center rounded-full p-0.5 text-gray-500 transition-colors dark:text-gray-400"
            onclick={() => handleAudioClick(data?.word)}
            aria-label="play">
            <LocalIcon icon="tabler:volume" class="h-3.5 w-3.5" />
          </button>
        {/if}
      </h2>
    </div>

    <!-- Pronunciations -->
    <div class="flex flex-wrap gap-2">
      {#each data.pronunciations as pronunciation (pronunciation)}
        <div
          class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-200">
          {#if pronunciation.region}
            <span>
              {REGION_OPTIONS.find(
                (option) =>
                  option.value.toLocaleLowerCase() === pronunciation.region?.toLocaleLowerCase()
              )?.label || pronunciation.region}
            </span>
          {/if}
          <span>{pronunciation.phonetic}</span>
          <button
            type="button"
            class="hover:text-primary-600 dark:hover:text-primary-400 ml-0.5 inline-flex items-center justify-center rounded-full p-0.5 text-gray-500 transition-colors dark:text-gray-400"
            onclick={() => handleAudioClick(pronunciation.region)}
            aria-label="play">
            <LocalIcon icon="tabler:volume" class="h-3.5 w-3.5" />
          </button>
        </div>
      {/each}
    </div>

    <!-- Definitions -->
    <div class="grid grid-cols-[auto_1fr] gap-2 text-sm">
      {#each data.definitions as definition (definition.pos)}
        <span class="font-medium text-nowrap text-gray-500 dark:text-gray-400">
          {definition.pos}
        </span>
        <div class="flex flex-1 flex-wrap gap-1">
          {#each definition.meanings as meaning, meaningIdx (meaningIdx)}
            <p class="text-gray-800 dark:text-gray-200">{meaning}</p>
          {/each}
        </div>
      {/each}
    </div>

    <!-- Exam labels -->
    {#if data.examLabels.length > 0}
      <div class="flex flex-wrap items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
        {#each data.examLabels as label, index (index)}
          <span>{label}</span>
          {#if index < data.examLabels.length - 1}
            <span class="text-gray-300 dark:text-gray-600">/</span>
          {/if}
        {/each}
      </div>
    {/if}

    <!-- Word forms -->
    {#if data.wordForms.length > 0}
      <div class="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {#each data.wordForms as form (form.label)}
          <div class="flex items-center gap-2">
            <span class="text-gray-400 dark:text-gray-500">{form.label}</span>
            <!-- TODO: Link to lookup this word form -->
            <button
              type="button"
              class="text-blue-600 hover:underline dark:text-blue-400"
              onclick={() => {
                data = null;
                selectedText = form.value;
              }}>
              {form.value}
            </button>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>
