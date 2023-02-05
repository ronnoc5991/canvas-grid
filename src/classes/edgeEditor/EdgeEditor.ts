import Editor from "../../types/Editor";
import Edge from "../graph/Edge";
import Graph from "../graph/Graph";
import Vertex from "../graph/Vertex";
import Button from "../ui/Button";

// user should be able to:
// select an edge, then a vertex input, then select a new vertex?

// TODO: handle the bezier point movement here?

// TODO: Create input class to use in these editors

export default class EdgeEditor implements Editor {
  public rootElement: HTMLElement;
  private vertexOneInput: HTMLInputElement;
  private vertexTwoInput: HTMLInputElement;
  private vertexOne: Vertex | null = null;
  private vertexTwo: Vertex | null = null;
  private edge: Edge | null = null;
  private saveButton: Button;

  constructor(private graph: Graph, private onSave: () => void) {
    this.rootElement = document.createElement("div");
    this.rootElement.classList.add("edge-editor");
    this.vertexOneInput = this.createInput("vertex-one");
    this.vertexTwoInput = this.createInput("vertex-two");
    this.rootElement.appendChild(this.vertexOneInput);
    this.rootElement.appendChild(this.vertexTwoInput);

    this.saveButton = new Button(
      "save-button",
      () => {
        if (this.edge) this.edge.isBeingEdited = false;
        this.onSave();
        this.dispose();
      },
      "Save"
    );

    this.rootElement.appendChild(this.saveButton.rootElement);
  }

  private createInput(name: string): HTMLInputElement {
    const input = document.createElement("input");
    input.type = "text";
    input.name = name;
    return input;
  }

  public onVertexSelection(selectedVertex: Vertex) {
    if (!this.vertexOne) {
      this.vertexOne = selectedVertex;
      this.vertexOneInput.value = selectedVertex.name;
    } else {
      this.vertexTwo = selectedVertex;
      this.vertexTwoInput.value = selectedVertex.name;
    }

    if (!!this.vertexOne && !!this.vertexTwo && !this.edge) {
      this.edge = this.graph.createEdge(this.vertexOne, this.vertexTwo);
    }
  }

  public dispose() {
    this.saveButton.dispose();
  }
}
