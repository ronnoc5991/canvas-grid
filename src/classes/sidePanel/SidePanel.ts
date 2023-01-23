import "./styles.css";

const IS_OPEN_CLASSNAME = "is-open";
const HAS_CONTENT_CLASSNAME = "has-content";
const ROOT_ELEMENT_ID = "side-panel";
const CLOSE_BUTTON_ID = "close-button";
const CONTENT_CONTAINER_ID = "content-container";

export default class SidePanel {
  private isOpen: boolean;
  private onContentClose: (() => void) | null;
  private root: HTMLElement = document.getElementById(
    ROOT_ELEMENT_ID
  ) as HTMLElement;
  private closeButton: HTMLButtonElement = document.getElementById(
    CLOSE_BUTTON_ID
  ) as HTMLButtonElement;
  private contentContainer: HTMLElement = document.getElementById(
    CONTENT_CONTAINER_ID
  ) as HTMLElement;

  constructor() {
    this.isOpen = false;
    this.onContentClose = null;
    this.root.addEventListener("transitionend", () => {
      this.onTransitionEnd();
    });

    this.closeButton.addEventListener("click", () => {
      this.close();
    });
  }

  public updateContent(newContent: HTMLElement, onContentClose: () => void) {
    this.onContentClose = onContentClose;
    this.emptyContentContainer();
    this.populateContentContainer(newContent);
    if (!this.isOpen) this.open();
  }

  private populateContentContainer(content: HTMLElement) {
    this.contentContainer.appendChild(content);
    this.root.classList.add(HAS_CONTENT_CLASSNAME);
  }

  private emptyContentContainer() {
    while (this.contentContainer.firstElementChild) {
      this.contentContainer.removeChild(
        this.contentContainer.firstElementChild
      );
    }
    this.root.classList.remove(HAS_CONTENT_CLASSNAME);
  }

  private open() {
    this.root.classList.add(IS_OPEN_CLASSNAME);
    this.isOpen = true;
  }

  public close() {
    this.root.classList.remove(IS_OPEN_CLASSNAME);
    this.isOpen = false;
  }

  private onTransitionEnd() {
    if (this.isOpen) return;
    this.emptyContentContainer();
    this.onContentClose?.();
  }
}
