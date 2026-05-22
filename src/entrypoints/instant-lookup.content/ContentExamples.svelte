<script lang="ts">
  import { TabItem, Tabs } from 'flowbite-svelte';

  import LocalIcon from '@/components/LocalIcon.svelte';
  import { getInstantLookupExamplesPrompt } from '@/lib/prompt';
  import type { ExamplesData } from '@/types/instant-lookup';

  import { tabClasses, tabItemClasses } from './Content.svelte';
  import { getData } from './ContentApi.svelte';
  import ContentEmpty from './ContentEmpty.svelte';
  import { detectedLangCodeOrUnd } from './state';

  interface Props {
    selectedText: string;
  }

  let { selectedText = $bindable('') }: Props = $props();

  let data: ExamplesData | null = $state(null);
  $effect(() => {
    const text = selectedText.trim();
    if (!text) {
      data = null;
      return;
    }

    let cancelled = false;
    getData<ExamplesData>(text, $detectedLangCodeOrUnd, getInstantLookupExamplesPrompt).then(
      (result) => {
        if (!cancelled) {
          data = result;
        }
      }
    );

    return () => {
      cancelled = true;
    };
  });

  function handleAudioClick(original: string) {
    // TODO: Implement audio playback for example sentence
    console.log('Play audio for:', original);
  }

  function splitByKeyword(text: string, keyword: string) {
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.split(regex);
  }
</script>

<Tabs tabStyle="pill" class="w-full" classes={tabClasses}>
  {#if data}
    {#each data as category, index (index)}
      <TabItem open={index === 0} title={category.name} classes={tabItemClasses}>
        {#each category.examples as example, exampleIndex (exampleIndex)}
          <span class="text-gray-400 dark:text-gray-500">
            {exampleIndex + 1}
          </span>
          <div class="flex flex-col gap-1">
            <p class="text-sm text-gray-800 dark:text-gray-200">
              {#each splitByKeyword(example.original, selectedText) as part, partIdx (partIdx)}
                {#if part.toLowerCase() === selectedText.toLowerCase()}
                  <span class="text-primary-500 font-medium">{part}</span>
                {:else}
                  {part}
                {/if}
              {/each}
              <button
                type="button"
                class="hover:text-primary-600 dark:hover:text-primary-400 ml-1 inline-flex items-center justify-center rounded-full p-0.5 text-gray-400 transition-colors dark:text-gray-500"
                onclick={() => handleAudioClick(example.original)}
                aria-label="play example audio">
                <LocalIcon icon="tabler:volume" class="h-3.5 w-3.5" />
              </button>
            </p>
            <p class="text-sm text-gray-400 dark:text-gray-500">
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
  {:else}
    <ContentEmpty />
  {/if}
</Tabs>
