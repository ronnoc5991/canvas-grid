import type { LineConfig } from "../config/line";
import type { Position } from "../types/Position";

export default function drawLine(
  from: Position,
  to: Position,
  context: CanvasRenderingContext2D,
  config?: LineConfig
) {
  context.save();
  context.lineWidth = config?.width ?? 1;
  context.strokeStyle = config?.color ?? "#000000";
  context.beginPath();
  context.translate(0.5, 0.5); // weird hack to make lines less blurry
  context.moveTo(from.x, from.y);
  context.lineTo(to.x, to.y);
  context.stroke();
  context.restore();
}
