<script lang="ts">
  import { TabItem, Tabs } from 'flowbite-svelte';

  import { getInstantLookupUsagePrompt } from '@/lib/prompt';
  import { DICTIONARY_USAGE_TAB_MAP } from '@/preset/instant-lookup';
  import type { UsageData } from '@/types/instant-lookup';

  import { tabClasses, tabItemClasses } from './Content.svelte';
  import { getData } from './ContentApi.svelte';
  import ContentEmpty from './ContentEmpty.svelte';
  import { detectedLangCodeOrUnd } from './state';

  interface Props {
    selectedText: string;
  }

  let { selectedText = $bindable('') }: Props = $props();

  let data: UsageData | null = $state(null);
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
    getData<UsageData>(text, $detectedLangCodeOrUnd, getInstantLookupUsagePrompt).then((result) => {
      if (!cancelled) {
        data = result;
        loading = false;
      }
    });

    return () => {
      cancelled = true;
    };
  });

  function handleClick(phrase: string) {
    selectedText = phrase;
  }
</script>

<Tabs tabStyle="pill" class="w-full" classes={tabClasses}>
  {#if !data || loading}
    <ContentEmpty />
  {:else}
    <!-- 词典短语 -->
    <TabItem open title={DICTIONARY_USAGE_TAB_MAP.phrases} classes={tabItemClasses}>
      {#each data.phrases ?? [] as phrase, index (index)}
        <span class="font-medium text-gray-400 dark:text-gray-500">{index + 1}</span>
        <div class="flex flex-col gap-1">
          <button
            type="button"
            class="w-fit text-left font-medium text-blue-600 hover:underline dark:text-blue-400"
            onclick={() => handleClick(phrase.phrase)}>
            {phrase.phrase}
          </button>
          <p class="text-left text-gray-600 dark:text-gray-300">{phrase.meaning}</p>
        </div>
      {/each}
    </TabItem>

    <!-- 同近义词 -->
    <TabItem title={DICTIONARY_USAGE_TAB_MAP.synonyms} classes={tabItemClasses}>
      {#each data.synonyms ?? [] as group (group.pos + group.meaning)}
        <span class="font-medium text-gray-400 italic dark:text-gray-500">
          {group.pos}
        </span>
        <div class="flex flex-col gap-1">
          <span class="text-gray-700 dark:text-gray-300">{group.meaning}</span>
          <div class="flex flex-wrap gap-0.5">
            {#each group.words as word (word)}
              <button
                type="button"
                class="text-blue-600 hover:underline dark:text-blue-400"
                onclick={() => handleClick(word)}>
                {word}
              </button>
              {#if word !== group.words[group.words.length - 1]}
                <span class="text-gray-400 dark:text-gray-500">/</span>
              {/if}
            {/each}
          </div>
        </div>
      {/each}
    </TabItem>

    <!-- 同根词 -->
    <TabItem title={DICTIONARY_USAGE_TAB_MAP.cognates} classes={tabItemClasses}>
      <span class="font-medium text-nowrap text-gray-700 dark:text-gray-200">词根:</span>
      <button
        type="button"
        class="text-left text-blue-600 hover:underline dark:text-blue-400"
        onclick={() => handleClick(data!.word)}>
        {data.word}
      </button>
      {#each data.cognates ?? [] as group (group.pos)}
        <span class="font-medium text-gray-400 italic dark:text-gray-500">{group.pos}</span>
        <div class="flex flex-wrap gap-1">
          {#each group.words as item (item.word)}
            <div class="flex items-baseline gap-2">
              <button
                type="button"
                class="text-blue-600 hover:underline dark:text-blue-400"
                onclick={() => handleClick(item.word)}>
                {item.word}
              </button>
              <span class="text-gray-600 dark:text-gray-300">{item.meaning}</span>
            </div>
          {/each}
        </div>
      {/each}
    </TabItem>

    <!-- 词源 -->
    <TabItem title={DICTIONARY_USAGE_TAB_MAP.etymology} classes={tabItemClasses}>
      {#each data.etymology ?? [] as item, index (index)}
        <span class="text-gray-400 dark:text-gray-500">{index + 1}</span>
        <div class="flex flex-wrap gap-1">
          <span class="font-medium text-gray-800 dark:text-gray-200">
            {item.title}
          </span>
          <p class="text-gray-600 dark:text-gray-300">{item.content}</p>
        </div>
      {/each}
    </TabItem>
  {/if}
</Tabs>
