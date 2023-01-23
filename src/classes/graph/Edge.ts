import Vertex from "./Vertex";
import getEuclideanDistanceBetweenPoints from "../../utils/getEuclideanDistanceBetweenPoints";

export default class Edge {
  public weight: number;

  constructor(public fromVertex: Vertex, public toVertex: Vertex) {
    this.weight = getEuclideanDistanceBetweenPoints(
      fromVertex.position,
      toVertex.position
    );
  }
}
