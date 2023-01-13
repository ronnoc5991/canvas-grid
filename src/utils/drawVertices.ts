import type { Viewport } from "../types/Viewport";
import { Position } from "../types/Position";

export function isVertexVisible(
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
