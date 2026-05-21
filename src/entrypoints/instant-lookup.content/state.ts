import { writable } from 'svelte/store';

import { buildContextSnapshot } from './utils';
import type { ContextSnapshot, SelectionSnapshot } from './utils';

export interface SelectionSession {
  id: number;
  createdAt: number;
  selectionSnapshot: SelectionSnapshot;
  contextSnapshot: ContextSnapshot;
}

let nextSelectionSessionId = 0;

function createSelectionSession(
  selection: SelectionSnapshot | null,
  context: ContextSnapshot | null
): SelectionSession | null {
  if (!selection) {
    return null;
  }

  const nextContext = context ?? buildContextSnapshot(selection);
  if (!nextContext) {
    return null;
  }

  return {
    id: ++nextSelectionSessionId,
    createdAt: Date.now(),
    selectionSnapshot: selection,
    contextSnapshot: nextContext
  };
}

export const selectionSession = writable<SelectionSession | null>(null);
export const isSelectionToolbarVisible = writable(false);
export const isPopoverOpen = writable(false);
export const isPopoverPinned = writable(false);

export function setSelectionState(
  selection: SelectionSnapshot | null,
  context: ContextSnapshot | null
) {
  selectionSession.set(createSelectionSession(selection, context));
}

export function clearSelectionState() {
  selectionSession.set(null);
}
