<script lang="ts">
  import { TabItem, Tabs } from 'flowbite-svelte';

  import type { DictionaryEntry } from './types';

  interface Props {
    data: DictionaryEntry;
  }

  const { data }: Props = $props();

  function handlePhraseClick(phrase: string) {
    // TODO: Lookup the phrase
    console.log('Lookup phrase:', phrase);
  }

  function handleWordClick(word: string) {
    // TODO: Lookup the word
    console.log('Lookup word:', word);
  }

  const tabItemClasses = { button: 'px-2 py-1 text-nowrap' };
</script>

<Tabs
  tabStyle="pill"
  class="w-full"
  classes={{ content: 'bg-transparent p-0 grid grid-cols-[1fr_auto] gap-4 text-sm' }}>
  <!-- 词典短语 -->
  <TabItem open title="词典短语" classes={tabItemClasses}>
    {#each data.phrases as phrase, index (index)}
      <span class="font-medium text-gray-400 dark:text-gray-500">{index + 1}</span>
      <div class="flex flex-col gap-1">
        <button
          type="button"
          class="text-left font-medium text-blue-600 hover:underline dark:text-blue-400"
          onclick={() => handlePhraseClick(phrase.phrase)}>
          {phrase.phrase}
        </button>
        <p class="text-left text-gray-600 dark:text-gray-300">{phrase.meaning}</p>
      </div>
    {/each}
  </TabItem>

  <!-- 同近义词 -->
  <TabItem title="同近义词" classes={tabItemClasses}>
    {#each data.synonyms as group (group.pos + group.meaning)}
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
              onclick={() => handleWordClick(word)}>
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
  <TabItem title="同根词" classes={tabItemClasses}>
    <span class="font-medium text-nowrap text-gray-700 dark:text-gray-200">词根:</span>
    <button
      type="button"
      class="text-left text-blue-600 hover:underline dark:text-blue-400"
      onclick={() => handleWordClick(data.word)}>
      {data.word}
    </button>
    {#each data.cognates as group (group.pos)}
      <span class="font-medium text-gray-400 italic dark:text-gray-500">{group.pos}</span>
      <div class="flex flex-wrap gap-1">
        {#each group.words as item (item.word)}
          <div class="flex items-baseline gap-2">
            <button
              type="button"
              class="text-blue-600 hover:underline dark:text-blue-400"
              onclick={() => handleWordClick(item.word)}>
              {item.word}
            </button>
            <span class="text-gray-600 dark:text-gray-300">{item.meaning}</span>
          </div>
        {/each}
      </div>
    {/each}
  </TabItem>

  <!-- 词源 -->
  <TabItem title="词源" classes={tabItemClasses}>
    {#each data.etymology as item, index (index)}
      <span class="text-gray-400 dark:text-gray-500">{index + 1}</span>
      <div class="flex flex-wrap gap-1">
        <span class="font-medium text-gray-800 dark:text-gray-200">
          {item.title}
        </span>
        <p class="text-gray-600 dark:text-gray-300">{item.content}</p>
      </div>
    {/each}
  </TabItem>
</Tabs>
