<script lang="ts">
  import { Button, Input, Label, Select, Textarea, Toggle } from 'flowbite-svelte';
  import { PlusOutline, TrashBinOutline } from 'flowbite-svelte-icons';
  import Icon from '@iconify/svelte';

  import config from '@/lib/config';
  import type { AIAction, OutputSchema } from '@/lib/types';
  import i18n from '@/lib/i18n';
  import Section from '../Section.svelte';
  import AddModal from './AddModal.svelte';

  let showModal = $state(false);
  let selectedAIAction = $state<AIAction | null>(
    $config.customAIActions.length ? $config.customAIActions[0] : null
  );

  const isSelected = (action: AIAction) =>
    selectedAIAction && selectedAIAction.name === action.name;

  const handleAdd = (item: AIAction) => {
    const newAction: AIAction = { ...item, preset: false };
    const size = $config.customAIActions.filter((a) => a.name === newAction.name).length;
    if (size > 0) {
      newAction.name = `${newAction.name} ${size}`;
    }
    $config.customAIActions = [...$config.customAIActions, newAction];
    selectedAIAction = $config.customAIActions[$config.customAIActions.length - 1];
  };

  const handleDelete = (item: AIAction) => {
    $config.customAIActions = $config.customAIActions.filter((a) => a.name !== item.name);
    selectedAIAction = $config.customAIActions.length ? $config.customAIActions[0] : null;
  };

  const handleAddSchemaField = () => {
    if (!selectedAIAction) return;
    const newField: OutputSchema = {
      name: '',
      type: 'text',
      description: '',
      enableSpeaking: false
    };
    selectedAIAction.outputSchema = [...selectedAIAction.outputSchema, newField];
  };

  const handleDeleteSchemaField = (index: number) => {
    if (!selectedAIAction) return;
    selectedAIAction.outputSchema = selectedAIAction.outputSchema.filter((_, i) => i !== index);
  };
</script>

<Section
  id="custom-ai-actions"
  title={i18n('custom_ai_actions', { defaultValue: 'Custom AI Actions' })}
  description={i18n('custom_ai_actions_description', {
    defaultValue: 'Customize AI Actions, when selected text, the actions shown in the toolbar'
  })}>
  <div class="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
    <!-- Left: AI Action List -->
    <div class="space-y-3">
      {#each $config.customAIActions as action (action.name)}
        <button
          type="button"
          class="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition"
          class:bg-slate-100={isSelected(action)}
          class:dark:bg-slate-700={isSelected(action)}
          class:hover:bg-slate-50={!isSelected(action)}
          class:dark:hover:bg-slate-800={!isSelected(action)}
          onclick={() => (selectedAIAction = action)}>
          <Icon icon={action.icon} class="h-6 w-6" />
          <div class="text-sm font-medium">{action.name}</div>
        </button>
      {/each}

      <Button
        color="alternative"
        class="mt-2 w-full rounded-xl dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        onclick={() => (showModal = true)}>
        <PlusOutline class="me-2 h-4 w-4" />
        {i18n('add_ai_action', { defaultValue: 'Add AI Action' })}
      </Button>
    </div>

    <!-- Right: AI Action Configuration -->
    <div class="rounded-xl bg-gray-50 p-4 shadow-inner dark:bg-gray-700">
      {#if selectedAIAction}
        <div class="space-y-4">
          <!-- Name -->
          <div class="space-y-2">
            <Label class="block text-sm font-medium">
              {i18n('name', { defaultValue: 'Name' })}
            </Label>
            <Input
              disabled={selectedAIAction.preset}
              type="text"
              bind:value={selectedAIAction.name} />
          </div>

          <!-- Icon -->
          <div class="space-y-2">
            <Label class="block text-sm font-medium">
              {i18n('icon', { defaultValue: 'Icon' })}
            </Label>
            <Input type="text" bind:value={selectedAIAction.icon} />
          </div>

          <!-- Provider 这里留给我完成 -->

          <!-- UsedInTheseSites 这里留给我完成 -->

          <!-- System Prompt -->
          <div class="space-y-2">
            <Label class="block text-sm font-medium">
              {i18n('system_prompt', { defaultValue: 'System Prompt' })}
            </Label>
            <Textarea bind:value={selectedAIAction.systemPrompt} class="w-full" rows={8} />
          </div>

          <!-- Prompt -->
          <div class="space-y-2">
            <Label class="block text-sm font-medium">
              {i18n('prompt', { defaultValue: 'Prompt' })}
            </Label>
            <Textarea bind:value={selectedAIAction.prompt} class="w-full" rows={6} />
          </div>

          <!-- Output Schema -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label class="block text-sm font-medium">
                {i18n('output_schema', { defaultValue: 'Output Schema' })}
              </Label>
              <Button size="xs" color="alternative" onclick={handleAddSchemaField}>
                {i18n('add_field', { defaultValue: 'Add field' })}
              </Button>
            </div>
            <div class="space-y-2">
              {#each selectedAIAction.outputSchema as field, index (index)}
                <div class="grid grid-cols-[1fr_120px_1fr_auto_auto] items-center gap-2">
                  <Input
                    type="text"
                    placeholder={i18n('field_name', { defaultValue: 'Name' })}
                    bind:value={field.name} />
                  <Select bind:value={field.type}>
                    <option value="text">text</option>
                    <option value="number">number</option>
                  </Select>
                  <Input
                    type="text"
                    placeholder={i18n('field_description', { defaultValue: 'Description' })}
                    bind:value={field.description} />
                  <Toggle size="small" bind:checked={field.enableSpeaking}>
                    {i18n('enable_speaking', { defaultValue: 'Speak' })}
                  </Toggle>
                  <Button
                    size="xs"
                    color="alternative"
                    class="px-2"
                    onclick={() => handleDeleteSchemaField(index)}>
                    <TrashBinOutline class="h-4 w-4" />
                  </Button>
                </div>
              {/each}
            </div>
          </div>

          <!-- Delete Button -->
          {#if !selectedAIAction.preset}
            <div class="flex justify-end pt-4">
              <Button color="red" onclick={() => handleDelete(selectedAIAction!)}>
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
