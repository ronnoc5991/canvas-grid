import Vertex from "./Vertex";

export default class Edge {
  public weight: number;

  constructor(public fromVertex: Vertex, public toVertex: Vertex) {
    this.weight = Math.sqrt(
      Math.pow(fromVertex.position.x - toVertex.position.x, 2) +
        Math.pow(fromVertex.position.y - toVertex.position.y, 2)
    );
  }
}
