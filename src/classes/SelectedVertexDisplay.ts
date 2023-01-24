import Vertex from "./graph/Vertex";
import Button from "./ui/Button";

// TODO: add styles for this content

export default class SelectedVertexDisplay {
  public rootElement: HTMLElement;
  private nameInput: HTMLInputElement;
  private deleteButton: Button;
  private planAPathButton: Button;

  constructor(
    private vertex: Vertex,
    private onDelete: () => void,
    private onPlanAPath: () => void
  ) {
    this.rootElement = document.createElement("div");
    this.nameInput = this.createNameInput();
    this.nameInput.addEventListener("keyup", this.updateName);
    this.deleteButton = new Button(
      "delete-active-vertex",
      this.onDelete.bind(this)
    );
    this.planAPathButton = new Button("plan-a-path-button", this.onPlanAPath);
    this.rootElement.appendChild(this.nameInput);
    this.rootElement.appendChild(this.deleteButton.element);
    this.rootElement.appendChild(this.planAPathButton.element);
  }

  private createNameInput(): HTMLInputElement {
    const input = document.createElement("input");
    input.classList.add("name-input");
    input.name = "name";
    input.value = this.vertex.name;
    return input;
  }

  private updateName() {
    this.vertex.name = this.nameInput.value;
  }

  public dispose() {
    this.deleteButton.dispose();
    this.planAPathButton.dispose();
    this.nameInput.removeEventListener("keyup", this.updateName);
  }
}
