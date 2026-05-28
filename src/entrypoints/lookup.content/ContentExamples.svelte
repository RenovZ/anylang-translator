<script lang="ts">
  import { TabItem, Tabs } from 'flowbite-svelte';

  import config from '@/lib/config';
  import { getInstantLookupExamplesPrompt } from '@/lib/prompt';
  import type { ExamplesData } from '@/types/instant-lookup';

  import { tabClasses, tabItemClasses } from './Content.svelte';
  import { getData } from './ContentApi.svelte';
  import ContentAudioButton from './ContentAudioButton.svelte';
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

  function splitByKeyword(text: string, keyword: string) {
    const regex = new RegExp(`(${keyword})`, 'gi');
    const result = text.split(regex);
    return result;
  }
</script>

<Tabs tabStyle="pill" class="w-full" classes={tabClasses}>
  {#if data}
    {#each data as category, index (index)}
      <TabItem open={index === 0} title={category.name} classes={tabItemClasses}>
        {#each category.examples as example, exampleIndex (exampleIndex)}
          <span class="text-gray-500 dark:text-gray-400">
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
              <ContentAudioButton
                text={example.original}
                langCode={$detectedLangCodeOrUnd}
                ariaLabel="play example original text" />
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {example.translation}
              <ContentAudioButton
                text={example.translation}
                langCode={$config.instantLookup.selection.targetLangCode}
                ariaLabel="play example translation text" />
            </p>
            {#if example.source}
              <p class="text-xs text-gray-500 dark:text-gray-400">
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
