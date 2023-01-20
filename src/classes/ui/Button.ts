export default class Button {
  public element: HTMLButtonElement;

  constructor(className: string, private onClick: (event: Event) => void) {
    this.element = this.initialize(className);
  }

  private initialize(className: string): HTMLButtonElement {
    const element = document.createElement("button");
    element.classList.add(className);
    element.addEventListener("click", this.onClick);
    return element;
  }

  public dispose() {
    this.element.removeEventListener("click", this.onClick);
  }
}
