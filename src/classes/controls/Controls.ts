import { Position } from "../../types/Position";
import Graph from "../graph/Graph";
import Vertex from "../graph/Vertex";
import MapWindow from "../MapWindow";
import PathPlanner from "../PathPlanner";
import SidePanel from "../sidePanel/SidePanel";
import SelectedVertexDisplay from "../SelectedVertexDisplay";
import { EditMode } from "../../types/EditMode";
import setupEditModeListeners from "./setupEditModeListeners";
import setupMouseEventListeners, {
  CustomMouseEvent,
} from "./setupMouseEventListeners";
import viewportConfig from "../viewport/config";

const DEFAULT_EDIT_MODE: EditMode = "navigation";
const DRAGGING_THRESHOLD: number = 5;

// RESPONSIBILITIES:
// - listen for user input, dispatch events accordingly

export default class Controls {
  private editMode: EditMode = DEFAULT_EDIT_MODE;
  private isMouseDown: boolean = false;
  private isDragging: boolean = false;
  private previousMousePosition: Position = { x: 0, y: 0 };
  private fromVertex: Vertex | null = null;
  private pathPlanner: PathPlanner | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private graph: Graph,
    private mapWindow: MapWindow,
    private sidePanel: SidePanel
  ) {
    this.initializeEventListeners();

    const pathPlanningButton = document.getElementById(
      "path-planning-button"
    ) as HTMLButtonElement;
    pathPlanningButton.addEventListener("click", () => {
      this.editMode = "path-planning";
      this.pathPlanner = new PathPlanner(this.graph);
      this.sidePanel.updateContent(this.pathPlanner.rootElement, () => {
        this.pathPlanner = null;
        // need to remove event listenders from pathPlanner things?
      });
    });
  }

  private initializeEventListeners() {
    setupEditModeListeners((newEditMode) => {
      this.editMode = newEditMode;
    });
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

  private onMouseDown(event: MouseEvent) {
    this.isMouseDown = true;
    this.setPreviousMousePosition(event.clientX, event.clientY);
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.isMouseDown) return;
    if (this.isDragging) {
      this.onDrag(event);
      return;
    }
    if (this.hasStartedDragging(event)) {
      this.setPreviousMousePosition(event.clientX, event.clientY);
      this.isDragging = true;
    }
  }

  private onMouseUp({ clientX, clientY }: MouseEvent) {
    const { x, y } = this.canvas.getBoundingClientRect();
    const clickedPosition: Position = {
      x: this.getMapWindowXFromViewportX(clientX - x),
      y: this.getMapWindowYFromViewportY(clientY - y),
    };
    const clickedVertex = this.getClickedVertex(clickedPosition);

    if (this.editMode === "vertex-creation") {
      this.createVertex(clickedPosition);
    } else if (this.editMode === "edge-creation" && !!clickedVertex) {
      this.createEdge(clickedVertex);
    } else if (
      this.editMode === "navigation" &&
      !this.isDragging &&
      !!clickedVertex
    ) {
      this.displaySelectedVertex(clickedVertex);
    } else if (
      this.editMode === "path-planning" &&
      !this.isDragging &&
      !!clickedVertex
    ) {
      this.pathPlanner?.onVertexSelection(clickedVertex);
    }

    this.isMouseDown = false;
    this.isDragging = false;
  }

  private displaySelectedVertex(selectedVertex: Vertex) {
    const selectedVertexDisplay = new SelectedVertexDisplay(
      selectedVertex,
      () => {
        this.deleteVertex(selectedVertex);
        this.sidePanel.close();
      },
      () => {
        this.editMode = "path-planning";
        this.pathPlanner = new PathPlanner(this.graph);
        this.pathPlanner.onVertexSelection(selectedVertex);
        this.sidePanel.updateContent(this.pathPlanner.rootElement, () => {
          this.pathPlanner = null;
          // need to remove event listeners from path planner things
        });
      }
    );

    this.sidePanel.updateContent(selectedVertexDisplay.rootElement, () => {
      selectedVertexDisplay.dispose();
    });
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

  private createVertex(position: Position): Vertex {
    const newVertex = this.graph.createVertex(position);
    return newVertex;
  }

  private deleteVertex(vertex: Vertex) {
    this.graph.removeVertex(vertex);
  }

  // create an edgeCreation class?
  private createEdge(clickedVertex: Vertex) {
    if (this.fromVertex === null) {
      this.fromVertex = clickedVertex;
    } else {
      this.graph.createEdge(this.fromVertex, clickedVertex);
      this.fromVertex = null;
    }
  }

  private getClickedVertex(clickedPosition: Position): Vertex | undefined {
    return this.graph.vertices.find(({ position }) => {
      const leftEdge = position.x - viewportConfig.vertex.radius;
      const rightEdge = position.x + viewportConfig.vertex.radius;
      const topEdge = position.y - viewportConfig.vertex.radius;
      const bottomEdge = position.y + viewportConfig.vertex.radius;
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
