export default class Button {
  public element: HTMLButtonElement;

  constructor(className: string, onClick: (event: Event) => void) {
    this.element = document.createElement("button");
    this.element.classList.add(className);
    this.element.addEventListener("click", onClick);
  }
}
