<script lang="ts">
  import LocalIcon from '@/components/LocalIcon.svelte';

  import type { DictionaryEntry } from './types';

  interface Props {
    data: DictionaryEntry;
  }

  const { data }: Props = $props();

  function handleAudioClick(region: string) {
    // TODO: Implement audio playback for pronunciation
    console.log('Play audio for', region);
  }
</script>

<div class="space-y-4">
  <!-- Word header -->
  <div class="flex items-baseline gap-3">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{data.word}</h2>
  </div>

  <!-- Pronunciations -->
  <div class="flex flex-wrap gap-2">
    {#each data.pronunciations as pronunciation (pronunciation.region)}
      <div
        class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-200">
        <span class="text-gray-500 dark:text-gray-400">{pronunciation.region}</span>
        <span>{pronunciation.phonetic}</span>
        <button
          type="button"
          class="hover:text-primary-600 dark:hover:text-primary-400 ml-0.5 inline-flex items-center justify-center rounded-full p-0.5 text-gray-500 transition-colors dark:text-gray-400"
          onclick={() => handleAudioClick(pronunciation.region)}
          aria-label="播放{pronunciation.region}音">
          <LocalIcon icon="tabler:volume" class="h-3.5 w-3.5" />
        </button>
      </div>
    {/each}
  </div>

  <!-- Definitions -->
  <div class="grid grid-cols-[1fr_auto] gap-2 text-sm">
    {#each data.definitions as definition (definition.pos)}
      <span class="font-medium text-gray-500 dark:text-gray-400">{definition.pos}</span>
      <div class="flex flex-col gap-1">
        {#each definition.meanings as meaning, meaningIdx (meaningIdx)}
          <p class="text-gray-800 dark:text-gray-200">{meaning}</p>
        {/each}
      </div>
    {/each}
  </div>

  <!-- Exam labels -->
  {#if data.examLabels.length > 0}
    <div class="grid grid-cols-[1fr_auto] gap-4 text-sm">
      <div class="flex flex-wrap items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
        {#each data.examLabels as label, index (index)}
          <span>{label}</span>
          {#if index < data.examLabels.length - 1}
            <span class="text-gray-300 dark:text-gray-600">/</span>
          {/if}
        {/each}
      </div>
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
            onclick={() => console.log('Lookup word form:', form.value)}>
            {form.value}
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>
