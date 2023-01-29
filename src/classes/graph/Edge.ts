import { Position } from "../../types/Position";
import Vertex from "./Vertex";
import getEuclideanDistanceBetweenPoints from "../../utils/getEuclideanDistanceBetweenPoints";

export default class Edge {
  public weight: number;
  public controlPointOne: Position;
  public controlPointTwo: Position;
  public isBeingEdited: boolean = true;

  constructor(public vertices: [Vertex, Vertex]) {
    this.weight = getEuclideanDistanceBetweenPoints(
      vertices[0].position,
      vertices[1].position
    );
    const deltaX = vertices[1].position.x - vertices[0].position.x;
    const deltaY = vertices[1].position.y - vertices[0].position.y;

    this.controlPointOne = {
      x: vertices[0].position.x + deltaX / 3,
      y: vertices[0].position.y + deltaY / 3,
    };
    this.controlPointTwo = {
      x: vertices[0].position.x + (deltaX * 2) / 3,
      y: vertices[0].position.y + (deltaY * 2) / 3,
    };
  }
}
