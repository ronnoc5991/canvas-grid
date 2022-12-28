import type { Offset } from "../types/Offset";

export default function getCanvasX(x: number, offset: Offset): number {
  return x + offset.x;
}
