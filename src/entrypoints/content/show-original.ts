export class ShowOriginal {
  public isEnabled = false;
  private enabledObservers: Array<() => void> = [];
  private nodesToShowOriginal: Array<{ node: Node; original: string | null }> = [];
  private showOriginalTextWhenHovering: string = "no";

  private divElement: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private timeoutHandler: number | null = null;
  private originalTextIsShowing = false;
  private currentNodeOverMouse: EventTarget | null = null;
  private styleTextContent = "";
  private mousePos = { x: 0, y: 0 };

  public initialize(config: {
    onReady(callback?: () => void): Promise<void>;
    get<T>(name: string): T;
    onChanged(callback: (name: string, value: unknown) => void): void;
  }, platformInfo: { isMobile: { any: unknown } }): void {
    void config.onReady(() => {
      if (platformInfo.isMobile.any) {
        this.enable = () => undefined;
        this.disable = () => undefined;
        this.add = () => undefined;
        this.removeAll = () => undefined;
        this.enabledObserverSubscribe = () => undefined;
        this.isEnabled = false;
        return;
      }

      fetch(browser.runtime.getURL("/contentScript/css/showOriginal.css"))
        .then((response) => response.text())
        .then((text) => {
          this.styleTextContent = text;
        })
        .catch(() => undefined);

      this.showOriginalTextWhenHovering = config.get<string>("showOriginalTextWhenHovering");
      this.isEnabled = this.showOriginalTextWhenHovering === "yes";

      config.onChanged((name, value) => {
        if (name === "showOriginalTextWhenHovering") {
          this.showOriginalTextWhenHovering = String(value);
          this.isEnabled = this.showOriginalTextWhenHovering === "yes";
          this.enable(true);
          this.enabledObservers.forEach((callback) => callback());
        }
      });
    });
  }

  public enabledObserverSubscribe(callback: () => void): void {
    this.enabledObservers.push(callback);
  }

  public add(node: Node): void {
    if (!node) return;
    if (this.nodesToShowOriginal.some((item) => item.node === node)) return;

    this.nodesToShowOriginal.push({ node, original: node.textContent });
    node.addEventListener("mouseenter", this.onMouseEnter as EventListener);
    node.addEventListener("mouseout", this.onMouseOut as EventListener);
  }

  public removeAll(): void {
    this.nodesToShowOriginal.forEach((item) => {
      item.node.removeEventListener("mouseenter", this.onMouseEnter as EventListener);
      item.node.removeEventListener("mouseout", this.onMouseOut as EventListener);
    });
    this.nodesToShowOriginal = [];
  }

  public enable = (dontDeleteNodesToShowOriginal = false): void => {
    this.disable(dontDeleteNodesToShowOriginal);
    if (this.showOriginalTextWhenHovering !== "yes") return;
    if (this.divElement) return;

    this.divElement = document.createElement("div");
    this.divElement.style.cssText = "all: initial";
    this.divElement.classList.add("notranslate");

    this.shadowRoot = this.divElement.attachShadow({ mode: "closed" });
    this.shadowRoot.innerHTML = `<div id="originalText" dir="auto"></div>`;
    const style = document.createElement("style");
    style.textContent = this.styleTextContent;
    this.shadowRoot.prepend(style);

    this.divElement.addEventListener("mouseout", this.onMouseOut);
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mousedown", this.onMouseDown);
    document.addEventListener("blur", this.hideOriginalText);
    document.addEventListener("visibilitychange", this.hideOriginalText);
    document.addEventListener("keyup", this.hideOnEsc, true);
  };

  public disable = (dontDeleteNodesToShowOriginal = false): void => {
    if (this.divElement) {
      this.hideOriginalText();
      this.divElement.remove();
    }
    this.divElement = null;
    this.shadowRoot = null;

    if (!dontDeleteNodesToShowOriginal) {
      this.removeAll();
    }

    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mousedown", this.onMouseDown);
    document.removeEventListener("blur", this.hideOriginalText);
    document.removeEventListener("visibilitychange", this.hideOriginalText);
    document.removeEventListener("keyup", this.hideOnEsc, true);
  };

  private onMouseMove = (event: MouseEvent): void => {
    this.mousePos.x = event.clientX;
    this.mousePos.y = event.clientY;
  };

  private onMouseDown = (event: MouseEvent): void => {
    if (!this.divElement) return;
    if (event.target === this.divElement) return;
    this.hideOriginalText();
  };

  private onMouseEnter = (event: MouseEvent): void => {
    if (!this.divElement) return;
    if (this.currentNodeOverMouse && event.target === this.currentNodeOverMouse) return;

    this.currentNodeOverMouse = event.target;
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler);
    }
    this.timeoutHandler = window.setTimeout(() => {
      this.showOriginalText(this.currentNodeOverMouse);
    }, 1250);
  };

  private onMouseOut = (event: MouseEvent): void => {
    if (!this.divElement) return;
    if (!this.originalTextIsShowing) return;

    if (event.target === this.currentNodeOverMouse && event.relatedTarget === this.divElement) return;
    if (event.target === this.divElement && event.relatedTarget === this.currentNodeOverMouse) return;
    this.hideOriginalText();
  };

  private showOriginalText(node: EventTarget | null): void {
    this.hideOriginalText();
    if (!this.divElement || !this.shadowRoot || !node) return;
    if (window.isTranslatingSelected) return;

    const info = this.nodesToShowOriginal.find((item) => item.node === node);
    if (!info) return;

    const textNode = this.shadowRoot.getElementById("originalText");
    if (!textNode) return;
    textNode.textContent = info.original ?? "";
    document.body.appendChild(this.divElement);
    this.originalTextIsShowing = true;

    const height = textNode.offsetHeight;
    const width = textNode.offsetWidth;

    let top = this.mousePos.y + 10;
    top = Math.max(0, Math.min(window.innerHeight - height, top));

    let left = this.mousePos.x;
    left = Math.max(0, Math.min(window.innerWidth - width, left));

    textNode.style.top = `${top}px`;
    textNode.style.left = `${left}px`;
  }

  private hideOriginalText = (): void => {
    this.divElement?.remove();
    this.originalTextIsShowing = false;
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  };

  private hideOnEsc = (event: KeyboardEvent): void => {
    if (event.key === "Escape") this.hideOriginalText();
  };
}
