import { Position } from "../types/Position";
import Graph from "./graph/Graph";
import Edge from "./graph/Edge";
import MapWindow from "./MapWindow";
import { CIRCLE_CONFIG } from "../config/circle";
import { EDGE_CONFIG } from "../config/line";
import drawLine from "../utils/drawLine";
import drawCircle from "../utils/drawCircle";
import { DEFAULT_BLOCK_SIZE } from "../config/constants";

// RESPONSIBILITES:
// - Draw what is inside of the current viewport

export default class Viewport {
  private context: CanvasRenderingContext2D;

  public constructor(
    private canvas: HTMLCanvasElement,
    private graph: Graph,
    private mapWindow: MapWindow
  ) {
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.mapWindow.subscribe(this.update.bind(this));
    this.graph.subscribe(this.update.bind(this));
  }

  public update() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
    this.drawEdges();
    this.drawVertices();
  }

  private drawGrid() {
    const xValues: Array<number> = this.getLineValues(
      Math.round(this.mapWindow.minX),
      Math.round(this.mapWindow.maxX),
      DEFAULT_BLOCK_SIZE
    );
    const yValues: Array<number> = this.getLineValues(
      Math.round(this.mapWindow.minY),
      Math.round(this.mapWindow.maxY),
      DEFAULT_BLOCK_SIZE
    );

    xValues.forEach((value) => {
      const xValue = this.getLocalXFromGlobalX(value, this.mapWindow);
      drawLine(
        { x: xValue, y: 0 },
        { x: xValue, y: this.canvas.height },
        this.context
      );
    });

    yValues.forEach((value) => {
      const yValue = this.getLocalYFromGlobalY(value, this.mapWindow);
      drawLine(
        { x: 0, y: yValue },
        { x: this.canvas.width, y: yValue },
        this.context
      );
    });
  }

  private drawEdges() {
    this.graph.edges.forEach((edge) => {
      if (!this.isEdgeVisible(edge, this.mapWindow)) return;
      const fromPosition: Position = {
        x: this.getLocalXFromGlobalX(
          edge.vertices[0].position.x,
          this.mapWindow
        ),
        y: this.getLocalYFromGlobalY(
          edge.vertices[0].position.y,
          this.mapWindow
        ),
      };
      const toPosition: Position = {
        x: this.getLocalXFromGlobalX(
          edge.vertices[1].position.x,
          this.mapWindow
        ),
        y: this.getLocalYFromGlobalY(
          edge.vertices[1].position.y,
          this.mapWindow
        ),
      };
      drawLine(fromPosition, toPosition, this.context, EDGE_CONFIG);
    });
  }

  private drawVertices() {
    this.graph.vertices.forEach(({ position }) => {
      if (!this.isVertexVisible(position, CIRCLE_CONFIG.radius, this.mapWindow))
        return;
      drawCircle(
        {
          x: this.getLocalXFromGlobalX(position.x, this.mapWindow),
          y: this.getLocalYFromGlobalY(position.y, this.mapWindow),
        },
        CIRCLE_CONFIG,
        this.context
      );
    });
  }

  private getLocalXFromGlobalX(xValue: number, mapWindow: MapWindow): number {
    return (
      this.canvas.width *
      ((xValue - mapWindow.minX) / (mapWindow.maxX - mapWindow.minX))
    );
  }
  private getLocalYFromGlobalY(yValue: number, mapWindow: MapWindow): number {
    return (
      this.canvas.height *
      ((yValue - mapWindow.minY) / (mapWindow.maxY - mapWindow.minY))
    );
  }

  private isVertexVisible(
    { x, y }: Position,
    radius: number,
    { minX, maxX, minY, maxY }: MapWindow
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
  private isEdgeVisible({ vertices }: Edge, mapWindow: MapWindow) {
    return (
      (vertices[0].position.x > mapWindow.minX &&
        vertices[0].position.x < mapWindow.maxX &&
        vertices[0].position.y > mapWindow.minY &&
        vertices[0].position.y < mapWindow.maxY) ||
      (vertices[1].position.x > mapWindow.minX &&
        vertices[1].position.x < mapWindow.maxX &&
        vertices[1].position.y > mapWindow.minY &&
        vertices[1].position.y < mapWindow.maxY)
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
