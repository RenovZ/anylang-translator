import configStore from '@/lib/config';
import domFilter from '@/lib/dom/filter';
import translateVariants from '@/lib/translate/translate-variants';
import { HOTKEY_EVENT_KEYS } from '@/preset/translate';
import type { Config } from '@/types/config';
import type { Point } from '@/types/dom';

const HOLD_DELAY_MS = 1000;
const HOLD_MOVE_TOLERANCE = 6;
const MOVE_THROTTLE_MS = 300;
const MOVE_MIN_DIST = 3;

class NodeTranslation {
  private ac: AbortController | null = null;

  // Shared mouse position, updated on throttled mousemove
  private pos: Point = { x: 0, y: 0 };

  // --- Mousemove throttle ---
  private lastX = 0;
  private lastY = 0;
  private moveTimer: ReturnType<typeof setTimeout> | null = null;

  // --- Click-and-hold ---
  private pressed = false;
  private holdFired = false;
  private pressPos: Point | null = null;
  private holdTimer: ReturnType<typeof setTimeout> | null = null;

  // --- Hotkey-hold ---
  private keyDown = false;
  private pureSession = true;
  private keyTimer: ReturnType<typeof setTimeout> | null = null;
  private keyTriggered = false;
  private activeKey: string | null = null;

  /**
   * Registers node translation triggers based on the current config.
   * Returns a teardown function to remove all listeners.
   *
   * Config is read on demand when the interaction fires so long-lived content
   * scripts don't drift if the page was frozen and missed storage events.
   */
  register(): () => void {
    this.ac = new AbortController();
    const opts = { signal: this.ac.signal } as const;

    document.addEventListener('mousemove', this.onMouseMove, opts);
    document.addEventListener('mousedown', this.onMouseDown, opts);
    document.addEventListener('mouseup', this.onMouseUp, opts);
    document.addEventListener('keydown', this.onKeyDown, opts);
    document.addEventListener('keyup', this.onKeyUp, opts);

    // Teardown: abort all listeners + cancel pending timers
    return () => this.destroy();
  }

  private destroy(): void {
    this.ac?.abort();
    this.ac = null;
    this.resetKey();
    if (this.moveTimer) {
      clearTimeout(this.moveTimer);
      this.moveTimer = null;
    }
    this.clearHoldTimer();
  }

  // ── helpers ───────────────────────────────────────────────────────────────

  private cfg(): Config | null {
    if (this.ac?.signal.aborted) return null;
    return configStore.get();
  }

  private inTriggerMode(config: Config): boolean {
    return (
      !!config.adaptiveTranslate.provider &&
      config.adaptiveTranslate.translate.triggerOnHover === 'clickAndHold'
    );
  }

  private trigger(pos: Point): void {
    void translateVariants.removeOrShowNodeTranslation(pos);
  }

  private clearHoldTimer(): void {
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
  }

  private resetKey(): void {
    if (this.keyTimer) {
      clearTimeout(this.keyTimer);
      this.keyTimer = null;
    }
    this.keyDown = false;
    this.pureSession = true;
    this.keyTriggered = false;
    this.activeKey = null;
  }

  // ── event handlers (arrow functions keep `this` bound) ────────────────────

  private onMouseMove = (e: MouseEvent): void => {
    // Distance threshold: ignore tiny movements (trackpad tremor, mouse jitter)
    if (Math.abs(e.clientX - this.lastX) + Math.abs(e.clientY - this.lastY) <= MOVE_MIN_DIST) {
      return;
    }

    // Click-and-hold move cancellation (always immediate, no throttle)
    if (this.pressed && this.pressPos) {
      if (
        Math.hypot(e.clientX - this.pressPos.x, e.clientY - this.pressPos.y) > HOLD_MOVE_TOLERANCE
      ) {
        this.pressed = false;
        this.pressPos = null;
        this.clearHoldTimer();
      }
    }

    // Throttled position update
    if (this.moveTimer) return;
    this.moveTimer = setTimeout(() => {
      this.moveTimer = null;
    }, MOVE_THROTTLE_MS);

    this.pos.x = e.clientX;
    this.pos.y = e.clientY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  };

  private onMouseDown = (e: MouseEvent): void => {
    if (e.button !== 0) return;
    if (e.target instanceof HTMLElement && domFilter.isEditable(e.target)) return;

    const config = this.cfg();
    if (!config || !this.inTriggerMode(config)) return;

    this.pressed = true;
    this.holdFired = false;
    this.pressPos = { x: e.clientX, y: e.clientY };

    this.clearHoldTimer();
    this.holdTimer = setTimeout(() => {
      if (!this.pressed || !this.pressPos || this.holdFired) return;

      const current = this.cfg();
      if (!current || !this.inTriggerMode(current)) return;

      this.trigger(this.pressPos);
      this.holdFired = true;
    }, HOLD_DELAY_MS);
  };

  private onMouseUp = (e: MouseEvent): void => {
    if (e.button !== 0) return;
    if (!this.pressed && !this.holdTimer) return;

    this.pressed = false;
    this.holdFired = false;
    this.pressPos = null;
    this.clearHoldTimer();
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.target instanceof HTMLElement && domFilter.isEditable(e.target)) return;

    const config = this.cfg();
    if (!config || !this.inTriggerMode(config)) {
      this.resetKey();
      return;
    }

    const hotkey = HOTKEY_EVENT_KEYS[config.adaptiveTranslate.translate.triggerOnHover];

    if (e.key === hotkey) {
      if (this.keyDown) return; // already tracking this key

      this.keyDown = true;
      this.activeKey = hotkey;
      this.keyTimer = setTimeout(() => {
        if (!this.pureSession || !this.keyDown) {
          this.keyTimer = null;
          return;
        }

        const current = this.cfg();
        if (!current || !this.inTriggerMode(current)) {
          this.keyTimer = null;
          return;
        }
        if (
          HOTKEY_EVENT_KEYS[current.adaptiveTranslate.translate.triggerOnHover] !== this.activeKey
        ) {
          this.keyTimer = null;
          return;
        }

        this.trigger(this.pos);
        this.keyTriggered = true;
        this.keyTimer = null;
      }, HOLD_DELAY_MS);

      // Session already impure (another key was pressed first) — cancel immediately
      if (!this.pureSession && this.keyTimer) {
        clearTimeout(this.keyTimer);
        this.keyTimer = null;
      }
    } else {
      this.pureSession = false;
      if (this.keyDown && this.keyTimer) {
        clearTimeout(this.keyTimer);
        this.keyTimer = null;
      }
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    if (e.target instanceof HTMLElement && domFilter.isEditable(e.target)) return;

    const config = this.cfg();
    if (!config || !this.inTriggerMode(config)) {
      if (e.key === this.activeKey) this.resetKey();
      return;
    }

    const hotkey = HOTKEY_EVENT_KEYS[config.adaptiveTranslate.translate.triggerOnHover];

    if (e.key === hotkey || e.key === this.activeKey) {
      if (this.keyDown && this.pureSession) {
        if (this.keyTimer) {
          clearTimeout(this.keyTimer);
          this.keyTimer = null;
        }
        if (!this.keyTriggered) {
          const current = this.cfg();
          if (!current || !this.inTriggerMode(current)) return;
          this.trigger(this.pos);
        }
      }
      this.resetKey();
    }
  };
}

export default new NodeTranslation();
