import { Position } from "../types/Position";
import Graph from "./graph/Graph";
import MapWindow from "./MapWindow";
import Vertex from "./graph/Vertex";
import SidePanel from "./sidePanel/SidePanel";
import PathEditor from "./PathEditor";
import VertexEditor from "./VertexEditor";
import EdgeEditor from "./EdgeEditor";
import { EditMode } from "../types/EditMode";
import viewportConfig from "./viewport/config";

const DEFAULT_EDIT_MODE: EditMode = "navigation";
const DRAGGING_THRESHOLD: number = 5;

// RESPONSIBILITIES:
// - listen for user input, dispatch events accordingly

// TODO: Need to switch back to navigation mode after exiting other modes...
// there is no more navigation mode button

export default class Controls {
  private editMode: EditMode = DEFAULT_EDIT_MODE;
  private isMouseDown: boolean = false;
  private isDragging: boolean = false;
  private previousMousePosition: Position = { x: 0, y: 0 };
  private sidePanel: SidePanel;
  private vertexEditor: VertexEditor | null = null;
  private edgeEditor: EdgeEditor | null = null;
  private pathEditor: PathEditor | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private graph: Graph,
    private mapWindow: MapWindow
  ) {
    this.sidePanel = new SidePanel();
    const vertexCreationButton = document.getElementById(
      "vertex-creation-button"
    );
    if (vertexCreationButton)
      vertexCreationButton.addEventListener(
        "click",
        this.onVertexCreationClick
      );

    const edgeCreationButton = document.getElementById("edge-creation-button");
    if (edgeCreationButton)
      edgeCreationButton.addEventListener("click", this.onEdgeCreationClick);

    const pathPlanningButton = document.getElementById("path-planning-button");
    if (pathPlanningButton)
      pathPlanningButton.addEventListener("click", this.onPathPlanningClick);

    canvas.addEventListener("mousedown", (event) => {
      this.onMouseDown(event);
    });
    canvas.addEventListener("mouseup", (event) => {
      this.onMouseUp(event);
    });
    canvas.addEventListener("mousemove", (event) => {
      this.onMouseMove(event);
    });
  }

  private onVertexCreationClick() {
    this.editMode = "vertex-creation";
  }

  private onEdgeCreationClick() {
    this.editMode = "edge-creation";
    this.edgeEditor = new EdgeEditor(this.graph, () => this.sidePanel.close());
    this.sidePanel.updateContent(this.edgeEditor.rootElement, () => {
      this.editMode = "navigation";
      this.edgeEditor = null;
      // remove all event listeners in the edgeEditor
    });
  }

  private onPathPlanningClick() {
    this.editMode = "path-planning";
    this.pathEditor = new PathEditor(this.graph);
    this.sidePanel.updateContent(this.pathEditor.rootElement, () => {
      this.pathEditor = null;
      // need to remove event listenders from pathEditor things?
    });
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
      this.graph.createVertex(clickedPosition);
      this.editMode = "navigation";
    } else if (this.editMode === "edge-creation" && !!clickedVertex) {
      // TODO: make sure this is correct
      this.edgeEditor?.onVertexSelection(clickedVertex);
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
      this.pathEditor?.onVertexSelection(clickedVertex);
    }

    this.isMouseDown = false;
    this.isDragging = false;
  }

  private displaySelectedVertex(selectedVertex: Vertex) {
    const vertexEditor = new VertexEditor(
      selectedVertex,
      () => {
        this.graph.removeVertex(selectedVertex);
        this.sidePanel.close();
      },
      () => {
        this.editMode = "path-planning";
        this.pathEditor = new PathEditor(this.graph);
        this.pathEditor.onVertexSelection(selectedVertex);
        this.sidePanel.updateContent(this.pathEditor.rootElement, () => {
          this.pathEditor = null;
          // need to remove event listeners from path planner things
        });
      }
    );

    this.sidePanel.updateContent(vertexEditor.rootElement, () => {
      vertexEditor.dispose();
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
