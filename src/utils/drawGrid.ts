import type { Viewport } from "../types/Viewport";
import { Offset } from "../types/Offset";
import { DEFAULT_BLOCK_SIZE } from "../config/constants";
import getCanvasX from "./getCanvasX";
import getCanvasY from "./getCanvasY";
import drawLine from "./drawLine";

export default function drawGrid(
  viewport: Viewport,
  offset: Offset,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D
) {
  drawHorizontalLines(viewport, offset, canvas, context);
  drawVerticalLines(viewport, offset, canvas, context);
}

function drawVerticalLines(
  viewport: Viewport,
  offset: Offset,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D
) {
  const xValues: Array<number> = [];
  let startingValue;

  for (let i = viewport.minX; i <= viewport.maxX; i++) {
    if (Math.floor(i) % DEFAULT_BLOCK_SIZE === 0) {
      startingValue = i;
      break;
    }
  }

  for (
    let i = startingValue ?? 0;
    i <= viewport.maxX;
    i += DEFAULT_BLOCK_SIZE
  ) {
    xValues.push(i);
  }

  xValues.forEach((value) => {
    const xValue = getCanvasX(value, offset);
    drawLine({ x: xValue, y: 0 }, { x: xValue, y: canvas.height }, context);
  });
}

function drawHorizontalLines(
  viewport: Viewport,
  offset: Offset,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D
) {
  const yValues: Array<number> = [];
  let startingValue;

  for (let i = viewport.minY; i <= viewport.maxY; i++) {
    if (Math.floor(i) % DEFAULT_BLOCK_SIZE === 0) {
      startingValue = i;
      break;
    }
  }

  for (
    let i = startingValue ?? 0;
    i <= viewport.maxY;
    i += DEFAULT_BLOCK_SIZE
  ) {
    yValues.push(i);
  }

  yValues.forEach((value) => {
    const yValue = getCanvasY(value, offset);
    drawLine({ x: 0, y: yValue }, { x: canvas.width, y: yValue }, context);
  });
}
