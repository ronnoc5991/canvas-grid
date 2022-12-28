import Vertex from "./Vertex";
import Edge from "./Edge";

export default class Graph {
  public vertices: Array<Vertex>;
  public edges: Array<Edge>;

  constructor() {
    this.vertices = [];
    this.edges = [];
  }

  public addVertex(vertex: Vertex) {
    this.vertices.push(vertex);
  }

  public addEdge(edge: Edge) {
    // TODO: Guard against multiple edges between the same two vertices? Could this result in a loop of sorts?
    this.edges.push(edge);
  }
}
