import type { Position } from "../../types/Position";
import Edge from "./Edge";

export default class Vertex {
  public edges: Array<Edge>;

  constructor(public position: Position, public name: string) {
    this.edges = [];
  }

  public addEdge(edge: Edge) {
    this.edges.push(edge);
  }
}
