<script module lang="ts">
  export interface TranslateErrorProp extends Record<string, unknown> {
    nodes: ChildNode[];
    error: APICallError;
    options: Required<Pick<TranslateOptions, 'text' | 'mode'>> &
      Omit<TranslateOptions, 'text' | 'mode'>;
  }
</script>

<script lang="ts">
  import type { APICallError } from 'ai';
  import { Button, Heading, Popover, Tooltip } from 'flowbite-svelte';
  import { twMerge } from 'tailwind-merge';

  import LocalIcon from '@/components/LocalIcon.svelte';
  import cryptoPolyfill from '@/lib/crypto-polyfill';
  import i18n from '@/lib/i18n';
  import { translateNodes } from '@/lib/translate/core';
  import { NOTRANSLATE_CLASS } from '@/preset/dom';
  import type { TranslateOptions } from '@/types/translate';

  let { nodes, error, options }: TranslateErrorProp = $props();

  let showPopover = $state(false);

  const handleRetry = async () => {
    const walkId = cryptoPolyfill.getUUID();
    await translateNodes(nodes, walkId, options);
  };
</script>

<div
  class={twMerge(
    'inline-flex items-center justify-center gap-1 px-1.5 text-black dark:text-white',
    NOTRANSLATE_CLASS
  )}>
  <LocalIcon icon="tabler:alert-circle" class="size-4 text-red-500" />
  <Popover
    bind:isOpen={showPopover}
    class="max-w-64 space-y-4 rounded-xl bg-gray-50/50 backdrop-blur-xs dark:bg-gray-600/50"
    classes={{ content: 'p-0' }}
    trigger="hover">
    <div class="flex flex-col flex-wrap gap-2 p-2">
      <Heading tag="h5" class="text-base font-medium">
        {i18n('translate_failed', { defaultValue: 'Translate Failed' })}
      </Heading>
      <p class="text-sm break-all text-black dark:text-white">
        {error.statusCode ?? 500} -
        {error.message || i18n('something_went_wrong', { defaultValue: 'Something went wrong' })}
      </p>
    </div>

    <Button
      class="mx-auto flex w-fit gap-1 border-none px-2 py-1.5 shadow"
      color="secondary"
      size="xs"
      onclick={handleRetry}>
      <LocalIcon icon="tabler:reload" class="size-4" />
      {i18n('retry', { defaultValue: 'Retry' })}
    </Button>
  </Popover>
</div>
