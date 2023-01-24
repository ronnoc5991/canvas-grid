import Vertex from "./graph/Vertex";
import Button from "./ui/Button";

// TODO: add styles for this content

export default class SelectedVertexDisplay {
  public rootElement: HTMLElement;
  private deleteButton: Button;
  private planAPathButton: Button;

  constructor(
    private vertex: Vertex,
    private onDelete: () => void,
    private onPlanAPath: () => void
  ) {
    this.rootElement = document.createElement("div");
    this.deleteButton = new Button(
      "delete-active-vertex",
      this.onDelete.bind(this)
    );
    this.planAPathButton = new Button("plan-a-path-button", this.onPlanAPath);
    this.rootElement.appendChild(this.getNameElement());
    this.rootElement.appendChild(this.deleteButton.element);
    this.rootElement.appendChild(this.planAPathButton.element);
  }

  private getNameElement(): HTMLElement {
    const name = document.createElement("h1");
    name.classList.add("active-vertex-name");
    name.innerText = this.vertex.name;
    return name;
  }

  public dispose() {
    this.deleteButton.dispose();
    this.planAPathButton.dispose();
  }
}
