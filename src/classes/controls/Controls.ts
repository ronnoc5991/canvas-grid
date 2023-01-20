import { Position } from "../../types/Position";
import Graph from "../graph/Graph";
import Edge from "../graph/Edge";
import Vertex from "../graph/Vertex";
import MapWindow from "../MapWindow";
import { CIRCLE_CONFIG } from "../../config/circle";
import { EditMode } from "../../types/EditMode";
import setupEditModeListeners from "./setupEditModeListeners";
import SelectedVertexDisplay from "../SelectedVertexDisplay";
import SidePanel from "../sidePanel/SidePanel";
import setupZoomListeners, { ZoomEvent } from "./setupZoomListeners";

// RESPONSIBILITIES:
// - listen for user input, dispatch events accordingly

export default class Controls {
  private editMode: EditMode;
  private isDragging: boolean;
  private previousMousePosition: Position;
  private fromVertex: Vertex | null;

  private sidePanel: SidePanel | null;

  constructor(
    private canvas: HTMLCanvasElement,
    private graph: Graph,
    private mapWindow: MapWindow
  ) {
    this.editMode = "navigation";
    setupEditModeListeners((newEditMode) => {
      this.editMode = newEditMode;
    });
    setupZoomListeners(canvas, this.onZoom.bind(this));
    this.isDragging = false;
    this.previousMousePosition = {
      x: 0,
      y: 0,
    };
    this.fromVertex = null;
    this.sidePanel = null;

    this.canvas.addEventListener("mousedown", (event) => {
      this.onMouseDown(event);
    });
    this.canvas.addEventListener("mouseup", () => {
      this.onMouseUp();
    });
    this.canvas.addEventListener("mousemove", (event) => {
      this.onMouseMove(event);
    });
  }

  private onZoom(zoomEvent: ZoomEvent) {
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
        this.startDrag(event);
        break;
      case "vertex-creation":
        const newVertex = this.createVertex(event);
        const activeVertex = new SelectedVertexDisplay(newVertex, () => {
          this.deleteVertex(newVertex);
        });
        this.populateSidePanel(activeVertex.rootElement);
        break;
      case "bidirectional-edge-creation":
      case "unidirectional-edge-creation":
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
    if (!this.isDragging || this.editMode !== "navigation") return;

    this.onDrag(event);
  }

  private startDrag({ clientX, clientY }: MouseEvent) {
    this.isDragging = true;
    this.setPreviousMousePosition(clientX, clientY);
  }

  private stopDrag() {
    this.isDragging = false;
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
      x: this.getGlobalXFromLocalX(clientX - x, this.mapWindow),
      y: this.getGlobalYFromLocalY(clientY - y, this.mapWindow),
    });
    return newVertex;
  }

  private populateSidePanel(content: HTMLElement) {
    if (!this.sidePanel) {
      this.sidePanel = new SidePanel(content);
    } else {
      this.sidePanel.populate(content);
    }
  }

  private deleteVertex(vertex: Vertex) {
    this.graph.removeVertex(vertex);
    this.sidePanel?.remove();
    this.sidePanel = null;
  }

  private createEdge({ clientX, clientY }: MouseEvent) {
    const { x, y } = this.canvas.getBoundingClientRect();
    const clickedVertex = this.getClickedVertex({
      x: this.getGlobalXFromLocalX(clientX - x, this.mapWindow),
      y: this.getGlobalYFromLocalY(clientY - y, this.mapWindow),
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
      if (this.editMode === "bidirectional-edge-creation")
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

  private getGlobalXFromLocalX(xValue: number, mapWindow: MapWindow): number {
    return (
      mapWindow.minX +
      (mapWindow.maxX - mapWindow.minX) * (xValue / this.canvas.width)
    );
  }

  private getGlobalYFromLocalY(yValue: number, mapWindow: MapWindow): number {
    return (
      mapWindow.minY +
      (mapWindow.maxY - mapWindow.minY) * (yValue / this.canvas.height)
    );
  }

  private setPreviousMousePosition(x: number, y: number) {
    this.previousMousePosition.x = x;
    this.previousMousePosition.y = y;
  }
}
