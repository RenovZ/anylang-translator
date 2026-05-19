<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';
  import { twMerge } from 'tailwind-merge';

  import LocalIcon from '@/components/LocalIcon.svelte';
  import config from '@/lib/config';
  import lang from '@/lib/lang';
  import urlUtils from '@/lib/url';
  import { INSTANT_LOOKUP_OVERLAY_ATTRIBUTE, NOTRANSLATE_CLASS } from '@/preset/dom';

  import SelectionPopover from './SelectionPopover.svelte';
  import {
    clearSelectionState,
    isPopoverOpen,
    isSelectionToolbarVisible,
    setSelectionState
  } from './state';
  import { buildContextSnapshot, readSelectionSnapshot } from './utils';

  const MARGIN = 25;
  const CURSOR_CLEARANCE = 20;
  const DOWNWARD_TOLERANCE = 8;

  const SelectionDirection = {
    TOP_LEFT: 'TOP_LEFT',
    TOP_RIGHT: 'TOP_RIGHT',
    BOTTOM_LEFT: 'BOTTOM_LEFT',
    BOTTOM_RIGHT: 'BOTTOM_RIGHT'
  } as const;

  type SelectionDirection = (typeof SelectionDirection)[keyof typeof SelectionDirection];

  const SELECTION_GUARD_INTERACTIVE_SELECTOR = [
    'button',
    '[role="button"]',
    'a[href]',
    'input',
    'textarea',
    'select',
    'summary'
  ].join(', ');

  let tooltipContainerRef: HTMLElement | null = $state(null);
  let toolbarRef: HTMLDivElement | null = $state(null);

  let selectionPosition: { x: number; y: number } | null = $state(null);
  let selectionStart: { x: number; y: number } | null = $state(null);
  let selectionDirection: SelectionDirection = $state(SelectionDirection.BOTTOM_RIGHT);
  let isPointerDownInsideOverlay = $state(false);
  let preserveSelectionState = $state(false);

  const triggerMode = $derived($config.instantLookup.selection.triggerTranslate);

  const isSiteDisabled = $derived(
    $config.instantLookup.disabledSites.some((pattern) =>
      urlUtils.matchDomainPattern(window.location.href, pattern)
    )
  );

  const detectedLang = $derived(
    lang.getFinalLangCode($config.sourceLangCode ?? 'auto', $config.langDetection.langCode)
  );

  const isLangDisabled = $derived($config.instantLookup.disabledLangs.includes(detectedLang));

  const isEnabled = $derived(!isSiteDisabled && !isLangDisabled && triggerMode !== 'noop');

  function getSelectionOverlayShadowRoot(overlayContainer: HTMLElement | null) {
    const root = overlayContainer?.getRootNode();
    return root instanceof ShadowRoot ? root : null;
  }

  function getNearestSelectionOverlayElement(node: Node | null) {
    let current: Node | null = node;
    while (current) {
      if (current instanceof Element) {
        return current;
      }
      const root = current.getRootNode();
      current = current.parentNode ?? (root instanceof ShadowRoot ? root.host : null);
    }
    return null;
  }

  function isNodeInsideSelectionOverlay(
    node: Node | null,
    overlayContainer: HTMLElement | null,
    overlayShadowRoot: ShadowRoot | null
  ) {
    if (!node) return false;
    if (overlayContainer?.contains(node)) return true;

    const overlayElement = getNearestSelectionOverlayElement(node);
    if (overlayElement?.closest(`[${INSTANT_LOOKUP_OVERLAY_ATTRIBUTE}]`)) {
      return true;
    }

    if (!overlayShadowRoot) return false;
    return node === overlayShadowRoot || node.getRootNode() === overlayShadowRoot;
  }

  function isSelectionInsideSelectionOverlay(
    selection: Selection | null,
    overlayContainer: HTMLElement | null,
    overlayShadowRoot: ShadowRoot | null
  ) {
    if (!selection) return false;

    const boundaryNodes = new SvelteSet<Node>();
    if (selection.anchorNode) boundaryNodes.add(selection.anchorNode);
    if (selection.focusNode) boundaryNodes.add(selection.focusNode);

    for (let i = 0; i < selection.rangeCount; i++) {
      try {
        const range = selection.getRangeAt(i);
        boundaryNodes.add(range.startContainer);
        boundaryNodes.add(range.endContainer);
      } catch {
        break;
      }
    }

    return [...boundaryNodes].some((node) =>
      isNodeInsideSelectionOverlay(node, overlayContainer, overlayShadowRoot)
    );
  }

  function isMouseEventInsideSelectionOverlay(
    event: MouseEvent,
    overlayContainer: HTMLElement | null,
    overlayShadowRoot: ShadowRoot | null
  ) {
    const eventPath = event.composedPath();
    for (const node of eventPath) {
      if (
        node instanceof Node &&
        isNodeInsideSelectionOverlay(node, overlayContainer, overlayShadowRoot)
      ) {
        return true;
      }
    }
    return isNodeInsideSelectionOverlay(
      event.target instanceof Node ? event.target : null,
      overlayContainer,
      overlayShadowRoot
    );
  }

  function getInteractiveGuardTarget(event: MouseEvent) {
    const eventPath = event.composedPath();
    for (const node of eventPath) {
      if (!(node instanceof Element)) continue;
      if (node.matches(SELECTION_GUARD_INTERACTIVE_SELECTOR)) return node;
      const closestInteractive = node.closest(SELECTION_GUARD_INTERACTIVE_SELECTOR);
      if (closestInteractive) return closestInteractive;
    }
    if (!(event.target instanceof Element)) return null;
    if (event.target.matches(SELECTION_GUARD_INTERACTIVE_SELECTOR)) return event.target;
    return event.target.closest(SELECTION_GUARD_INTERACTIVE_SELECTOR);
  }

  function getSelectionDirection(
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): SelectionDirection {
    const isRightward = startX <= endX;
    const isDownward = startY - DOWNWARD_TOLERANCE <= endY;

    if (isRightward && isDownward) return SelectionDirection.BOTTOM_RIGHT;
    if (isRightward && !isDownward) return SelectionDirection.TOP_RIGHT;
    if (!isRightward && isDownward) return SelectionDirection.BOTTOM_LEFT;
    return SelectionDirection.TOP_LEFT;
  }

  function applyDirectionOffset(
    direction: SelectionDirection,
    baseX: number,
    baseY: number,
    tooltipWidth: number,
    tooltipHeight: number
  ): { x: number; y: number } {
    switch (direction) {
      case SelectionDirection.BOTTOM_RIGHT:
        return { x: baseX, y: baseY + CURSOR_CLEARANCE };
      case SelectionDirection.BOTTOM_LEFT:
        return { x: baseX - tooltipWidth, y: baseY + CURSOR_CLEARANCE };
      case SelectionDirection.TOP_RIGHT:
        return { x: baseX, y: baseY - tooltipHeight - CURSOR_CLEARANCE };
      case SelectionDirection.TOP_LEFT:
        return { x: baseX - tooltipWidth, y: baseY - tooltipHeight - CURSOR_CLEARANCE };
      default:
        return { x: baseX, y: baseY + CURSOR_CLEARANCE };
    }
  }

  function updatePosition() {
    if (!$isSelectionToolbarVisible || !toolbarRef || !selectionPosition) return;

    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const clientWidth = document.documentElement.clientWidth;
    const tooltipWidth = toolbarRef.offsetWidth;
    const tooltipHeight = toolbarRef.offsetHeight;

    const { x: offsetX, y: offsetY } = applyDirectionOffset(
      selectionDirection,
      selectionPosition.x,
      selectionPosition.y,
      tooltipWidth,
      tooltipHeight
    );

    const topBoundary = scrollY + MARGIN;
    const bottomBoundary = scrollY + viewportHeight - tooltipHeight - MARGIN;
    const leftBoundary = MARGIN;
    const rightBoundary = clientWidth - tooltipWidth - MARGIN;

    const clampedX = Math.max(leftBoundary, Math.min(rightBoundary, offsetX));
    const clampedY = Math.max(topBoundary, Math.min(bottomBoundary, offsetY));

    toolbarRef.style.top = `${clampedY}px`;
    toolbarRef.style.left = `${clampedX}px`;
  }

  $effect(() => {
    if (tooltipContainerRef) {
      tooltipContainerRef.setAttribute(INSTANT_LOOKUP_OVERLAY_ATTRIBUTE, '');
    }
  });

  $effect(() => {
    let animationFrameId: number;

    const handleMouseUp = (e: MouseEvent) => {
      if (isPointerDownInsideOverlay) {
        isPointerDownInsideOverlay = false;
        preserveSelectionState = true;
        return;
      }

      requestAnimationFrame(() => {
        const isInputOrTextarea =
          document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement;

        if (isInputOrTextarea && e.target !== document.activeElement) {
          return;
        }

        const selection = window.getSelection();
        const overlayShadowRoot = getSelectionOverlayShadowRoot(tooltipContainerRef);

        if (isSelectionInsideSelectionOverlay(selection, tooltipContainerRef, overlayShadowRoot)) {
          preserveSelectionState = true;
          return;
        }

        const selectionSnapshot = readSelectionSnapshot(selection);
        const interactiveTarget = getInteractiveGuardTarget(e);

        if (
          !isInputOrTextarea &&
          interactiveTarget &&
          !selection?.containsNode(interactiveTarget, true)
        ) {
          return;
        }

        if (selectionSnapshot) {
          preserveSelectionState = false;
          setSelectionState(selectionSnapshot, buildContextSnapshot(selectionSnapshot));

          const scrollY = window.scrollY;
          const scrollX = window.scrollX;

          if (selectionStart) {
            const startX = selectionStart.x;
            const startY = selectionStart.y;
            const endX = e.clientX;
            const endY = e.clientY;
            selectionDirection = getSelectionDirection(startX, startY, endX, endY);
          } else {
            selectionDirection = SelectionDirection.BOTTOM_RIGHT;
          }

          const docX = e.clientX + scrollX;
          const docY = e.clientY + scrollY;

          selectionPosition = { x: docX, y: docY };

          if (triggerMode === 'show icons') {
            isSelectionToolbarVisible.set(true);
            requestAnimationFrame(updatePosition);
          } else if (triggerMode === 'directly') {
            isPopoverOpen.set(true);
          }
        }
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) return;

      const overlayShadowRoot = getSelectionOverlayShadowRoot(tooltipContainerRef);
      isPointerDownInsideOverlay = isMouseEventInsideSelectionOverlay(
        e,
        tooltipContainerRef,
        overlayShadowRoot
      );

      if (isPointerDownInsideOverlay) {
        preserveSelectionState = true;
        return;
      }

      preserveSelectionState = false;
      selectionStart = { x: e.clientX, y: e.clientY };

      clearSelectionState();
      isSelectionToolbarVisible.set(false);
      isPopoverOpen.set(false);
    };

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const overlayShadowRoot = getSelectionOverlayShadowRoot(tooltipContainerRef);

      if (isSelectionInsideSelectionOverlay(selection, tooltipContainerRef, overlayShadowRoot)) {
        preserveSelectionState = true;
        return;
      }

      if (!selection || selection.toString().trim().length === 0) {
        if (preserveSelectionState) {
          return;
        }

        clearSelectionState();
        isSelectionToolbarVisible.set(false);
        isPopoverOpen.set(false);
      }
    };

    const handleScroll = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('selectionchange', handleSelectionChange);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('selectionchange', handleSelectionChange);
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  });
</script>

<div bind:this={tooltipContainerRef} class={NOTRANSLATE_CLASS}>
  {#if isEnabled && selectionPosition}
    {console.log(selectionPosition)}
    <!--
      Toolbar container.
      NOTE: In read-frog this used document-coordinates directly on an
      absolute element. We follow the same pattern here.
    -->
    <div
      bind:this={toolbarRef}
      class={twMerge(
        'absolute z-2147483647 overflow-visible transition-opacity',
        $isSelectionToolbarVisible
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0'
      )}>
      <div
        class="flex items-center rounded-sm border border-gray-200/50 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <!--
          TODO: features.translate.enabled should be configurable instead of
          hard-coded true. For now we always show the translate button since
          the target project's instantLookup config does not yet have a
          features.translate.enabled field.
        -->
        <div class="flex max-w-105 items-center overflow-x-auto overflow-y-hidden rounded-sm">
          <!--
            This button wrapper is the previousElementSibling of the Popover's
            internal hidden div, making it the Popper trigger element.
          -->
          <div
            class={twMerge(
              'transition-opacity',
              triggerMode === 'show icons' && $isSelectionToolbarVisible
                ? 'opacity-100'
                : 'pointer-events-none opacity-0'
            )}>
            <button
              type="button"
              class="flex h-7 cursor-pointer items-center justify-center px-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Translate">
              <LocalIcon icon="ri:translate-ai" class="h-4.5 w-4.5" />
            </button>
          </div>

          <SelectionPopover
            bind:isOpen={$isPopoverOpen}
            onbeforetoggle={(ev) => {
              console.log(ev);
              if (ev.newState === 'open') {
                isSelectionToolbarVisible.set(false);
              }
            }}>
            <!-- TODO: Implement popover content (translation result, provider selection, etc.) -->
            <div class="min-w-50 p-4">
              <p class="text-sm text-gray-500">Translation content will be rendered here.</p>
            </div>
          </SelectionPopover>
        </div>
      </div>
    </div>
  {/if}
</div>
