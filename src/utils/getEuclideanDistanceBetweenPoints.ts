import { Position } from "../types/Position";

export default function getEuclideanDistanceBetweenPoints(
  positionOne: Position,
  positionTwo: Position
) {
  return Math.sqrt(
    Math.pow(positionOne.x - positionTwo.x, 2) +
      Math.pow(positionOne.y - positionTwo.y, 2)
  );
}
