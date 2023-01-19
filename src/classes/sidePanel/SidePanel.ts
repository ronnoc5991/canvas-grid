import Button from "../ui/Button";
import "./styles.css";

const IS_OPEN_CLASSNAME = "is-open";

export default class SidePanel {
  private rootElement: HTMLElement;
  private isOpen: boolean;

  constructor(private content: HTMLElement) {
    this.rootElement = this.create();
    this.rootElement.appendChild(this.content);
    this.isOpen = false;
    this.append();
    this.open();
  }

  private create(): HTMLElement {
    const container = document.createElement("div");
    container.classList.add("side-panel");
    const toggleButton = new Button(
      "toggle-button",
      this.toggleOpen.bind(this)
    );
    container.appendChild(toggleButton.element);
    return container;
  }

  private append() {
    document.body.appendChild(this.rootElement);
  }

  public populate(content: HTMLElement) {
    this.rootElement.removeChild(this.content);
    this.content = content;
    this.rootElement.appendChild(this.content);
  }

  private toggleOpen() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private open() {
    this.rootElement.classList.add(IS_OPEN_CLASSNAME);
    this.isOpen = true;
  }

  private close() {
    this.rootElement.classList.remove(IS_OPEN_CLASSNAME);
    this.isOpen = false;
  }

  public remove() {
    document.body.removeChild(this.rootElement);
  }
}
