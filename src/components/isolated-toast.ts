import { mount, unmount } from 'svelte';

import logger from '@/lib/logger';

import type { IsolatedToastProp } from './IsolatedToast.svelte';
import IsolatedToast from './IsolatedToast.svelte';

export interface ToastOptions {
  message: string;
  title?: string;
  /** Auto-dismiss delay in ms. Default 4000. Set 0 to disable. */
  duration?: number;
}

type ToastType = IsolatedToastProp['type'];

class IsolatedToastManager {
  private readonly DATA_ATTR = 'data-anylang-toast-host';
  private readonly DEFAULT_DURATION = 4000;

  private shadowHost: HTMLDivElement | null = null;
  private container: HTMLElement | null = null;
  private component: Record<string, unknown> | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  private ensureHost(): HTMLElement {
    if (this.shadowHost && this.shadowHost.isConnected && this.container) {
      return this.container;
    }

    // Clean up stale host
    this.shadowHost?.remove();

    this.shadowHost = document.createElement('div');
    this.shadowHost.setAttribute(this.DATA_ATTR, '');
    const shadowRoot = this.shadowHost.attachShadow({ mode: 'open' });
    this.container = document.createElement('div');
    shadowRoot.appendChild(this.container);

    (document.body ?? document.documentElement).appendChild(this.shadowHost);

    return this.container;
  }

  private clearTimer() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private teardown() {
    if (this.component) {
      try {
        unmount(this.component);
      } catch (error) {
        logger.error({ error });
      }
      this.component = null;
    }
  }

  private show(type: ToastType, msgOrOpts: string | ToastOptions) {
    // Only show toast in the top-level frame, skip iframes
    if (window.self !== window.top) return;

    const opts: ToastOptions = typeof msgOrOpts === 'string' ? { message: msgOrOpts } : msgOrOpts;
    const duration = opts.duration ?? this.DEFAULT_DURATION;

    this.clearTimer();
    this.teardown();

    const target = this.ensureHost();

    this.component = mount(IsolatedToast, {
      target,
      props: {
        show: true,
        type,
        message: opts.message,
        title: opts.title,
        onclose: () => this.dismiss()
      }
    });

    if (duration > 0) {
      this.timer = setTimeout(() => this.dismiss(), duration);
    }
  }

  /** Dismiss the current toast immediately. */
  dismiss() {
    this.clearTimer();
    this.teardown();
  }

  /** Remove the shadow host from the DOM entirely. Call on content script cleanup. */
  destroy() {
    this.dismiss();
    this.shadowHost?.remove();
    this.shadowHost = null;
    this.container = null;
  }

  success = (msgOrOpts: string | ToastOptions) => this.show('success', msgOrOpts);
  error = (msgOrOpts: string | ToastOptions) => this.show('error', msgOrOpts);
  warn = (msgOrOpts: string | ToastOptions) => this.show('warn', msgOrOpts);
  info = (msgOrOpts: string | ToastOptions) => this.show('info', msgOrOpts);
}

export const toast = new IsolatedToastManager();
