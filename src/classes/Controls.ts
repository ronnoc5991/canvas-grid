import ids from "../config/ids";
import Vertex from "./Vertex";
import { CIRCLE_CONFIG } from "../config/circle";
import { Position } from "../types/Position";
import Viewport from "./Viewport";
import Settings from "./Settings";
import Graph from "./Graph";

// TODO: Creat the Control center...
// that could have subclasses that handle some of the logic?

// TODO: Combine Controls and Settings?
// Controls is just a bunch of event listeners
// it also makes the decisions as to what is allowed
// to make those decisions, it needs to know about the settings, the graph and the viewport

// RESPONSIBILITIES:
// - translate user input into state changes
// - or is it to CAPTURE user input and dispatch that to the correct parties?
// we DO need a decision maker, one to combine the state of all the classes and decide what to do

export default class Controls {
  private explorationButton: HTMLButtonElement;
  private vertexCreationButton: HTMLButtonElement;
  private edgeCreationButton: HTMLButtonElement;
  private unidirectionalRadioButton: HTMLElement;
  private bidirectionalRadioButton: HTMLElement;
  private zoomInButton: HTMLButtonElement;
  private zoomOutButton: HTMLButtonElement;

  constructor(
    private canvas: HTMLCanvasElement,
    private settings: Settings,
    private viewport: Viewport,
    private graph: Graph
  ) {
    this.explorationButton = document.getElementById(
      ids.explorationButton
    ) as HTMLButtonElement;
    this.vertexCreationButton = document.getElementById(
      ids.vertexCreationButton
    ) as HTMLButtonElement;
    this.edgeCreationButton = document.getElementById(
      ids.edgeCreationButton
    ) as HTMLButtonElement;
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

    this.explorationButton.addEventListener("click", () => {
      this.settings.editMode = "exploration";
    });
    this.vertexCreationButton?.addEventListener("click", () => {
      this.settings.editMode = "vertex-creation";
    });
    this.edgeCreationButton?.addEventListener("click", () => {
      this.settings.editMode = "edge-creation";
    });
    this.bidirectionalRadioButton.addEventListener("click", () => {
      this.settings.edgeVariant = "bidirectional";
    });
    this.unidirectionalRadioButton.addEventListener("click", () => {
      this.settings.edgeVariant = "unidirectional";
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
    switch (this.settings.editMode) {
      case "exploration":
        this.startDrag(event);
        break;
      case "vertex-creation":
        // this.createVertex(event);
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
    if (!this.settings.isDragging || this.settings.editMode !== "exploration")
      return;

    this.onDrag(event);
  }

  private startDrag({ clientX, clientY }: MouseEvent) {
    this.settings.isDragging = true;
    this.settings.setPreviousMousePosition(clientX, clientY);
  }

  private stopDrag() {
    this.settings.isDragging = false;
  }

  private onDrag({ clientX, clientY }: MouseEvent) {
    const { previousMousePosition } = this.settings;
    const deltaX = clientX - previousMousePosition.x;
    const deltaY = clientY - previousMousePosition.y;

    this.settings.setPreviousMousePosition(clientX, clientY);
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
}
