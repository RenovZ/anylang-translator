<script lang="ts">
  import { Button, Input, Label, Modal, Select, Textarea, Toggle, Tooltip } from 'flowbite-svelte';

  import i18n from '@/lib/i18n';
  import ModalWrapper from '@/components/ModalWrapper.svelte';
  import type { OutputSchema } from '@/types/ai';

  import Variables from './Variables.svelte';

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
  let descriptionRef: HTMLTextAreaElement | undefined = $state(undefined);

  $effect(() => {
    if (open) {
      localField = { ...field };
    }
  });

  const handleSave = () => {
    onSave({ ...localField });
    open = false;
  };
</script>

<ModalWrapper bind:open size="xs">
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
        bind:elementRef={descriptionRef}
        bind:value={localField.description}
        rows={4}
        class="w-full border-none bg-gray-50 shadow placeholder:text-slate-400 dark:bg-gray-600"
        placeholder={i18n('description_placeholder', {
          defaultValue: 'Describe what this field should contain...'
        })} />
      <Variables bind:textareaRef={descriptionRef} />
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
</ModalWrapper>
