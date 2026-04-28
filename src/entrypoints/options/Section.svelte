<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  interface Props {
    title?: string | import('svelte').Snippet;
    description?: string | import('svelte').Snippet;
    class?: string;
    children: import('svelte').Snippet;
    headerActions?: import('svelte').Snippet;
    limitHeight?: boolean;
  }

  const {
    title,
    description,
    class: className = '',
    children,
    headerActions,
    limitHeight = false
  }: Props = $props();

  let mainRef: HTMLElement | null = $state(null);
  let headerRef: HTMLDivElement | null = $state(null);
  let contentRef: HTMLDivElement | null = $state(null);
  let contentHeight = $state('auto');

  // Calculate content height based on viewport and external elements
  const calculateHeight = () => {
    // Get external page elements
    const pageHeader = document.getElementById('page-header');
    const pageMain = document.getElementById('page-main');

    if (!pageHeader || !pageMain || !headerRef || !contentRef || !mainRef) return;

    // Get external element dimensions
    const pageHeaderHeight = pageHeader.getBoundingClientRect().height;
    const pageMainStyle = window.getComputedStyle(pageMain);
    const pageMainPaddingTop = parseFloat(pageMainStyle.paddingTop);
    const pageMainPaddingBottom = parseFloat(pageMainStyle.paddingBottom);
    const pageMainMarginTop = parseFloat(pageMainStyle.marginTop);
    const pageMainMarginBottom = parseFloat(pageMainStyle.marginTop);

    // Get internal header height
    const headerHeight = headerRef.getBoundingClientRect().height;

    const mainStyle = window.getComputedStyle(mainRef);
    const mainPaddingTop = parseFloat(mainStyle.paddingTop);
    const mainPaddingBottom = parseFloat(mainStyle.paddingBottom);
    const mainMarginTop = parseFloat(mainStyle.marginTop);
    const mainMarginBottom = parseFloat(mainStyle.marginBottom);

    const contentStyle = window.getComputedStyle(contentRef);
    const contentPaddingTop = parseFloat(contentStyle.paddingTop);
    const contentPaddingBottom = parseFloat(contentStyle.paddingBottom);
    const contentMarginTop = parseFloat(contentStyle.marginTop);
    const contentMarginBottom = parseFloat(contentStyle.marginBottom);

    const sectionPadding =
      mainPaddingTop +
      mainPaddingBottom +
      mainMarginTop +
      mainMarginBottom +
      contentPaddingTop +
      contentPaddingBottom +
      contentMarginTop +
      contentMarginBottom;

    // Available height for the entire section
    const availableHeight =
      window.innerHeight -
      pageHeaderHeight -
      pageMainPaddingTop -
      pageMainPaddingBottom -
      pageMainMarginTop -
      pageMainMarginBottom;

    const calculatedContentHeight = availableHeight - headerHeight - sectionPadding;
    contentHeight = `${calculatedContentHeight}px`;
  };

  $effect(() => {
    if (limitHeight) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.removeProperty('overflow');
    }
  });

  // Recalculate on mount and resize
  $effect(() => {
    if (!limitHeight || !contentRef) return;

    calculateHeight();

    const handleResize = () => calculateHeight();
    window.addEventListener('resize', handleResize);

    // Also observe header size changes
    const resizeObserver = headerRef ? new ResizeObserver(() => calculateHeight()) : null;
    if (headerRef && resizeObserver) {
      resizeObserver.observe(headerRef);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
    };
  });

  const classList = $derived(
    twMerge('rounded-2xl bg-white/80 p-8 shadow-md dark:bg-slate-900/80 flex flex-col', className)
  );
</script>

<section class={classList} bind:this={mainRef}>
  <div bind:this={headerRef} class="flex shrink-0 flex-col items-start gap-2">
    {#if title || description}
      {#if title}
        {#if typeof title === 'string'}
          <h2 class="text-lg font-semibold">{title}</h2>
        {:else}
          {@render title()}
        {/if}
      {/if}
      {#if description}
        {#if typeof description === 'string'}
          <p class="mt-1 text-sm text-slate-400">{description}</p>
        {:else}
          {@render description()}
        {/if}
      {/if}
    {/if}
    {@render headerActions?.()}
  </div>

  <!-- Content area with calculated height -->
  <div
    bind:this={contentRef}
    class="mt-10 space-y-10 overflow-auto"
    style={`height: ${contentHeight};`}>
    {@render children?.()}
  </div>
</section>
