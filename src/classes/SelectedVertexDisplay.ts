import Vertex from "./graph/Vertex";
import Button from "./ui/Button";

// TODO: add styles for this content

// onNameChange
// onDelete
// could also display edges that leave from here?

// selected Vertex display?
// pass in a vertex
// create DOM to be appended to sidePanel
// editable name
// delete function

// why cant this just be a function?

export default class SelectedVertexDisplay {
  public rootElement: HTMLElement;

  constructor(private vertex: Vertex, private onDelete: () => void) {
    this.rootElement = this.create();
  }

  // create the DOM

  // remove event Listeners from DOM?

  private create(): HTMLElement {
    const container = document.createElement("div");
    const name = this.getNameElement();
    container.appendChild(name);
    const deleteButton = new Button(
      "delete-active-vertex",
      this.onDelete.bind(this)
    );
    container.appendChild(deleteButton.element);
    return container;
  }

  private getNameElement(): HTMLElement {
    const name = document.createElement("h1");
    name.classList.add("active-vertex-name");
    name.innerText = this.vertex.name;
    return name;
  }
}
