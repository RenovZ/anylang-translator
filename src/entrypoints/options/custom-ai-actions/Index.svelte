<script lang="ts">
  import {
    A,
    Accordion,
    Button,
    Input,
    Label,
    Select,
    Textarea,
    Toggle,
    Tooltip
  } from 'flowbite-svelte';
  import { PlusOutline } from 'flowbite-svelte-icons';

  import config from '@/lib/config';
  import { type AIAction } from '@/lib/types';
  import i18n from '@/lib/i18n';
  import Section from '../Section.svelte';
  import AddModal from './AddModal.svelte';

  let showModal = $state(false);
  let selectedAIAction = $state<AIAction | null>(
    $config.customAIActions.length ? $config.customAIActions[0] : null
  );

  const handleAdd = (item: AIAction) => {};

  const handleDelete = (item: AIAction) => {};
</script>

<Section
  id="custom-ai-actions"
  title={i18n('custom_ai_actions', { defaultValue: 'Custom AI Actions' })}
  description={i18n('custom_ai_actions_description', {
    defaultValue: 'Add your own structured AI actions for selected text'
  })}>
  <div class="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
    <!-- Left: Provider List -->
    <div class="space-y-3">
      <Button
        color="alternative"
        class="mt-2 w-full rounded-xl dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        onclick={() => (showModal = true)}>
        <PlusOutline class="me-2 h-4 w-4" />
        {i18n('add_ai_action', { defaultValue: 'Add AI Action' })}
      </Button>
    </div>

    <!-- Right: Provider Configuration -->
    <div class="rounded-xl bg-gray-50 p-4 shadow-inner dark:bg-gray-700">
      {#if selectedAIAction}
        <div class="space-y-4">
          <!-- Name -->
          <div class="space-y-2">
            <Label class="block text-sm font-medium">
              {i18n('provider_name', { defaultValue: 'Name' })}
            </Label>
            <Input
              disabled={selectedAIAction.preset}
              type="text"
              bind:value={selectedAIAction.name} />
          </div>

          <!-- Icon -->

          <!-- Provider 这里留给我完成 -->

          <!-- System Prompt -->

          <!-- Prompt -->

          <!-- Output Schema -->

          <!-- Delete Button -->
          {#if !selectedAIAction.preset}
            <div class="flex justify-end pt-4">
              <Button color="red" onclick={() => handleDelete(selectedAIAction)}>
                {i18n('delete', { defaultValue: 'Delete' })}
              </Button>
            </div>
          {/if}
        </div>
      {:else}
        <div class="flex h-64 items-center justify-center text-gray-400">
          <p>
            {i18n('select_ai_action_to_configure', {
              defaultValue: 'Select an AI action to configure'
            })}
          </p>
        </div>
      {/if}
    </div>
  </div>
</Section>

<AddModal bind:open={showModal} onSelect={handleAdd} />
