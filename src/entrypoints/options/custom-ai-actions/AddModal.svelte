<script lang="ts">
  import { Heading, Modal } from 'flowbite-svelte';
  import Icon from '@iconify/svelte';

  import i18n from '@/lib/i18n';
  import type { AIAction } from '@/lib/types';
  import {
    exampleDictionaryAIAction,
    exampleImprovWriting,
    exampleBlankAIAction
  } from '@/lib/preset';

  let {
    open = $bindable(false),
    onSelect
  }: {
    open: boolean;
    onSelect: (item: AIAction) => void;
  } = $props();

  const templates: AIAction[] = [
    exampleDictionaryAIAction,
    exampleImprovWriting,
    exampleBlankAIAction
  ];

  function handleSelect(template: AIAction) {
    onSelect(structuredClone(template));
    open = false;
  }
</script>

<Modal bind:open size="xs" outsideclose={false} classes={{ body: 'border-none' }}>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col">
      <Heading tag="h5" class="font-medium">
        {i18n('choose_a_template', { defaultValue: 'Choose a Template' })}
      </Heading>
      <p class="text-sm text-slate-400">
        {i18n('add_ai_action_description', {
          defaultValue:
            'Select a template to quickly create a new AI action, or start from scratch.'
        })}
      </p>
    </div>

    {#each templates as template (template.name)}
      <button
        type="button"
        class="flex items-center gap-4 rounded-xl border border-gray-200 p-4 transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
        onclick={() => handleSelect(template)}>
        <Icon icon={template.icon} class="h-6 w-6" />
        <div class="flex flex-col text-left">
          <span class="text-lg font-medium text-gray-900 dark:text-white">
            {template.name}
          </span>
          <p class="text-sm text-slate-400">
            {template.description}
          </p>
        </div>
      </button>
    {/each}
  </div>
</Modal>
