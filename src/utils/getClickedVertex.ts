import Vertex from "../classes/Vertex";
import { Position } from "../types/Position";

export default function getClickedVertex(
  clickedPosition: Position,
  vertices: Array<Vertex>,
  vertexRadius: number
): Vertex | undefined {
  return vertices.find(({ position }) => {
    const leftEdge = position.x - vertexRadius;
    const rightEdge = position.x + vertexRadius;
    const topEdge = position.y - vertexRadius;
    const bottomEdge = position.y + vertexRadius;

    return (
      clickedPosition.x >= leftEdge &&
      clickedPosition.x <= rightEdge &&
      clickedPosition.y >= topEdge &&
      clickedPosition.y <= bottomEdge
    );
  });
}
