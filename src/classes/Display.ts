import type { Position } from "../types/Position";
import type { Offset } from "../types/Offset";
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

// move to a viewport only model?
// the offset is contained in the viewport... right?
// we can calculate the viewport on each frame, draw everything

export default class Display {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private previousMousePosition: Position;
  private offset: Offset;
  private graph: Graph;
  private settings: Settings;
  private fromVertex: Vertex | null;
  private isDragging: boolean;

  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.previousMousePosition = { x: 0, y: 0 };
    this.offset = { x: 0, y: 0 };
    this.graph = useGraph();
    this.settings = useSettings();
    this.fromVertex = null;
    this.isDragging = false;
    canvas.addEventListener("mousedown", (event) => this.onMouseDown(event));
    canvas.addEventListener("mouseup", () => this.onMouseUp());
    canvas.addEventListener("mousemove", (event) => this.onMouseMove(event));
  }

  public update() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
    this.drawEdges();
    this.drawVertices();
  }

  private drawGrid() {
    const xValues: Array<number> = [];
    const yValues: Array<number> = [];
    let xStartingValue;
    let yStartingValue;

    const minX = 0 - this.offset.x;
    const maxX = minX + this.canvas.width;

    for (let i = minX; i <= maxX; i++) {
      if (i % DEFAULT_BLOCK_SIZE === 0) {
        xStartingValue = i;
        break;
      }
    }

    for (let i = xStartingValue ?? 0; i <= maxX; i += DEFAULT_BLOCK_SIZE) {
      xValues.push(i);
    }

    const minY = 0 - this.offset.y;
    const maxY = minY + this.canvas.height;

    for (let i = minY; i <= maxY; i++) {
      if (Math.floor(i) % DEFAULT_BLOCK_SIZE === 0) {
        yStartingValue = i;
        break;
      }
    }

    for (let i = yStartingValue ?? 0; i <= maxY; i += DEFAULT_BLOCK_SIZE) {
      yValues.push(i);
    }

    xValues.forEach((value) => {
      const xValue = this.getCanvasX(value);
      drawLine(
        { x: xValue, y: 0 },
        { x: xValue, y: this.canvas.height },
        this.context
      );
    });

    yValues.forEach((value) => {
      const yValue = this.getCanvasY(value);
      drawLine(
        { x: 0, y: yValue },
        { x: this.canvas.width, y: yValue },
        this.context
      );
    });
  }

  private drawEdges() {
    const minX = 0 - this.offset.x;
    const maxX = minX + this.canvas.width;
    const minY = 0 - this.offset.y;
    const maxY = minY + this.canvas.height;
    const viewport: Viewport = { minX, maxX, minY, maxY };
    this.graph.edges.forEach((edge) => {
      if (!isEdgeVisible(edge, viewport)) return;
      const fromPosition: Position = {
        x: edge.vertices[0].position.x + this.offset.x,
        y: edge.vertices[0].position.y + this.offset.y,
      };
      const toPosition: Position = {
        x: edge.vertices[1].position.x + this.offset.x,
        y: edge.vertices[1].position.y + this.offset.y,
      };
      drawLine(fromPosition, toPosition, this.context, EDGE_CONFIG);
    });
  }

  private drawVertices() {
    const minX = 0 - this.offset.x;
    const maxX = minX + this.canvas.width;
    const minY = 0 - this.offset.y;
    const maxY = minY + this.canvas.height;
    this.graph.vertices.forEach(({ position }) => {
      if (
        !isVertexVisible(position, CIRCLE_CONFIG.radius, {
          minX,
          maxX,
          minY,
          maxY,
        })
      )
        return;
      drawCircle(
        { x: position.x + this.offset.x, y: position.y + this.offset.y },
        CIRCLE_CONFIG,
        this.context
      );
    });
  }

  private getCanvasX(xValue: number): number {
    return xValue + this.offset.x;
    // return (
    //   this.canvas.width * (xValue / (this.viewport.maxX - this.viewport.minX)) -
    //   this.viewport.minX
    // );
  }

  private getCanvasY(yValue: number): number {
    return yValue + this.offset.y;
    // return (
    //   this.canvas.height *
    //     (yValue / (this.viewport.maxY - this.viewport.minY)) -
    //   this.viewport.minY
    // );
  }

  private onMouseDown({ clientX, clientY }: MouseEvent) {
    if (this.settings.getEditMode() == "exploration") {
      this.isDragging = true;
      this.previousMousePosition.x = clientX;
      this.previousMousePosition.y = clientY;
    } else if (this.settings.getEditMode() == "vertex-creation") {
      const { x, y } = this.canvas.getBoundingClientRect();
      // TODO: should we just pass in coordinates for a new vertex to graph?
      const newVertex = new Vertex({
        x: clientX - x - this.offset.x,
        y: clientY - y - this.offset.y,
      });
      this.graph.addVertex(newVertex);
    } else if (this.settings.getEditMode() === "edge-creation") {
      const { x, y } = this.canvas.getBoundingClientRect();
      const clickedVertex = getClickedVertex(
        { x: clientX - x - this.offset.x, y: clientY - y - this.offset.y },
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
        // TODO: should we just tell the graph to make the new edge?
        // fromVertex, toVertex ...edgeVariant?
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

  private onMouseUp() {
    this.isDragging = false;
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

    this.offset.x += deltaX;
    this.offset.y += deltaY;
  }
}
