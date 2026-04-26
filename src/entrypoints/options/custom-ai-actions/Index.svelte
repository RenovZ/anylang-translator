<script lang="ts">
  import { Badge, Button, Input, Label, Select, Textarea, Tooltip } from 'flowbite-svelte';
  import { PlusOutline, TrashBinOutline, PenOutline } from 'flowbite-svelte-icons';
  import Icon from '@iconify/svelte';

  import config from '@/lib/config';
  import type { AIAction, OutputSchema } from '@/lib/types';
  import i18n from '@/lib/i18n';
  import Section from '../Section.svelte';
  import AddAIActionModal from './AddAIActionModal.svelte';
  import EditFieldModal from './EditFieldModal.svelte';

  let showModal = $state(false);
  let showEditModal = $state(false);
  let editingField = $state<OutputSchema>({
    name: '',
    type: 'text',
    description: '',
    enableSpeaking: false
  });
  let editingIndex = $state<number>(-1);
  let dragIndex = $state<number>(-1);
  let dragOverIndex = $state<number>(-1);
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
    editingIndex = -1;
    editingField = { name: '', type: 'text', description: '', enableSpeaking: false };
    showEditModal = true;
  };

  const handleDeleteSchemaField = (index: number) => {
    if (!selectedAIAction) return;
    selectedAIAction.outputSchema = selectedAIAction.outputSchema.filter((_, i) => i !== index);
  };

  const handleDragStart = (index: number) => {
    dragIndex = index;
  };

  const handleDragOver = (e: MouseEvent, index: number) => {
    e.preventDefault();
    if (dragIndex >= 0 && dragIndex !== index) {
      dragOverIndex = index;
    }
  };

  const handleDrop = () => {
    if (!selectedAIAction || dragIndex < 0 || dragOverIndex < 0 || dragIndex === dragOverIndex) {
      dragIndex = -1;
      dragOverIndex = -1;
      return;
    }
    const schema = [...selectedAIAction.outputSchema];
    const [removed] = schema.splice(dragIndex, 1);
    schema.splice(dragOverIndex, 0, removed);
    selectedAIAction.outputSchema = schema;
    dragIndex = -1;
    dragOverIndex = -1;
  };

  const handleEditSchemaField = (index: number) => {
    if (!selectedAIAction) return;
    editingIndex = index;
    editingField = { ...selectedAIAction.outputSchema[index] };
    showEditModal = true;
  };

  const handleSaveSchemaField = (field: OutputSchema) => {
    if (!selectedAIAction) return;
    if (editingIndex < 0) {
      selectedAIAction.outputSchema = [...selectedAIAction.outputSchema, field];
    } else {
      const newSchema = [...selectedAIAction.outputSchema];
      newSchema[editingIndex] = field;
      selectedAIAction.outputSchema = newSchema;
    }
    editingIndex = -1;
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
    <div class="space-y-1">
      {#each $config.customAIActions as action (action.name)}
        <button
          type="button"
          class="flex w-full items-center gap-4 rounded-xl px-4 py-2 text-left transition"
          class:bg-slate-100={isSelected(action)}
          class:dark:bg-slate-600={isSelected(action)}
          class:hover:bg-slate-50={!isSelected(action)}
          class:dark:hover:bg-slate-700={!isSelected(action)}
          onclick={() => (selectedAIAction = action)}>
          <Icon icon={action.icon} class="h-6 w-6" />
          <div class="text-sm font-medium">{action.name}</div>
        </button>
      {/each}

      <Button
        color="alternative"
        class="mt-5 w-full rounded-xl border-none text-slate-600 shadow hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-600"
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
              bind:value={selectedAIAction.name}
              class="border-none bg-gray-50 shadow dark:bg-gray-600" />
          </div>

          <!-- Icon -->
          <div class="space-y-2">
            <Label class="block text-sm font-medium">
              {i18n('icon', { defaultValue: 'Icon' })}
            </Label>
            <Input
              type="text"
              bind:value={selectedAIAction.icon}
              class="border-none bg-gray-50 shadow dark:bg-gray-600" />
          </div>

          <!-- Provider 这里留给我完成 -->

          <!-- UsedInTheseSites 这里留给我完成 -->

          <!-- System Prompt -->
          <div class="space-y-2">
            <Label class="block text-sm font-medium">
              {i18n('system_prompt', { defaultValue: 'System Prompt' })}
            </Label>
            <Textarea
              bind:value={selectedAIAction.systemPrompt}
              rows={8}
              class="w-full border-none bg-gray-50 shadow dark:bg-gray-600" />
          </div>

          <!-- Prompt -->
          <div class="space-y-2">
            <Label class="block text-sm font-medium">
              {i18n('prompt', { defaultValue: 'Prompt' })}
            </Label>
            <Textarea
              bind:value={selectedAIAction.prompt}
              rows={6}
              class="w-full border-none bg-gray-50 shadow dark:bg-gray-600" />
          </div>

          <!-- Output Schema -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label class="block text-sm font-medium">
                {i18n('output_schema', { defaultValue: 'Output Schema' })}
              </Label>
              <Button
                size="xs"
                color="alternative"
                onclick={handleAddSchemaField}
                class="border-none shadow">
                <PlusOutline class="me-1 h-3 w-3" />
                {i18n('add_field', { defaultValue: 'Add Field' })}
              </Button>
            </div>
            <div class="space-y-2" role="list">
              {#each selectedAIAction.outputSchema as field, index (index)}
                <div
                  class="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 shadow transition"
                  class:opacity-50={dragIndex === index}
                  class:border-2={dragOverIndex === index}
                  class:border-blue-400={dragOverIndex === index}
                  class:cursor-grabbing={dragIndex === index}
                  role="listitem"
                  draggable={true}
                  ondragstart={() => handleDragStart(index)}
                  ondragover={(e) => handleDragOver(e, index)}
                  ondrop={handleDrop}>
                  <div class="flex items-center gap-1">
                    <Icon
                      icon="tabler:grip-vertical"
                      class="h-4 w-4 cursor-grab text-gray-400 select-none dark:text-gray-500"
                      onmousedown={() => handleDragStart(index)} />
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      {field.name}
                    </span>
                    <Badge color="gray" rounded>
                      {field.type}
                    </Badge>
                    <span class="line-clamp-1 flex-1 text-sm text-gray-500 dark:text-gray-400">
                      {field.description ?? ''}
                      {#if field.description}
                        <Tooltip class="max-w-80">{field.description}</Tooltip>
                      {/if}
                    </span>
                  </div>
                  <div class="flex items-center gap-1">
                    <Button
                      color="alternative"
                      size="xs"
                      class="border-none p-1 shadow"
                      onclick={() => handleEditSchemaField(index)}>
                      <PenOutline class="h-4 w-4" />
                    </Button>
                    <Button
                      color="alternative"
                      size="xs"
                      class="border-none p-1 shadow"
                      onclick={() => handleDeleteSchemaField(index)}>
                      <TrashBinOutline class="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <!-- Delete Button -->
          {#if !selectedAIAction.preset}
            <div class="flex justify-end pt-4">
              <Button
                color="red"
                onclick={() => handleDelete(selectedAIAction!)}
                class="border-none shadow">
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

<AddAIActionModal bind:open={showModal} onSelect={handleAdd} />
<EditFieldModal
  bind:open={showEditModal}
  field={editingField}
  mode={editingIndex < 0 ? 'add' : 'edit'}
  onSave={handleSaveSchemaField} />
