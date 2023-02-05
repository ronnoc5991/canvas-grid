import Vertex from "./Vertex";
import Edge from "./Edge";
import { Position } from "../../types/Position";

export default class Graph {
  public vertices: Array<Vertex>;
  public edges: Array<Edge>;
  private vertexCount: number;

  constructor() {
    this.vertices = [];
    this.edges = [];
    this.vertexCount = 0;
  }

  public createVertex(position: Position): Vertex {
    this.vertexCount += 1;
    const newVertex = new Vertex(position, `Node ${this.vertexCount}`);
    this.vertices.push(newVertex);
    return newVertex;
  }

  public createEdge(vertexOne: Vertex, vertexTwo: Vertex): Edge {
    const edge = new Edge([vertexOne, vertexTwo]);
    vertexOne.addEdge(edge);
    vertexTwo.addEdge(edge);
    this.edges.push(edge);
    return edge;
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
