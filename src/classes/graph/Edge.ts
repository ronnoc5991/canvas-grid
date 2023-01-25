import { Position } from "../../types/Position";
import Vertex from "./Vertex";
import getEuclideanDistanceBetweenPoints from "../../utils/getEuclideanDistanceBetweenPoints";

export default class Edge {
  public weight: number;
  public controlPointOne: Position;
  public controlPointTwo: Position;
  public isBeingEdited: boolean = true;

  constructor(public fromVertex: Vertex, public toVertex: Vertex) {
    this.weight = getEuclideanDistanceBetweenPoints(
      fromVertex.position,
      toVertex.position
    );
    const deltaX = toVertex.position.x - fromVertex.position.x;
    const deltaY = toVertex.position.y - fromVertex.position.y;

    this.controlPointOne = {
      x: fromVertex.position.x + deltaX / 3,
      y: fromVertex.position.y + deltaY / 3,
    };
    this.controlPointTwo = {
      x: fromVertex.position.x + (deltaX * 2) / 3,
      y: fromVertex.position.y + (deltaY * 2) / 3,
    };
  }
}
