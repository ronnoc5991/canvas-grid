import type { Position } from "../types/Position";
import Graph from "./Graph";
import useGraph from "../hooks/useGraph";
import drawLine from "../utils/drawLine";
import { DEFAULT_BLOCK_SIZE } from "../config/constants";
import Settings from "./Settings";
import useSettings from "../hooks/useSettings";
import Vertex from "./Vertex";
import getClickedVertex from "../utils/getClickedVertex";
import { CIRCLE_CONFIG } from "../config/circle";
import Edge from "./Edge";
import { Viewport } from "../types/Viewport";
import { EDGE_CONFIG } from "../config/line";
import { isEdgeVisible } from "../utils/drawEdges";
import { isVertexVisible } from "../utils/drawVertices";
import drawCircle from "../utils/drawCircle";

// There is one coordinate system
// We represent that coordinate system at different scales
// In order to do this, we have to translate between "canvas" coordinates (used for drawing on the canvas) and the "real" coordinates (used for positions)

// calculate the previous center position
// calculate the new viewport dimensions
// position the viewport so as to maintain the center position
// translate the item positions from underlying grid to canvas dimensions:
// itemX / viewportWiddth = itemCanvasWidth / canvasWidth

export default class Display {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private previousMousePosition: Position;
  private graph: Graph;
  private settings: Settings;
  private fromVertex: Vertex | null;
  private isDragging: boolean;
  private viewport: Viewport;

  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.previousMousePosition = { x: 0, y: 0 };
    this.graph = useGraph();
    this.settings = useSettings();
    this.fromVertex = null;
    this.isDragging = false;
    this.viewport = {
      minX: 0,
      maxX: canvas.width,
      minY: 0,
      maxY: canvas.height,
    };
    this.settings.subscribeToZoom((zoomPercentage) =>
      this.updateViewport(zoomPercentage)
    );
    canvas.addEventListener("mousedown", (event) => this.onMouseDown(event));
    canvas.addEventListener("mouseup", () => this.onMouseUp());
    canvas.addEventListener("mousemove", (event) => this.onMouseMove(event));
    window.addEventListener("resize", () => {
      // TODO: these are garbage
      this.viewport.minX = 0;
      this.viewport.maxX = canvas.width;
      this.viewport.minY = 0;
      this.viewport.maxY = canvas.height;
    });
  }

  public update() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
    this.drawEdges();
    this.drawVertices();
  }

  private updateViewport(zoomPercentage: number) {
    const previousWidth = this.viewport.maxX - this.viewport.minX;
    const previousHeight = this.viewport.maxY - this.viewport.minY;

    const newWidth = Math.round(this.canvas.width * (100 / zoomPercentage));
    const newHeight = Math.round(this.canvas.height * (100 / zoomPercentage));

    const halfDeltaX = Math.round((newWidth - previousWidth) / 2);
    const halfDeltaY = Math.round((newHeight - previousHeight) / 2);

    this.viewport.minX -= halfDeltaX;
    this.viewport.maxX += halfDeltaX;
    this.viewport.minY -= halfDeltaY;
    this.viewport.maxY += halfDeltaY;
  }

  private drawGrid() {
    const xValues: Array<number> = [];
    const yValues: Array<number> = [];
    let xStartingValue;
    let yStartingValue;

    for (let i = this.viewport.minX; i <= this.viewport.maxX; i++) {
      if (i % DEFAULT_BLOCK_SIZE === 0) {
        xStartingValue = i;
        break;
      }
    }

    for (
      let i = xStartingValue ?? 0;
      i <= this.viewport.maxX;
      i += DEFAULT_BLOCK_SIZE
    ) {
      xValues.push(i);
    }

    for (let i = this.viewport.minY; i <= this.viewport.maxY; i++) {
      if (i % DEFAULT_BLOCK_SIZE === 0) {
        yStartingValue = i;
        break;
      }
    }

    for (
      let i = yStartingValue ?? 0;
      i <= this.viewport.maxY;
      i += DEFAULT_BLOCK_SIZE
    ) {
      yValues.push(i);
    }

    xValues.forEach((value) => {
      const xValue = this.getCanvasXFromRealX(value);
      drawLine(
        { x: xValue, y: 0 },
        { x: xValue, y: this.canvas.height },
        this.context
      );
    });

    yValues.forEach((value) => {
      const yValue = this.getCanvasYFromRealY(value);
      drawLine(
        { x: 0, y: yValue },
        { x: this.canvas.width, y: yValue },
        this.context
      );
    });
  }

  private drawEdges() {
    this.graph.edges.forEach((edge) => {
      if (!isEdgeVisible(edge, this.viewport)) return;
      const fromPosition: Position = {
        x: this.getCanvasXFromRealX(edge.vertices[0].position.x),
        y: this.getCanvasYFromRealY(edge.vertices[0].position.y),
      };
      const toPosition: Position = {
        x: this.getCanvasXFromRealX(edge.vertices[1].position.x),
        y: this.getCanvasYFromRealY(edge.vertices[1].position.y),
      };
      drawLine(fromPosition, toPosition, this.context, EDGE_CONFIG);
    });
  }

  private drawVertices() {
    this.graph.vertices.forEach(({ position }) => {
      if (!isVertexVisible(position, CIRCLE_CONFIG.radius, this.viewport))
        return;
      drawCircle(
        {
          x: this.getCanvasXFromRealX(position.x),
          y: this.getCanvasYFromRealY(position.y),
        },
        CIRCLE_CONFIG,
        this.context
      );
    });
  }

  // translate "real" coordinates into canvas coordinates
  private getCanvasXFromRealX(xValue: number): number {
    return (
      this.canvas.width *
      ((xValue - this.viewport.minX) /
        (this.viewport.maxX - this.viewport.minX))
    );
  }

  private getCanvasYFromRealY(yValue: number): number {
    return (
      this.canvas.height *
      ((yValue - this.viewport.minY) /
        (this.viewport.maxY - this.viewport.minY))
    );
  }

  // translate canvas coordinates into real coordinates
  private getRealXFromCanvasX(xValue: number): number {
    return (
      this.viewport.minX +
      (this.viewport.maxX - this.viewport.minX) * (xValue / this.canvas.width)
    );
  }

  private getRealYFromCanvasY(yValue: number): number {
    return (
      this.viewport.minY +
      (this.viewport.maxY - this.viewport.minY) * (yValue / this.canvas.height)
    );
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

  private onMouseMove(event: MouseEvent) {
    if (!this.isDragging || this.settings.getEditMode() !== "exploration")
      return;

    const currentMousePosition: Position = {
      x: event.clientX,
      y: event.clientY,
    };
    const deltaX = currentMousePosition.x - this.previousMousePosition.x;
    const deltaY = currentMousePosition.y - this.previousMousePosition.y;
    this.previousMousePosition.x = currentMousePosition.x;
    this.previousMousePosition.y = currentMousePosition.y;

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
      x: this.getRealXFromCanvasX(clientX - x),
      y: this.getRealYFromCanvasY(clientY - y),
    });
    this.graph.addVertex(newVertex);
  }

  private createEdge({ clientX, clientY }: MouseEvent) {
    const { x, y } = this.canvas.getBoundingClientRect();
    const clickedVertex = getClickedVertex(
      {
        x: this.getRealXFromCanvasX(clientX - x),
        y: this.getRealYFromCanvasY(clientY - y),
      },
      this.graph.vertices,
      CIRCLE_CONFIG.radius
    );

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
}
