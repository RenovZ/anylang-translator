<script lang="ts">
  import { Button, Heading, Popover } from 'flowbite-svelte';
  import { twMerge } from 'tailwind-merge';

  import i18n from '@/lib/i18n';

  interface Props {
    title?: string;
    description: string;
    classes?: { class?: string; content?: string };
    trigger?: 'click' | 'hover';
    placement?: 'top' | 'bottom' | 'left' | 'right';
    handleConfirm: () => void;
    handleCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    showPopover?: boolean;
  }

  let {
    title,
    description,
    classes = {},
    trigger,
    placement = 'top',
    handleConfirm,
    handleCancel = () => (showPopover = false),
    confirmText = i18n('yes', { defaultValue: "Yes, I'm sure" }),
    cancelText = i18n('no', { defaultValue: 'No' }),
    showPopover = $bindable(false)
  }: Props = $props();
</script>

<Popover
  bind:isOpen={showPopover}
  class={twMerge('max-w-80 rounded-xl', classes?.class)}
  classes={{ content: twMerge('p-0', classes?.content) }}
  {trigger}
  {placement}>
  <div class="flex flex-col gap-2 p-2">
    <Heading tag="h5" class="text-base font-medium">
      {title}
    </Heading>
    <p>
      {description}
    </p>
  </div>
  <div class="flex place-content-end gap-2 rounded-b-xl bg-gray-100 p-2 dark:bg-gray-700">
    <Button class="border-none shadow" color="light" size="xs" onclick={handleCancel}>
      {cancelText}
    </Button>
    <Button class="border-none shadow" color="red" size="xs" onclick={handleConfirm}>
      {confirmText}
    </Button>
  </div>
</Popover>
