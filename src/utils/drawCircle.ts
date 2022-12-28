import type { CircleConfig } from "../config/circle";
import type { Position } from "../types/Position";

export default function drawCircle(
  { x, y }: Position,
  config: CircleConfig,
  context: CanvasRenderingContext2D
) {
  context.beginPath();
  context.arc(x, y, config.radius, 0, 2 * Math.PI);
  context.save();
  context.strokeStyle = config.stroke.color;
  context.lineWidth = config.stroke.width;
  context.fillStyle = config.fill;
  context.translate(0.5, 0.5);
  context.fill();
  context.stroke();
  context.restore();
}
