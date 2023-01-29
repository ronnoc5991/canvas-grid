export default class Button {
  public rootElement: HTMLButtonElement;

  constructor(className: string, private onClick: (event: Event) => void) {
    this.rootElement = document.createElement("button");
    this.rootElement.classList.add(className);
    this.rootElement.addEventListener("click", this.onClick);
  }

  public dispose() {
    this.rootElement.removeEventListener("click", this.onClick);
  }
}
