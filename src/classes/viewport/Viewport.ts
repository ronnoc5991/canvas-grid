import { Position } from "../../types/Position";
import MapWindow from "../MapWindow";
import Graph from "../graph/Graph";
import Edge from "../graph/Edge";
import config, { LineConfig } from "./config";

// RESPONSIBILITES:
// - Draw what is inside of the current mapWindow

const DEFAULT_BLOCK_SIZE: number = 25;

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
      const xValue = this.getViewportXFromMapWindowX(value, this.mapWindow);
      this.drawLine(
        { x: xValue, y: 0 },
        { x: xValue, y: this.canvas.height },
        config.grid
      );
    });

    yValues.forEach((value) => {
      const yValue = this.getViewportYFromMapWindowY(value, this.mapWindow);
      this.drawLine(
        { x: 0, y: yValue },
        { x: this.canvas.width, y: yValue },
        config.grid
      );
    });
  }

  private drawEdges() {
    this.graph.edges.forEach((edge) => {
      if (!this.isEdgeVisible(edge, this.mapWindow)) return;
      const fromPosition: Position = {
        x: this.getViewportXFromMapWindowX(
          edge.fromVertex.position.x,
          this.mapWindow
        ),
        y: this.getViewportYFromMapWindowY(
          edge.fromVertex.position.y,
          this.mapWindow
        ),
      };
      const toPosition: Position = {
        x: this.getViewportXFromMapWindowX(
          edge.toVertex.position.x,
          this.mapWindow
        ),
        y: this.getViewportYFromMapWindowY(
          edge.toVertex.position.y,
          this.mapWindow
        ),
      };
      this.drawLine(fromPosition, toPosition, config.edge);
    });
  }

  private drawLine(from: Position, to: Position, config: LineConfig) {
    this.context.save();
    this.context.lineWidth = config.width;
    this.context.strokeStyle = config.color;
    this.context.beginPath();
    this.context.translate(0.5, 0.5); // weird hack to make lines less blurry
    this.context.moveTo(from.x, from.y);
    this.context.lineTo(to.x, to.y);
    this.context.stroke();
    this.context.restore();
  }

  private drawVertices() {
    const scaledVertexRadius = this.scaleWidth(config.vertex.radius);
    this.graph.vertices.forEach(({ position }) => {
      if (!this.isVertexVisible(position, config.vertex.radius, this.mapWindow))
        return;
      this.drawVertex(
        {
          x: this.getViewportXFromMapWindowX(position.x, this.mapWindow),
          y: this.getViewportYFromMapWindowY(position.y, this.mapWindow),
        },
        scaledVertexRadius
      );
    });
  }

  private drawVertex({ x, y }: Position, radius: number) {
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, 2 * Math.PI);
    this.context.save();
    this.context.strokeStyle = config.vertex.stroke.color;
    this.context.lineWidth = config.vertex.stroke.width;
    this.context.fillStyle = config.vertex.fill;
    this.context.translate(0.5, 0.5);
    this.context.fill();
    this.context.stroke();
    this.context.restore();
  }

  private scaleWidth(width: number) {
    return (
      width / ((this.mapWindow.maxX - this.mapWindow.minX) / this.canvas.width)
    );
  }

  private getViewportXFromMapWindowX(
    xValue: number,
    mapWindow: MapWindow
  ): number {
    return (
      this.canvas.width *
      ((xValue - mapWindow.minX) / (mapWindow.maxX - mapWindow.minX))
    );
  }
  private getViewportYFromMapWindowY(
    yValue: number,
    mapWindow: MapWindow
  ): number {
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
  private isEdgeVisible({ fromVertex, toVertex }: Edge, mapWindow: MapWindow) {
    return (
      (fromVertex.position.x > mapWindow.minX &&
        fromVertex.position.x < mapWindow.maxX &&
        fromVertex.position.y > mapWindow.minY &&
        fromVertex.position.y < mapWindow.maxY) ||
      (toVertex.position.x > mapWindow.minX &&
        toVertex.position.x < mapWindow.maxX &&
        toVertex.position.y > mapWindow.minY &&
        toVertex.position.y < mapWindow.maxY)
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
