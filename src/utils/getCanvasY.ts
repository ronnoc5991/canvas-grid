import type { Offset } from "../types/Offset";

export default function getCanvasY(y: number, offset: Offset): number {
  return y + offset.y;
}
