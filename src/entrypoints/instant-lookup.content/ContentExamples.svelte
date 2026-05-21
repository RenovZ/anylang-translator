<script lang="ts">
  import { TabItem, Tabs } from 'flowbite-svelte';

  import LocalIcon from '@/components/LocalIcon.svelte';

  import type { ExampleCategory } from './types';

  interface Props {
    categories: ExampleCategory[];
  }

  const { categories }: Props = $props();

  function handleAudioClick(original: string) {
    // TODO: Implement audio playback for example sentence
    console.log('Play audio for:', original);
  }

  function splitByKeyword(text: string, keyword: string) {
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.split(regex);
  }

  // TODO: Pass the actual keyword dynamically instead of hardcoding 'select'
  const keyword = 'select';
</script>

<Tabs
  tabStyle="pill"
  class="w-full"
  classes={{ content: 'bg-transparent p-0 grid grid-cols-[1fr_auto] gap-4 text-sm' }}>
  {#each categories as category, index (index)}
    <TabItem open={index === 0} title={category.name} classes={{ button: 'px-2 py-1 text-nowrap' }}>
      {#each category.examples as example, exampleIndex (exampleIndex)}
        <span class="text-gray-400 dark:text-gray-500">
          {exampleIndex + 1}
        </span>
        <div class="flex flex-col gap-1">
          <p class="text-sm text-gray-800 dark:text-gray-200">
            {#each splitByKeyword(example.original, keyword) as part, partIdx (partIdx)}
              {#if part.toLowerCase() === keyword.toLowerCase()}
                <span class="text-primary-500 font-medium">{part}</span>
              {:else}
                {part}
              {/if}
            {/each}
            <button
              type="button"
              class="hover:text-primary-600 dark:hover:text-primary-400 ml-1 inline-flex items-center justify-center rounded-full p-0.5 text-gray-400 transition-colors dark:text-gray-500"
              onclick={() => handleAudioClick(example.original)}
              aria-label="播放例句音频">
              <LocalIcon icon="tabler:volume" class="h-3.5 w-3.5" />
            </button>
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {example.translation}
          </p>
          {#if example.source}
            <p class="text-xs text-gray-400 dark:text-gray-500">
              {example.source}
            </p>
          {/if}
        </div>
      {/each}
    </TabItem>
  {/each}
</Tabs>
