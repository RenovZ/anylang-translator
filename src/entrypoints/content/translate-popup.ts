class TranslatePopup {
  private popup: HTMLElement | null = null;
  private clickHandler: ((e: MouseEvent) => void) | null = null;

  show(original: string, translation: string, isLoading = false, isError = false): void {
    this.remove();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const rect = selection.getRangeAt(0).getBoundingClientRect();
    this.popup = this.createPopupElement(original, translation, isLoading, isError);
    this.positionPopup(rect);
    document.body.appendChild(this.popup);

    this.setupCloseHandler();
  }

  remove(): void {
    if (this.popup) {
      this.popup.remove();
      this.popup = null;
      if (this.clickHandler) {
        document.removeEventListener('click', this.clickHandler);
        this.clickHandler = null;
      }
    }
  }

  private createPopupElement(
    original: string,
    translation: string,
    isLoading: boolean,
    isError: boolean
  ): HTMLElement {
    const popup = document.createElement('div');
    popup.id = 'anylang-translate-popup';
    popup.style.cssText = this.getPopupStyles();

    const content = document.createElement('div');
    content.appendChild(this.createOriginalSection(original));
    content.appendChild(this.createDivider());
    content.appendChild(this.createTranslationSection(translation, isLoading, isError));

    popup.appendChild(this.createCloseButton());
    popup.appendChild(content);
    popup.appendChild(this.createSpinnerStyle());

    return popup;
  }

  private getPopupStyles(): string {
    return `
      position: fixed;
      z-index: 2147483647;
      max-width: 400px;
      min-width: 200px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #1f2937;
    `;
  }

  private positionPopup(rect: DOMRect): void {
    if (!this.popup) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popupWidth = 400;
    const popupHeight = 150;

    let left = rect.left + rect.width / 2 - popupWidth / 2;
    let top = rect.bottom + 8;

    if (left < 8) left = 8;
    if (left + popupWidth > viewportWidth - 8) {
      left = viewportWidth - popupWidth - 8;
    }
    if (top + popupHeight > viewportHeight - 8) {
      top = rect.top - popupHeight - 8;
    }

    this.popup.style.left = `${left}px`;
    this.popup.style.top = `${top}px`;
  }

  private createOriginalSection(original: string): HTMLElement {
    const div = document.createElement('div');
    div.style.cssText = `
      color: #6b7280;
      font-size: 12px;
      margin-bottom: 8px;
      max-height: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    `;
    div.textContent = original;
    return div;
  }

  private createDivider(): HTMLElement {
    const div = document.createElement('div');
    div.style.cssText = `
      height: 1px;
      background: #e5e7eb;
      margin: 8px 0;
    `;
    return div;
  }

  private createTranslationSection(
    translation: string,
    isLoading: boolean,
    isError: boolean
  ): HTMLElement {
    const div = document.createElement('div');
    div.style.cssText = `
      color: ${isError ? '#dc2626' : '#1f2937'};
      font-weight: ${isLoading ? 'normal' : '500'};
      ${isLoading ? 'font-style: italic;' : ''}
    `;

    if (isLoading) {
      div.innerHTML = this.getLoadingHTML(translation);
    } else {
      div.textContent = translation;
    }

    return div;
  }

  private getLoadingHTML(text: string): string {
    return `
      <span style="display: inline-flex; align-items: center; gap: 8px;">
        <span class="anylang-spinner" style="
          width: 16px;
          height: 16px;
          border: 2px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: anylang-spin 1s linear infinite;
        "></span>
        ${text}
      </span>
    `;
  }

  private createCloseButton(): HTMLElement {
    const btn = document.createElement('button');
    btn.innerHTML = '&times;';
    btn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      color: #9ca3af;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    btn.onmouseenter = () => {
      btn.style.background = '#f3f4f6';
    };
    btn.onmouseleave = () => {
      btn.style.background = 'transparent';
    };
    btn.onclick = () => this.remove();

    return btn;
  }

  private createSpinnerStyle(): HTMLElement {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes anylang-spin {
        to { transform: rotate(360deg); }
      }
    `;
    return style;
  }

  private setupCloseHandler(): void {
    this.clickHandler = (e: MouseEvent) => {
      if (this.popup && !this.popup.contains(e.target as Node)) {
        this.remove();
      }
    };

    setTimeout(() => {
      document.addEventListener('click', this.clickHandler!);
    }, 100);
  }
}

export default new TranslatePopup();
