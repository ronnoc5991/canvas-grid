import { Position } from "../../types/Position";
import Graph from "../graph/Graph";
import Vertex from "../graph/Vertex";
import MapWindow from "../MapWindow";
import { CIRCLE_CONFIG } from "../../config/circle";
import { EditMode } from "../../types/EditMode";
import setupEditModeListeners from "./setupEditModeListeners";
import setupZoomListeners, { ZoomEvent } from "./setupZoomListeners";
import setupMouseEventListeners, {
  CustomMouseEvent,
} from "./setupMouseEventListeners";

const DEFAULT_EDIT_MODE: EditMode = "navigation";
const DRAGGING_THRESHOLD: number = 5;

// RESPONSIBILITIES:
// - listen for user input, dispatch events accordingly

export default class Controls {
  private editMode: EditMode;
  private isMouseDown: boolean;
  private isDragging: boolean;
  private previousMousePosition: Position;
  private fromVertex: Vertex | null;

  // if we click the directions button, we can put the selected Vertex into the startingVertex position
  // private startingVertex: Vertex | null;

  constructor(
    private canvas: HTMLCanvasElement,
    private graph: Graph,
    private mapWindow: MapWindow
  ) {
    this.editMode = DEFAULT_EDIT_MODE;
    this.isMouseDown = false;
    this.isDragging = false;
    this.previousMousePosition = {
      x: 0,
      y: 0,
    };
    this.fromVertex = null;
    this.initializeEventListeners();
  }

  private initializeEventListeners() {
    setupEditModeListeners((newEditMode) => {
      this.editMode = newEditMode;
    });
    setupZoomListeners(this.canvas, this.onZoomEvent.bind(this));
    setupMouseEventListeners(this.canvas, this.onMouseEvent.bind(this));
  }

  private onMouseEvent({ source, event }: CustomMouseEvent) {
    switch (source) {
      case "mousedown":
        this.onMouseDown(event);
        break;
      case "mousemove":
        this.onMouseMove(event);
        break;
      case "mouseup":
        this.onMouseUp(event);
        break;
      default:
      // do nothing
    }
  }

  private onZoomEvent(zoomEvent: ZoomEvent) {
    switch (zoomEvent.source) {
      case "wheel":
        this.mapWindow.onScroll(zoomEvent.event);
        break;
      case "zoomIn":
        this.mapWindow.onZoomIn();
        break;
      case "zoomOut":
        this.mapWindow.onZoomOut();
        break;
      default:
      // do nothing
    }
  }

  private onMouseDown(event: MouseEvent) {
    switch (this.editMode) {
      case "navigation":
        this.setPreviousMousePosition(event.clientX, event.clientY);
        this.isMouseDown = true;
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

  private onMouseUp({ clientX, clientY }: MouseEvent) {
    if (this.editMode === "navigation" && !this.isDragging) {
      const { x, y } = this.canvas.getBoundingClientRect();

      const clickedVertex = this.getClickedVertex({
        x: this.getMapWindowXFromViewportX(clientX - x),
        y: this.getMapWindowYFromViewportY(clientY - y),
      });

      console.log(clickedVertex);
      // we will want to populate the side panel with this vertex
    }

    this.isMouseDown = false;
    this.isDragging = false;
  }

  private onMouseMove(event: MouseEvent) {
    if (this.editMode !== "navigation" || !this.isMouseDown) return;
    if (this.isDragging) {
      this.onDrag(event);
      return;
    }
    const hasStartedDragging = this.hasStartedDragging(event);
    if (hasStartedDragging) {
      this.setPreviousMousePosition(event.clientX, event.clientY);
      this.isDragging = true;
    }
  }

  private hasStartedDragging({ clientX, clientY }: MouseEvent): boolean {
    return (
      Math.abs(clientX - this.previousMousePosition.x) > DRAGGING_THRESHOLD ||
      Math.abs(clientY - this.previousMousePosition.y) > DRAGGING_THRESHOLD
    );
  }

  private onDrag({ clientX, clientY }: MouseEvent) {
    const deltaX = clientX - this.previousMousePosition.x;
    const deltaY = clientY - this.previousMousePosition.y;

    this.setPreviousMousePosition(clientX, clientY);
    this.mapWindow.onDrag(deltaX, deltaY);
  }

  private createVertex({ clientX, clientY }: MouseEvent): Vertex {
    const { x, y } = this.canvas.getBoundingClientRect();
    const newVertex = this.graph.createVertex({
      x: this.getMapWindowXFromViewportX(clientX - x),
      y: this.getMapWindowYFromViewportY(clientY - y),
    });
    return newVertex;
  }

  // private deleteVertex(vertex: Vertex) {
  //   this.graph.removeVertex(vertex);
  // }

  private createEdge({ clientX, clientY }: MouseEvent) {
    const { x, y } = this.canvas.getBoundingClientRect();
    const clickedVertex = this.getClickedVertex({
      x: this.getMapWindowXFromViewportX(clientX - x),
      y: this.getMapWindowYFromViewportY(clientY - y),
    });
    if (clickedVertex === undefined) return;
    if (this.fromVertex === null) {
      this.fromVertex = clickedVertex;
    } else {
      this.graph.createEdge(this.fromVertex, clickedVertex);
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

  private getMapWindowXFromViewportX(xValue: number) {
    return (
      this.mapWindow.minX +
      (this.mapWindow.maxX - this.mapWindow.minX) * (xValue / this.canvas.width)
    );
  }

  private getMapWindowYFromViewportY(yValue: number): number {
    return (
      this.mapWindow.minY +
      (this.mapWindow.maxY - this.mapWindow.minY) *
        (yValue / this.canvas.height)
    );
  }

  private setPreviousMousePosition(x: number, y: number) {
    this.previousMousePosition.x = x;
    this.previousMousePosition.y = y;
  }
}
