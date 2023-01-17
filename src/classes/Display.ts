import type { Position } from "../types/Position";
import Graph from "./Graph";
import useGraph from "../hooks/useGraph";
import drawLine from "../utils/drawLine";
import {
  DEFAULT_BLOCK_SIZE,
  DEFAULT_ZOOM_PERCENTAGE,
  MAX_ZOOM_PERCENTAGE,
  MIN_ZOOM_PERCENTAGE,
} from "../config/constants";
import Settings from "./Settings";
import useSettings from "../hooks/useSettings";
import Vertex from "./Vertex";
import { CIRCLE_CONFIG } from "../config/circle";
import Edge from "./Edge";
import { Viewport } from "../types/Viewport";
import { EDGE_CONFIG } from "../config/line";
import drawCircle from "../utils/drawCircle";

// settings need to be able to update the zoomPercentage as well...

export default class Display {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private graph: Graph;
  private settings: Settings;
  private viewport: Viewport;
  private zoomPercentage: number; // should this actually live in the settings?
  // what are the settings?
  // the settings should be any variable that the user is able to change
  // the settings do impact what we display...
  private fromVertex: Vertex | null;
  private isDragging: boolean;
  private previousMousePosition: Position;

  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.graph = useGraph();
    this.settings = useSettings();
    this.viewport = {
      minX: 0,
      maxX: canvas.width,
      minY: 0,
      maxY: canvas.height,
    };
    this.zoomPercentage = DEFAULT_ZOOM_PERCENTAGE;
    this.fromVertex = null;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    canvas.addEventListener("mousedown", (event) => this.onMouseDown(event));
    canvas.addEventListener("mouseup", () => this.onMouseUp());
    canvas.addEventListener("mousemove", (event) => this.onMouseMove(event));
    window.addEventListener("resize", () => {
      this.updateViewport(
        this.zoomPercentage,
        this.canvas.width,
        this.canvas.height
      );
    });
    canvas.addEventListener("wheel", (event) => {
      // should this be done in settings/controls?
      this.onScroll(event);
    });
  }

  public update() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
    this.drawEdges();
    this.drawVertices();
  }

  // TODO: more descriptive/better name for this?
  // TODO: make this onZoom, move zoomPercentage to settings
  // call this as a callback when the zoomPercentage changes?
  private updateViewport(
    zoomPercentage: number,
    mouseX: number,
    mouseY: number
  ) {
    const horizontalMouseFactor = mouseX / window.innerWidth;
    const verticalMouseFactor = mouseY / window.innerHeight;

    const previousWidth = this.viewport.maxX - this.viewport.minX;
    const previousHeight = this.viewport.maxY - this.viewport.minY;

    const newWidth = Math.round(
      this.canvas.width * (DEFAULT_ZOOM_PERCENTAGE / zoomPercentage)
    );
    const newHeight = Math.round(
      this.canvas.height * (DEFAULT_ZOOM_PERCENTAGE / zoomPercentage)
    );

    const deltaX = newWidth - previousWidth;
    const deltaY = newHeight - previousHeight;

    const minXDelta = deltaX * horizontalMouseFactor;
    const maxXDelta = deltaX - minXDelta;
    const minYDelta = deltaY * verticalMouseFactor;
    const maxYDelta = deltaY - minYDelta;

    this.viewport.minX -= minXDelta;
    this.viewport.maxX += maxXDelta;
    this.viewport.minY -= minYDelta;
    this.viewport.maxY += maxYDelta;
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

  private drawGrid() {
    const xValues: Array<number> = this.getLineValues(
      Math.round(this.viewport.minX),
      Math.round(this.viewport.maxX),
      DEFAULT_BLOCK_SIZE
    );
    const yValues: Array<number> = this.getLineValues(
      Math.round(this.viewport.minY),
      Math.round(this.viewport.maxY),
      DEFAULT_BLOCK_SIZE
    );

    xValues.forEach((value) => {
      const xValue = this.getLocalXFromGlobalX(value);
      drawLine(
        { x: xValue, y: 0 },
        { x: xValue, y: this.canvas.height },
        this.context
      );
    });

    yValues.forEach((value) => {
      const yValue = this.getLocalYFromGlobalY(value);
      drawLine(
        { x: 0, y: yValue },
        { x: this.canvas.width, y: yValue },
        this.context
      );
    });
  }

  private drawEdges() {
    this.graph.edges.forEach((edge) => {
      if (!this.isEdgeVisible(edge, this.viewport)) return;
      const fromPosition: Position = {
        x: this.getLocalXFromGlobalX(edge.vertices[0].position.x),
        y: this.getLocalYFromGlobalY(edge.vertices[0].position.y),
      };
      const toPosition: Position = {
        x: this.getLocalXFromGlobalX(edge.vertices[1].position.x),
        y: this.getLocalYFromGlobalY(edge.vertices[1].position.y),
      };
      drawLine(fromPosition, toPosition, this.context, EDGE_CONFIG);
    });
  }

  private drawVertices() {
    this.graph.vertices.forEach(({ position }) => {
      if (!this.isVertexVisible(position, CIRCLE_CONFIG.radius, this.viewport))
        return;
      drawCircle(
        {
          x: this.getLocalXFromGlobalX(position.x),
          y: this.getLocalYFromGlobalY(position.y),
        },
        CIRCLE_CONFIG,
        this.context
      );
    });
  }

  private getLocalXFromGlobalX(xValue: number): number {
    return (
      this.canvas.width *
      ((xValue - this.viewport.minX) /
        (this.viewport.maxX - this.viewport.minX))
    );
  }
  private getLocalYFromGlobalY(yValue: number): number {
    return (
      this.canvas.height *
      ((yValue - this.viewport.minY) /
        (this.viewport.maxY - this.viewport.minY))
    );
  }

  private getGlobalXFromLocalX(xValue: number): number {
    return (
      this.viewport.minX +
      (this.viewport.maxX - this.viewport.minX) * (xValue / this.canvas.width)
    );
  }

  private getGlobalYFromLocalY(yValue: number): number {
    return (
      this.viewport.minY +
      (this.viewport.maxY - this.viewport.minY) * (yValue / this.canvas.height)
    );
  }

  // This could be moved to controls?
  private onScroll({ deltaY, clientX, clientY }: WheelEvent) {
    if (
      (deltaY > 0 && this.zoomPercentage <= MIN_ZOOM_PERCENTAGE) ||
      (deltaY < 0 && this.zoomPercentage >= MAX_ZOOM_PERCENTAGE)
    )
      return;
    if (deltaY > 0 && this.zoomPercentage > MIN_ZOOM_PERCENTAGE) {
      this.zoomPercentage -= 1;
    } else if (deltaY < 0 && this.zoomPercentage < MAX_ZOOM_PERCENTAGE) {
      this.zoomPercentage += 1;
    }
    this.updateViewport(this.zoomPercentage, clientX, clientY);
  }

  private onMouseDown(event: MouseEvent) {
    const editMode = this.settings.getEditMode();

    switch (editMode) {
      case "exploration":
        this.startDrag(event);
        break;
      case "vertex-creation":
        this.createVertex(event);
        break;
      case "edge-creation":
        this.createEdge(event);
        break;
      default:
      // do nothing
    }
  }

  private onMouseUp() {
    this.stopDrag();
  }

  private onMouseMove({ clientX, clientY }: MouseEvent) {
    if (!this.isDragging || this.settings.getEditMode() !== "exploration")
      return;

    const zoomDivisor = this.zoomPercentage / DEFAULT_ZOOM_PERCENTAGE;
    const deltaX = (clientX - this.previousMousePosition.x) / zoomDivisor;
    const deltaY = (clientY - this.previousMousePosition.y) / zoomDivisor;

    this.previousMousePosition.x = clientX;
    this.previousMousePosition.y = clientY;

    this.viewport.minX -= deltaX;
    this.viewport.maxX -= deltaX;
    this.viewport.minY -= deltaY;
    this.viewport.maxY -= deltaY;
  }

  private startDrag({ clientX, clientY }: MouseEvent) {
    this.isDragging = true;
    this.previousMousePosition.x = clientX;
    this.previousMousePosition.y = clientY;
  }

  private stopDrag() {
    this.isDragging = false;
  }

  private createVertex({ clientX, clientY }: MouseEvent) {
    const { x, y } = this.canvas.getBoundingClientRect();
    const newVertex = new Vertex({
      x: this.getGlobalXFromLocalX(clientX - x),
      y: this.getGlobalYFromLocalY(clientY - y),
    });
    this.graph.addVertex(newVertex);
  }

  private createEdge({ clientX, clientY }: MouseEvent) {
    const { x, y } = this.canvas.getBoundingClientRect();
    const clickedVertex = this.getClickedVertex({
      x: this.getGlobalXFromLocalX(clientX - x),
      y: this.getGlobalYFromLocalY(clientY - y),
    });

    if (clickedVertex === undefined) return;

    if (this.fromVertex === null) {
      this.fromVertex = clickedVertex;
    } else {
      const euclideanDistance = Math.sqrt(
        Math.pow(this.fromVertex.position.x - clickedVertex.position.x, 2) +
          Math.pow(this.fromVertex.position.y - clickedVertex.position.y, 2)
      );
      const newEdge = new Edge(euclideanDistance, [
        this.fromVertex,
        clickedVertex,
      ]);
      this.graph.addEdge(newEdge);

      this.fromVertex.addEdge(newEdge);
      if (this.settings.getEdgeVariant() === "bidirectional")
        clickedVertex.addEdge(newEdge);

      this.fromVertex = null;
    }
  }

  private getClickedVertex(clickedPosition: Position): Vertex | undefined {
    return this.graph.vertices.find(({ position }) => {
      const leftEdge = position.x - CIRCLE_CONFIG.radius;
      const rightEdge = position.x + CIRCLE_CONFIG.radius;
      const topEdge = position.y - CIRCLE_CONFIG.radius;
      const bottomEdge = position.y + CIRCLE_CONFIG.radius;
      return (
        clickedPosition.x >= leftEdge &&
        clickedPosition.x <= rightEdge &&
        clickedPosition.y >= topEdge &&
        clickedPosition.y <= bottomEdge
      );
    });
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

  // TODO: This is not the best way to do this...
  // instead, we need to see if any of the "box" that surrounds the edge is visible?
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
}
