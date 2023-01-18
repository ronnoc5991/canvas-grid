import { Position } from "../types/Position";
import Viewport from "./Viewport";
import Vertex from "./Vertex";
import Graph from "./Graph";
import { CIRCLE_CONFIG } from "../config/circle";
import ids from "../config/ids";
import { EditMode } from "../types/EditMode";
import { EdgeVariant } from "../types/EdgeVariant";
import EditModeController from "./EditModeController";

// RESPONSIBILITIES:
// - listen for user input, dispatch events accordingly

export default class Controls {
  private editMode: EditMode;
  private edgeVariant: EdgeVariant;
  private isDragging: boolean;
  private previousMousePosition: Position;
  private bidirectionalRadioButton: HTMLElement;
  private unidirectionalRadioButton: HTMLElement;
  private zoomInButton: HTMLButtonElement;
  private zoomOutButton: HTMLButtonElement;

  constructor(
    private canvas: HTMLCanvasElement,
    private viewport: Viewport,
    private graph: Graph
  ) {
    this.editMode = "exploration";
    new EditModeController((newEditMode) => {
      this.editMode = newEditMode;
    });
    this.edgeVariant = "bidirectional";
    this.isDragging = false;
    this.previousMousePosition = {
      x: 0,
      y: 0,
    };
    this.unidirectionalRadioButton = document.getElementById(
      ids.unidirectionalRadioButton
    ) as HTMLElement;
    this.bidirectionalRadioButton = document.getElementById(
      ids.bidirectionalRadioButton
    ) as HTMLElement;
    this.zoomOutButton = document.getElementById(
      ids.zoomOutButton
    ) as HTMLButtonElement;
    this.zoomInButton = document.getElementById(
      ids.zoomInButton
    ) as HTMLButtonElement;
    this.bidirectionalRadioButton.addEventListener("click", () => {
      this.edgeVariant = "bidirectional";
    });
    this.unidirectionalRadioButton.addEventListener("click", () => {
      this.edgeVariant = "unidirectional";
    });
    this.canvas.addEventListener("wheel", (event) => {
      this.viewport.onScroll(event);
    });
    this.zoomInButton.addEventListener("click", () => {
      this.viewport.onZoomIn();
    });
    this.zoomOutButton.addEventListener("click", () => {
      this.viewport.onZoomOut();
    });
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

  private onMouseDown(event: MouseEvent) {
    switch (this.editMode) {
      case "exploration":
        this.startDrag(event);
        break;
      case "vertex-creation":
        this.createVertex(event);
        break;
      case "edge-creation":
        // this.createEdge(event);
        break;
      default:
      // do nothing
    }
  }

  private onMouseUp() {
    this.stopDrag();
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.isDragging || this.editMode !== "exploration") return;

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
    this.viewport.onDrag(deltaX, deltaY);
  }

  private createVertex({ clientX, clientY }: MouseEvent) {
    const { x, y } = this.canvas.getBoundingClientRect();
    const newVertex = new Vertex({
      x: this.getGlobalXFromLocalX(clientX - x, this.viewport),
      y: this.getGlobalYFromLocalY(clientY - y, this.viewport),
    });
    this.graph.addVertex(newVertex);
  }

  private createEdge({ clientX, clientY }: MouseEvent) {
    const { x, y } = this.canvas.getBoundingClientRect();
    const clickedVertex = this.getClickedVertex({
      x: this.getGlobalXFromLocalX(clientX - x, this.viewport),
      y: this.getGlobalYFromLocalY(clientY - y, this.viewport),
    });
    if (clickedVertex === undefined) return;
    // if (this.fromVertex === null) {
    //   this.fromVertex = clickedVertex;
    // } else {
    //   const euclideanDistance = Math.sqrt(
    //     Math.pow(this.fromVertex.position.x - clickedVertex.position.x, 2) +
    //       Math.pow(this.fromVertex.position.y - clickedVertex.position.y, 2)
    //   );
    //   const newEdge = new Edge(euclideanDistance, [
    //     this.fromVertex,
    //     clickedVertex,
    //   ]);
    //   this.graph.addEdge(newEdge);
    //   this.fromVertex.addEdge(newEdge);
    //   if (this.settings.edgeVariant === "bidirectional")
    //     clickedVertex.addEdge(newEdge);
    //   this.fromVertex = null;
    // }
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

  private getGlobalXFromLocalX(xValue: number, viewport: Viewport): number {
    return (
      viewport.minX +
      (viewport.maxX - viewport.minX) * (xValue / this.canvas.width)
    );
  }

  private getGlobalYFromLocalY(yValue: number, viewport: Viewport): number {
    return (
      viewport.minY +
      (viewport.maxY - viewport.minY) * (yValue / this.canvas.height)
    );
  }

  private setPreviousMousePosition(x: number, y: number) {
    this.previousMousePosition.x = x;
    this.previousMousePosition.y = y;
  }
}
