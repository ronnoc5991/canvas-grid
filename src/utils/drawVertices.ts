import type { Offset } from "../types/Offset";
import type { Viewport } from "../types/Viewport";
import { Position } from "../types/Position";
import Vertex from "../classes/Vertex";
import { CircleConfig } from "../config/circle";
import drawCircle from "./drawCircle";

export default function drawVertices(
  vertices: Array<Vertex>,
  circleConfig: CircleConfig,
  offset: Offset,
  viewport: Viewport,
  context: CanvasRenderingContext2D
) {
  vertices.forEach(({ position }) => {
    if (!isVertexVisible(position, circleConfig.radius, viewport)) return;
    drawCircle(
      { x: position.x + offset.x, y: position.y + offset.y },
      circleConfig,
      context
    );
  });
}

function isVertexVisible(
  { x, y }: Position,
  radius: number,
  { minX, maxX, minY, maxY }: Viewport
): boolean {
  if (x > minX && x < maxX && y > minY && y < maxY) return true;

  const rightEdge = x + radius;
  const leftEdge = x - radius;
  const topEdge = y - radius;
  const bottomEdge = y + radius;
  const isRightEdgeVisible = rightEdge > minX && rightEdge < maxX;
  const isLeftEdgeVisible = leftEdge > minX && leftEdge < maxX;
  const isTopEdgeVisible = topEdge > minY && topEdge < maxY;
  const isBottomEdgeVisible = bottomEdge > minY && bottomEdge < maxY;

  if (
    (isRightEdgeVisible || isLeftEdgeVisible) &&
    (isTopEdgeVisible || isBottomEdgeVisible)
  )
    return true;

  return false;
}
