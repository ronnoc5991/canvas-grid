import type { Position } from "../types/Position";
import Edge from "./Edge";

// TODO: store path finding specific things here?
// TODO: Support custom vertex colors/appearances?

export default class Vertex {
  public edges: Array<Edge>;

  constructor(public position: Position) {
    this.edges = [];
  }

  public addEdge(edge: Edge) {
    this.edges.push(edge);
  }
}
