<script module lang="ts">
  interface Props {
    toolbarRef: HTMLDivElement | null;
    selectedText?: string;
  }

  type SectionKey = 'dictionary' | 'examples' | 'usage';

  const sections: { key: SectionKey; label: string }[] = [
    { key: 'dictionary', label: i18n('dictionary', { defaultValue: 'Dictonary' }) },
    { key: 'examples', label: i18n('examples', { defaultValue: 'Examples' }) },
    { key: 'usage', label: i18n('usage', { defaultValue: 'Usage' }) }
  ];

  const activeClass = 'text-primary-600 bg-slate-100 font-semibold dark:bg-slate-600';
  const defaultClass =
    'text-slate-600 hover:bg-slate-50 dark:text-slate-100 hover:dark:bg-slate-700';
</script>

<script lang="ts">
  import { Button } from 'flowbite-svelte';
  import { SearchOutline } from 'flowbite-svelte-icons';
  import { twMerge } from 'tailwind-merge';

  import FloatingLabelInput from '@/components/flowbite-svelte/FloatingLabelInput.svelte';
  import { ATTR_MANUAL_DRAGGING } from '@/components/flowbite-svelte/Popper.svelte';
  import TriggerModes from '@/components/InstantLookupTriggerModes.svelte';
  import LangDropdown from '@/components/LangDropdown.svelte';
  import LocalIcon from '@/components/LocalIcon.svelte';
  import Provider from '@/components/Provider.svelte';
  import config from '@/lib/config';
  import i18n from '@/lib/i18n';
  import { FEAT_INSTANT_LOOKUP } from '@/preset/feature';
  import { mockExamplesData, mockUsageData } from '@/preset/instant-lookup';

  import Dictonary from './ContentDictonary.svelte';
  import Examples from './ContentExamples.svelte';
  import Usage from './ContentUsage.svelte';
  import { isPopoverOpen, isPopoverPinned } from './state';

  let { toolbarRef, selectedText = '' }: Props = $props();
  let isInputFocused = $state(false);
  let activeSection = $state<SectionKey>('dictionary');
  let isDraggingHeader = $state(false);

  function handleHeaderMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;
    if (!$isPopoverOpen && !$isPopoverPinned) return;

    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, summary, [role="button"]')) {
      return;
    }

    const popover = (e.currentTarget as HTMLElement).closest(
      '[popover="manual"]'
    ) as HTMLElement | null;
    if (!popover) return;
    popover.setAttribute(ATTR_MANUAL_DRAGGING, '');

    isDraggingHeader = true;

    const startX = e.clientX;
    const startY = e.clientY;
    const rect = popover.getBoundingClientRect();

    const currentLeft = parseFloat(popover.style.left) || 0;
    const currentTop = parseFloat(popover.style.top) || 0;
    const offsetLeft = rect.left - currentLeft;
    const offsetTop = rect.top - currentTop;

    const toolbarStartLeft = toolbarRef ? parseFloat(toolbarRef.style.left) || 0 : 0;
    const toolbarStartTop = toolbarRef ? parseFloat(toolbarRef.style.top) || 0 : 0;

    function onMouseMove(ev: MouseEvent) {
      if (!popover) return;

      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      let newLeft = rect.left + dx;
      let newTop = rect.top + dy;

      newLeft = Math.max(0, Math.min(window.innerWidth - rect.width, newLeft));
      newTop = Math.max(0, Math.min(window.innerHeight - rect.height, newTop));

      popover.style.left = `${newLeft - offsetLeft}px`;
      popover.style.top = `${newTop - offsetTop}px`;

      if (toolbarRef) {
        const popoverMovedX = parseFloat(popover.style.left) - currentLeft;
        const popoverMovedY = parseFloat(popover.style.top) - currentTop;
        toolbarRef.style.left = `${toolbarStartLeft + popoverMovedX}px`;
        toolbarRef.style.top = `${toolbarStartTop + popoverMovedY}px`;
      }
    }

    function onMouseUp() {
      isDraggingHeader = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (!popover) return;
      popover.removeAttribute(ATTR_MANUAL_DRAGGING);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  const handleSearch = () => {
    console.log('handle search');
  };
</script>

<!-- TODO: Replace mock data with real API response based on selectedText -->
<div class="flex w-full flex-col rounded-xl bg-white">
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    role="region"
    aria-label="Popover header"
    class={twMerge(
      'group relative flex items-center justify-between gap-4 border-b border-gray-100 p-2 dark:border-gray-700',
      isDraggingHeader ? 'cursor-grabbing' : 'cursor-grab'
    )}
    onmousedown={handleHeaderMouseDown}>
    <div class="flex items-center gap-2">
      <FloatingLabelInput
        bind:isFocused={isInputFocused}
        size="small"
        type="text"
        bind:value={selectedText}
        class="w-full bg-white/80 dark:bg-slate-900/80"
        classes={{
          label: twMerge('w-full top-1 truncate', isInputFocused || selectedText ? 'hidden' : ''),
          input: 'border-gray-100 pt-0 dark:border-gray-700'
        }}>
        {i18n('please_input_the_word_to_lookup', {
          defaultValue: 'Please input the word to lookup'
        })}
      </FloatingLabelInput>
      <Button
        color="alternative"
        class="rounded-lg border-none p-1 text-sm shadow"
        onclick={handleSearch}>
        <SearchOutline class="size-5 shrink-0" />
      </Button>
    </div>

    <span
      class="absolute top-0 left-1/2 rounded-lg border-none p-1 text-sm opacity-0 transition-opacity group-hover:opacity-100">
      <LocalIcon icon="tabler:grip-horizontal" class="w-5" />
    </span>
    <div class="flex items-center gap-2">
      <Button
        color="alternative"
        class="rounded-lg border-none p-1 text-sm shadow"
        onclick={() => isPopoverPinned.set(!$isPopoverPinned)}>
        {#if $isPopoverPinned}
          <LocalIcon icon="tabler:pinned" class="w-5" />
        {:else}
          <LocalIcon icon="tabler:pin" class="w-5" />
        {/if}
      </Button>
      <Button
        color="alternative"
        class="rounded-lg border-none p-1 text-sm shadow"
        onclick={() => isPopoverOpen.set(false)}>
        <LocalIcon icon="tabler:x" class="w-5" />
      </Button>
    </div>
  </div>
  <div class="flex h-0 flex-1 px-2">
    <nav
      class="w-20 shrink-0 border-r border-gray-100 py-2 dark:border-gray-700"
      aria-label={sections[0].key}>
      {#each sections as section (section.key)}
        <button
          type="button"
          class={twMerge(
            'w-full rounded-l-full px-3 py-2 text-left text-xs transition-colors',
            activeSection === section.key ? activeClass : defaultClass
          )}
          onclick={() => (activeSection = section.key)}>
          {section.label}
        </button>
      {/each}
    </nav>

    <div class="flex flex-1 flex-col overflow-x-hidden overflow-y-auto p-4">
      {#if activeSection === 'dictionary'}
        <Dictonary bind:selectedText />
      {:else if activeSection === 'examples'}
        <Examples {selectedText} categories={mockExamplesData} />
      {:else if activeSection === 'usage'}
        <Usage {selectedText} data={mockUsageData} />
      {/if}
    </div>
  </div>
  <div
    class="flex items-center justify-between gap-4 border-t border-gray-100 p-2 dark:border-gray-700">
    <div class="flex flex-1 flex-nowrap gap-2">
      <Provider
        field={FEAT_INSTANT_LOOKUP}
        class="w-fit bg-white/80 px-2 py-1 shadow dark:bg-slate-900/80" />
      <LangDropdown
        langCodeType="target"
        bind:langCode={$config.instantLookup.selection.targetLangCode}
        fallbackLangCode={$config.targetLangCode}
        class="w-fit bg-white/80 px-2 py-1 shadow dark:bg-slate-900/80" />
    </div>
    <TriggerModes class="w-fit bg-white/80 px-2 py-1 shadow dark:bg-slate-900/80" />
  </div>
</div>
