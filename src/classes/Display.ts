import { Position } from "../types/Position";
import Viewport from "./Viewport";
import Graph from "./graph/Graph";
import Edge from "./graph/Edge";
import { CIRCLE_CONFIG } from "../config/circle";
import { EDGE_CONFIG } from "../config/line";
import drawLine from "../utils/drawLine";
import drawCircle from "../utils/drawCircle";
import { DEFAULT_BLOCK_SIZE } from "../config/constants";

// RESPONSIBILITES:
// - Draw what is inside of the current viewport

export default class Display {
  private context: CanvasRenderingContext2D;

  public constructor(
    private canvas: HTMLCanvasElement,
    private viewport: Viewport,
    private graph: Graph
  ) {
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.viewport.subscribe(this.update.bind(this));
    this.graph.subscribe(this.update.bind(this));
  }

  public update() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid(this.viewport);
    this.drawEdges(this.viewport, this.graph);
    this.drawVertices(this.viewport, this.graph);
  }

  private drawGrid(viewport: Viewport) {
    const xValues: Array<number> = this.getLineValues(
      Math.round(viewport.minX),
      Math.round(viewport.maxX),
      DEFAULT_BLOCK_SIZE
    );
    const yValues: Array<number> = this.getLineValues(
      Math.round(viewport.minY),
      Math.round(viewport.maxY),
      DEFAULT_BLOCK_SIZE
    );

    xValues.forEach((value) => {
      const xValue = this.getLocalXFromGlobalX(value, viewport);
      drawLine(
        { x: xValue, y: 0 },
        { x: xValue, y: this.canvas.height },
        this.context
      );
    });

    yValues.forEach((value) => {
      const yValue = this.getLocalYFromGlobalY(value, viewport);
      drawLine(
        { x: 0, y: yValue },
        { x: this.canvas.width, y: yValue },
        this.context
      );
    });
  }

  private drawEdges(viewport: Viewport, graph: Graph) {
    graph.edges.forEach((edge) => {
      if (!this.isEdgeVisible(edge, viewport)) return;
      const fromPosition: Position = {
        x: this.getLocalXFromGlobalX(edge.vertices[0].position.x, viewport),
        y: this.getLocalYFromGlobalY(edge.vertices[0].position.y, viewport),
      };
      const toPosition: Position = {
        x: this.getLocalXFromGlobalX(edge.vertices[1].position.x, viewport),
        y: this.getLocalYFromGlobalY(edge.vertices[1].position.y, viewport),
      };
      drawLine(fromPosition, toPosition, this.context, EDGE_CONFIG);
    });
  }

  private drawVertices(viewport: Viewport, graph: Graph) {
    graph.vertices.forEach(({ position }) => {
      if (!this.isVertexVisible(position, CIRCLE_CONFIG.radius, viewport))
        return;
      drawCircle(
        {
          x: this.getLocalXFromGlobalX(position.x, viewport),
          y: this.getLocalYFromGlobalY(position.y, viewport),
        },
        CIRCLE_CONFIG,
        this.context
      );
    });
  }

  private getLocalXFromGlobalX(xValue: number, viewport: Viewport): number {
    return (
      this.canvas.width *
      ((xValue - viewport.minX) / (viewport.maxX - viewport.minX))
    );
  }
  private getLocalYFromGlobalY(yValue: number, viewport: Viewport): number {
    return (
      this.canvas.height *
      ((yValue - viewport.minY) / (viewport.maxY - viewport.minY))
    );
  }

  private isVertexVisible(
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

  // TODO: we need to see if any of the "box" that surrounds the edge is visible?
  private isEdgeVisible({ vertices }: Edge, viewport: Viewport) {
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

  private getLineValues(
    min: number,
    max: number,
    blockSize: number
  ): Array<number> {
    let startingValue: number = 0;
    const lineValues: Array<number> = [];

    for (let i = min; i <= max; i++) {
      if (i % blockSize === 0) {
        startingValue = i;
        break;
      }
    }

    for (let i = startingValue; i <= max; i += blockSize) {
      lineValues.push(i);
    }

    return lineValues;
  }
}
