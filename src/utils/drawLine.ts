import { Position } from "../types/Position";

export default function drawLine(
  from: Position,
  to: Position,
  context: CanvasRenderingContext2D
) {
  context.save();
  context.beginPath();
  context.translate(0.5, 0.5); // weird hack to make lines less blurry
  context.moveTo(from.x, from.y);
  context.lineTo(to.x, to.y);
  context.stroke();
  context.restore();
}
