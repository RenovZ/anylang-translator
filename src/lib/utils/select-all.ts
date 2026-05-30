export function protectSelectAllShadowRoot(shadowHost: HTMLElement, wrapper: HTMLElement) {
  // ① Track whether mouse is over the component
  let pointerInside = false;
  shadowHost.addEventListener('pointerenter', () => {
    pointerInside = true;
  });
  shadowHost.addEventListener('pointerleave', () => {
    pointerInside = false;
  });

  window.addEventListener(
    'keydown',
    (e) => {
      // Only handle Ctrl+A (Windows/Linux) or Cmd+A (Mac)
      // metaKey is the Mac Command key
      // ctrlKey is the Windows Ctrl key
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && !e.shiftKey) {
        const active = document.activeElement;

        /* --- Four cases --- */
        if (shadowHost.contains(active)) {
          // A. Focus already inside the component → let default behavior proceed
          return;
        }

        if (isEditableElement(active)) {
          // B. Focus on editable element (input, textarea, etc.) → let default behavior proceed
          return;
        }

        // C. Focus inside another shadow root (active is another shadow host) → let default behavior proceed
        if (active && (active as HTMLElement).shadowRoot) {
          return;
        }

        if (pointerInside) {
          // D. Mouse hovering over the component → custom "select-all-inside-component"
          e.preventDefault();
          e.stopPropagation();
          requestAnimationFrame(() => selectAllInside(wrapper));
          return;
        }

        // E. Other cases (select all on host page, but exclude component)
        // When there is no interaction → active = document.body
        // Only execute "select-all-excluding-component" when focus is on body or there's no focus
        // If focus is on another element (such as canvas), the app may have its own handling logic, don't interfere
        // Clicked on canvas (e.g. Excalidraw) → <canvas> element
        if (active === document.body || !active) {
          e.preventDefault();
          e.stopPropagation();
          requestAnimationFrame(() => rebuildSelectionWithoutHost(shadowHost));
        }
      }
    },
    true // capture
  );
}

/* Check if element is editable */
function isEditableElement(element: Element | null): boolean {
  if (!element) return false;

  const tagName = element.tagName.toLowerCase();

  // Check input element (exclude non-text types)
  if (tagName === 'input') {
    const inputType = (element as HTMLInputElement).type.toLowerCase();
    const textInputTypes = ['text', 'password', 'search', 'tel', 'url', 'email'];
    return textInputTypes.includes(inputType);
  }

  // Check textarea
  if (tagName === 'textarea') {
    return true;
  }

  // Check contenteditable
  const contentEditable = element.getAttribute('contenteditable');
  if (contentEditable === 'true' || contentEditable === '') {
    return true;
  }

  return false;
}

/* Select all inside the component (only needs 1 Range) */
function selectAllInside(root: HTMLElement) {
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();

  const range = document.createRange();
  range.selectNodeContents(root); // Select the entire wrapper ⭐
  sel.addRange(range); // Immediately show highlight
}

// Select the entire page but skip the shadow host component.
function rebuildSelectionWithoutHost(shadowHost: HTMLElement) {
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();

  const before = document.createRange();
  before.setStart(document.body, 0);
  before.setEndBefore(shadowHost);

  const after = document.createRange();
  after.setStartAfter(shadowHost);
  after.setEnd(document.body, document.body.childNodes.length);

  sel.addRange(before);
  sel.addRange(after);
}
