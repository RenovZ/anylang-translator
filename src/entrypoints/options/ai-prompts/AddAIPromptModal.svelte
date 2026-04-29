<script lang="ts">
  import { Heading } from 'flowbite-svelte';

  import i18n from '@/lib/i18n';
  import type { AIPrompt } from '@/lib/types';
  import { examplePrompts } from '@/lib/preset';
  import ModalWrapper from '@/components/ModalWrapper.svelte';

  interface Prop {
    open: boolean;
    onSelect: (item: AIPrompt) => void;
  }

  let { open = $bindable(false), onSelect }: Prop = $props();

  function handleSelect(template: AIPrompt) {
    onSelect(structuredClone(template));
    open = false;
  }
</script>

<ModalWrapper bind:open size="md">
  <div class="flex flex-col gap-4">
    <div class="flex flex-col">
      <Heading tag="h5" class="font-medium">
        {i18n('choose_a_template', { defaultValue: 'Choose a Template' })}
      </Heading>
      <p class="text-sm text-slate-400">
        {i18n('add_ai_prompt_description', {
          defaultValue:
            'Select a template to quickly create a new AI prompt, or start from scratch.'
        })}
      </p>
    </div>

    {#each examplePrompts as prompt (prompt.name)}
      <button
        type="button"
        class="flex items-center gap-4 rounded-xl p-4 shadow transition hover:bg-slate-100 dark:hover:bg-slate-700"
        onclick={() => handleSelect(prompt)}>
        <div class="flex flex-col text-left">
          <span class="text-lg font-medium text-gray-900 dark:text-white">
            {prompt.name}
          </span>
          <p class="text-sm text-slate-400">
            {prompt.description}
          </p>
        </div>
      </button>
    {/each}
  </div>
</ModalWrapper>
