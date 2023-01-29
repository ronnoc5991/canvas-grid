import Editor from "../types/Editor";
import Graph from "./graph/Graph";
import Vertex from "./graph/Vertex";
import Button from "./ui/Button";

// use cases:
// person has created a few vertices and now wants to create some edges
// they click the create an edge button
// the side panel slides out, exposing this component
// user selects two vertices, then we create an edge?
// then the user can manipulate the edge's curves, then click save

// what if the user clicks the wrong vertex initially?
// they should be able to select the edge, then the vertex, then update that vertex
// that would mean that we should find the selected edge in the graph, and update it

export default class EdgeEditor implements Editor {
  public rootElement: HTMLElement;
  private vertexOneInput: HTMLInputElement;
  private vertexTwoInput: HTMLInputElement;
  private vertexOne: Vertex | null = null;
  private vertexTwo: Vertex | null = null;
  private saveButton: Button;

  constructor(private graph: Graph, private onSave: () => void) {
    this.rootElement = document.createElement("div");
    this.rootElement.classList.add("edge-editor");
    this.vertexOneInput = this.createInput("vertex-one");
    this.vertexTwoInput = this.createInput("vertex-two");
    this.rootElement.appendChild(this.vertexOneInput);
    this.rootElement.appendChild(this.vertexTwoInput);

    // edge editor needs a way to close the side panel that it is in?
    // an onSave function?
    this.saveButton = new Button("save-button", () => {
      // there is no edge involved here yet :)
      // ths should also toggle isBeingEdited to false for the current edge
      this.dispose();
      this.onSave();
    });
  }

  // receieve clicks from controls and interpret them here
  // can also handle all of the bezier point movement here?

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

    if (!!this.vertexOne && !!this.vertexTwo) {
      this.graph.createEdge(this.vertexOne, this.vertexTwo);
    }
  }

  public dispose() {
    // TODO: remove all event listeners involved here
    this.saveButton.dispose();
  }
}
