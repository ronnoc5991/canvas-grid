import Edge from "../classes/Edge";
import type { Viewport } from "../types/Viewport";

export function isEdgeVisible({ vertices }: Edge, viewport: Viewport) {
  return (
    (vertices[0].position.x > viewport.minX &&
      vertices[0].position.x < viewport.maxX &&
      vertices[0].position.y > viewport.minY &&
      vertices[0].position.y < viewport.maxY) ||
    (vertices[1].position.x > viewport.minX &&
      vertices[1].position.x < viewport.maxX &&
      vertices[1].position.y > viewport.minY &&
      vertices[1].position.y < viewport.maxY)
  );
}
