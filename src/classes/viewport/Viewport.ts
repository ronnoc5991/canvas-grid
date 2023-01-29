import { Position } from "../../types/Position";
import MapWindow from "../MapWindow";
import Graph from "../graph/Graph";
import Edge from "../graph/Edge";
import config from "./config";
import drawLine from "../../utils/drawLine";

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
    const gridLines: Array<{ from: Position; to: Position }> = [];
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
      const xValue = this.getViewportXFromMapWindowX(value);

      gridLines.push({
        from: { x: xValue, y: 0 },
        to: { x: xValue, y: this.canvas.height },
      });
    });

    yValues.forEach((value) => {
      const yValue = this.getViewportYFromMapWindowY(value);

      gridLines.push({
        from: { x: 0, y: yValue },
        to: { x: this.canvas.width, y: yValue },
      });
    });

    this.context.save();
    this.context.lineWidth = config.grid.width;
    this.context.strokeStyle = config.grid.color;

    gridLines.forEach((line) => {
      drawLine(line.from, line.to, this.context);
    });

    this.context.restore();
  }

  private drawEdges() {
    this.graph.edges.forEach((edge) => {
      if (!this.isEdgeVisible(edge, this.mapWindow)) return;
      this.drawEdge(edge);
    });
  }

  private drawEdge(edge: Edge) {
    const fromPosition = this.getViewportPositionFromMapWindowPosition(
      edge.vertices[0].position
    );
    const toPosition = this.getViewportPositionFromMapWindowPosition(
      edge.vertices[1].position
    );
    this.drawBezierCurve(
      fromPosition,
      this.getViewportPositionFromMapWindowPosition(edge.controlPointOne),
      this.getViewportPositionFromMapWindowPosition(edge.controlPointTwo),
      toPosition
    );

    if (edge.isBeingEdited) {
      this.drawEdgeControlPoint(
        this.getViewportPositionFromMapWindowPosition(edge.controlPointOne),
        fromPosition
      );
      this.drawEdgeControlPoint(
        this.getViewportPositionFromMapWindowPosition(edge.controlPointTwo),
        toPosition
      );
    }
  }

  private drawEdgeControlPoint(
    controlPoint: Position,
    connectedPoint: Position
  ) {
    this.context.save();
    this.context.lineWidth = config.edge.width;
    this.context.strokeStyle = config.edge.color;
    drawLine(controlPoint, connectedPoint, this.context);
    this.drawVertex(controlPoint, 4);
    this.context.restore();
  }

  private drawBezierCurve(
    start: Position,
    controlPointOne: Position,
    controlPointTwo: Position,
    end: Position
  ) {
    this.context.beginPath();
    this.context.moveTo(start.x, start.y);
    this.context.bezierCurveTo(
      controlPointOne.x,
      controlPointOne.y,
      controlPointTwo.x,
      controlPointTwo.y,
      end.x,
      end.y
    );
    this.context.stroke();
  }

  private drawVertices() {
    const scaledVertexRadius = this.scaleWidth(config.vertex.radius);
    this.graph.vertices.forEach(({ position }) => {
      if (!this.isVertexVisible(position, config.vertex.radius, this.mapWindow))
        return;
      this.drawVertex(
        {
          x: this.getViewportXFromMapWindowX(position.x),
          y: this.getViewportYFromMapWindowY(position.y),
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

  private getViewportPositionFromMapWindowPosition({ x, y }: Position) {
    return {
      x: this.getViewportXFromMapWindowX(x),
      y: this.getViewportYFromMapWindowY(y),
    };
  }

  private getViewportXFromMapWindowX(xValue: number): number {
    return (
      this.canvas.width *
      ((xValue - this.mapWindow.minX) /
        (this.mapWindow.maxX - this.mapWindow.minX))
    );
  }
  private getViewportYFromMapWindowY(yValue: number): number {
    return (
      this.canvas.height *
      ((yValue - this.mapWindow.minY) /
        (this.mapWindow.maxY - this.mapWindow.minY))
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
  // does the edge contain an x in the y range or a y in the x range?
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
