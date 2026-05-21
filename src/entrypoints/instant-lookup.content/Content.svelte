<script lang="ts">
  import { Button, Heading } from 'flowbite-svelte';
  import { twMerge } from 'tailwind-merge';

  import LangDropdown from '@/components/LangDropdown.svelte';
  import LocalIcon from '@/components/LocalIcon.svelte';
  import Provider from '@/components/Provider.svelte';
  import i18n from '@/lib/i18n';
  import logger from '@/lib/logger';
  import { FEAT_INSTANT_LOOKUP } from '@/preset/feature';

  import Dictonary from './ContentDictonary.svelte';
  import Examples from './ContentExamples.svelte';
  import Usage from './ContentUsage.svelte';
  import { mockDictionaryEntry } from './mock-data';
  import { isPopoverOpen, isPopoverPinned } from './state';

  interface Props {
    toolbarRef: HTMLDivElement | null;
  }

  let { toolbarRef }: Props = $props();

  type SectionKey = 'dictionary' | 'examples' | 'usage';

  const sections: { key: SectionKey; label: string }[] = [
    { key: 'dictionary', label: '词典释义' },
    { key: 'examples', label: '例句' },
    { key: 'usage', label: '用法' }
  ];

  let activeSection = $state<SectionKey>('dictionary');

  const activeClass = 'text-primary-600 bg-slate-100 font-semibold dark:bg-slate-600';
  const defaultClass =
    'text-slate-600 hover:bg-slate-50 dark:text-slate-100 hover:dark:bg-slate-700';

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

    isDraggingHeader = true;

    const startX = e.clientX;
    const startY = e.clientY;
    const rect = popover.getBoundingClientRect();

    const currentLeft = parseFloat(popover.style.left) || 0;
    const currentTop = parseFloat(popover.style.top) || 0;
    const offsetLeft = rect.left - currentLeft;
    const offsetTop = rect.top - currentTop;

    logger.debug({ currentLeft, currentTop, offsetLeft, offsetTop });

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
    }

    function onMouseUp() {
      isDraggingHeader = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }
</script>

<!-- TODO: Replace mock data with real API response based on selectedText -->
<div class="flex w-full flex-col rounded-xl bg-white">
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    role="region"
    aria-label="Popover header"
    class={twMerge(
      'group relative flex items-center justify-between border-b border-gray-100 p-2 dark:border-gray-700',
      isDraggingHeader ? 'cursor-grabbing' : 'cursor-grab'
    )}
    onmousedown={handleHeaderMouseDown}>
    <LangDropdown class="w-fit bg-white/80 px-2 py-1 shadow-xs dark:bg-slate-900/80" />
    <span
      class="absolute top-0 left-1/2 rounded-lg border-none p-1 text-sm opacity-0 shadow-xs transition-opacity group-hover:opacity-100">
      <LocalIcon icon="tabler:grip-horizontal" class="w-5" />
    </span>
    <div class="flex items-center gap-2">
      <Button
        color="alternative"
        class="rounded-lg border-none p-1 text-sm shadow-xs"
        onclick={() => isPopoverPinned.set(!$isPopoverPinned)}>
        {#if $isPopoverPinned}
          <LocalIcon icon="tabler:pinned" class="w-5" />
        {:else}
          <LocalIcon icon="tabler:pin" class="w-5" />
        {/if}
      </Button>
      <Button
        color="alternative"
        class="rounded-lg border-none p-1 text-sm shadow-xs"
        onclick={() => isPopoverOpen.set(false)}>
        <LocalIcon icon="tabler:x" class="w-5" />
      </Button>
    </div>
  </div>
  <div class="flex h-0 flex-1 px-2">
    <nav
      class="w-20 shrink-0 border-r border-gray-100 py-2 dark:border-gray-700"
      aria-label="词典导航">
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

    <div class="overflow-x-hidden overflow-y-auto p-4">
      {#if activeSection === 'dictionary'}
        <Dictonary data={mockDictionaryEntry} />
      {:else if activeSection === 'examples'}
        <Examples categories={mockDictionaryEntry.exampleCategories} />
      {:else if activeSection === 'usage'}
        <Usage data={mockDictionaryEntry} />
      {/if}
    </div>
  </div>
  <div class="flex items-center justify-between border-t border-gray-100 p-2 dark:border-gray-700">
    <Provider
      field={FEAT_INSTANT_LOOKUP}
      class="w-fit bg-white/80 px-2 py-1 shadow-xs dark:bg-slate-900/80" />
    <Button color="alternative" class="rounded-lg border-none p-1 text-sm shadow-xs">
      <LocalIcon icon="tabler:refresh" class="w-5" />
    </Button>
  </div>
</div>
