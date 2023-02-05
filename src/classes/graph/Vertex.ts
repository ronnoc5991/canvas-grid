import type { Position } from "../../types/Position";
import Edge from "./Edge";

export default class Vertex {
  public edges: Array<Edge>;
  public distanceToTarget: number | null;
  public cost: number;
  public previousVertexInPath: Vertex | null;

  constructor(public position: Position, public name: string) {
    this.edges = [];
    this.distanceToTarget = null;
    this.cost = Infinity;
    this.previousVertexInPath = null;
  }

  public addEdge(edge: Edge): void {
    this.edges.push(edge);
  }
}
