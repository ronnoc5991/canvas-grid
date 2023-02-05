import Vertex from "../classes/graph/Vertex";

export default interface Editor {
  rootElement: HTMLElement;
  onVertexSelection: (selectedVertex: Vertex) => void;
  dispose(): void;
}
