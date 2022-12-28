import Edge from "../classes/Edge";
import type { Offset } from "../types/Offset";
import type { Position } from "../types/Position";
import type { Viewport } from "../types/Viewport";
import drawLine from "./drawLine";
import { EDGE_CONFIG } from "../config/line";

export default function drawEdges(
  edges: Array<Edge>,
  offset: Offset,
  viewport: Viewport,
  context: CanvasRenderingContext2D
) {
  edges.forEach((edge) => {
    if (!isEdgeVisible(edge, viewport)) return;
    const fromPosition: Position = {
      x: edge.vertices[0].position.x + offset.x,
      y: edge.vertices[0].position.y + offset.y,
    };
    const toPosition: Position = {
      x: edge.vertices[1].position.x + offset.x,
      y: edge.vertices[1].position.y + offset.y,
    };
    drawLine(fromPosition, toPosition, context, EDGE_CONFIG);
  });
}

function isEdgeVisible({ vertices }: Edge, viewport: Viewport) {
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
