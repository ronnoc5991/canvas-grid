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

  public removeVertex(vertexToDelete: Vertex) {
    this.vertices = this.vertices.filter((vertex) => vertex !== vertexToDelete);
    this.edges = this.edges.filter(
      (edge) => !edge.vertices.includes(vertexToDelete)
    );
  }

  public removeEdge(edgeToDelete: Edge) {
    this.edges = this.edges.filter((edge) => edge !== edgeToDelete);
    this.vertices.forEach((vertex) => {
      vertex.edges = vertex.edges.filter((edge) => edge !== edgeToDelete);
    });
  }
}
