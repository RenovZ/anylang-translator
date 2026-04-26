<script lang="ts">
  import { Button, Input, Label, Modal, Select, Textarea, Toggle } from 'flowbite-svelte';

  import type { OutputSchema } from '@/lib/types';
  import i18n from '@/lib/i18n';

  let {
    open = $bindable(false),
    field,
    mode = 'edit',
    onSave
  }: {
    open: boolean;
    field: OutputSchema;
    mode?: 'add' | 'edit';
    onSave: (field: OutputSchema) => void;
  } = $props();

  let localField = $state<OutputSchema>({
    name: '',
    type: 'text',
    description: '',
    enableSpeaking: false
  });

  $effect(() => {
    if (open) {
      localField = { ...field };
    }
  });

  function handleSave() {
    onSave({ ...localField });
    open = false;
  }

  const variables = [
    '{{selection}}',
    '{{paragraphs}}',
    '{{targetLanguage}}',
    '{{webTitle}}',
    '{{webContent}}'
  ];

  function insertVariable(variable: string) {
    localField.description = (localField.description ?? '') + variable;
  }
</script>

<Modal bind:open size="xs" outsideclose={false} autoclose={false}>
  <div class="flex flex-col gap-4">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white">
      {#if mode === 'add'}
        {i18n('add_output_field', { defaultValue: 'Add Output Field' })}
      {:else}
        {i18n('edit_output_field', { defaultValue: 'Edit Output Field' })}
      {/if}
    </h3>

    <div class="space-y-2">
      <Label class="text-sm font-medium">
        {i18n('field_name', { defaultValue: 'Field Name' })}
      </Label>
      <Input
        type="text"
        bind:value={localField.name}
        class="border-none bg-gray-50 shadow dark:bg-gray-600" />
    </div>

    <div class="space-y-2">
      <Label class="text-sm font-medium">
        {i18n('field_type', { defaultValue: 'Field Type' })}
      </Label>
      <Select
        bind:value={localField.type}
        classes={{ select: 'border-none shadow bg-gray-50 dark:bg-gray-600' }}>
        <option value="text">Text</option>
        <option value="number">Number</option>
      </Select>
    </div>

    <div class="space-y-2">
      <Label class="text-sm font-medium">
        {i18n('description', { defaultValue: 'Description' })}
      </Label>
      <Textarea
        bind:value={localField.description}
        rows={4}
        class="w-full border-none bg-gray-50 shadow placeholder:text-slate-400 dark:bg-gray-600"
        placeholder={i18n('description_placeholder', {
          defaultValue: 'Describe what this field should contain...'
        })} />
      <div class="flex flex-wrap gap-2">
        {#each variables as variable (variable)}
          <Button
            color="alternative"
            class="rounded-md border-none px-2 py-1 text-xs shadow"
            onclick={() => insertVariable(variable)}>
            {variable}
          </Button>
        {/each}
      </div>
    </div>

    <div class="flex items-center gap-2">
      <Toggle size="small" bind:checked={localField.enableSpeaking} />
      <span class="text-sm text-gray-700 dark:text-gray-300">
        {i18n('enable_speaking', { defaultValue: 'Enable speaking' })}
      </span>
    </div>

    <div class="flex justify-end">
      <Button color="green" onclick={handleSave}>
        {#if mode === 'add'}
          {i18n('add', { defaultValue: 'Add' })}
        {:else}
          {i18n('save', { defaultValue: 'Save' })}
        {/if}
      </Button>
    </div>
  </div>
</Modal>
