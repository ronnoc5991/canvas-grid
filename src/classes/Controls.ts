import { Position } from "../types/Position";
import Graph from "./graph/Graph";
import MapWindow from "./MapWindow";
import Vertex from "./graph/Vertex";
import SidePanel from "./sidePanel/SidePanel";
import PathEditor from "./pathEditor/PathEditor";
import VertexEditor from "./vertexEditor/VertexEditor";
import EdgeEditor from "./edgeEditor/EdgeEditor";
import { EditMode } from "../types/EditMode";
import viewportConfig from "./viewport/config";
import Mouse from "./Mouse";

const DEFAULT_EDIT_MODE: EditMode = "navigation";

// RESPONSIBILITIES:
// - listen for user input, dispatch events accordingly

export default class Controls {
  private editMode: EditMode = DEFAULT_EDIT_MODE;
  private mouse: Mouse;
  private sidePanel: SidePanel;
  private edgeEditor: EdgeEditor | null = null;
  private pathEditor: PathEditor | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private graph: Graph,
    private mapWindow: MapWindow
  ) {
    this.sidePanel = new SidePanel();
    this.mouse = new Mouse(
      canvas,
      this.onDrag.bind(this),
      this.onMouseUp.bind(this)
    );
    const vertexCreationButton = document.getElementById(
      "vertex-creation-button"
    );
    if (vertexCreationButton)
      vertexCreationButton.addEventListener(
        "click",
        this.onVertexCreationClick.bind(this)
      );

    const edgeCreationButton = document.getElementById("edge-creation-button");
    if (edgeCreationButton)
      edgeCreationButton.addEventListener(
        "click",
        this.onEdgeCreationClick.bind(this)
      );

    const pathPlanningButton = document.getElementById("path-planning-button");
    if (pathPlanningButton)
      pathPlanningButton.addEventListener(
        "click",
        this.onPathPlanningClick.bind(this)
      );
  }

  private onVertexCreationClick() {
    this.editMode = "vertex-creation";
  }

  private onEdgeCreationClick() {
    this.editMode = "edge-creation";
    this.edgeEditor = new EdgeEditor(this.graph, this.closeSidePanel);

    this.sidePanel.updateContent(this.edgeEditor.rootElement, () => {
      this.editMode = "navigation";
      this.edgeEditor?.dispose();
      this.edgeEditor = null;
    });
  }

  private onPathPlanningClick() {
    this.editMode = "path-planning";
    this.pathEditor = new PathEditor(this.graph);
    this.sidePanel.updateContent(this.pathEditor.rootElement, () => {
      this.editMode = "navigation";
      this.pathEditor?.dispose();
      this.pathEditor = null;
    });
  }

  private closeSidePanel() {
    this.sidePanel.close();
  }

  private onMouseUp({ clientX, clientY }: MouseEvent, isDragging: boolean) {
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
      !isDragging &&
      !!clickedVertex
    ) {
      this.displaySelectedVertex(clickedVertex);
    } else if (
      this.editMode === "path-planning" &&
      !isDragging &&
      !!clickedVertex
    ) {
      this.pathEditor?.onVertexSelection(clickedVertex);
    }
  }

  private displaySelectedVertex(selectedVertex: Vertex) {
    const vertexEditor = new VertexEditor(
      selectedVertex,
      () => {
        this.graph.removeVertex(selectedVertex);
        this.closeSidePanel();
      },
      () => {
        this.editMode = "path-planning";
        this.pathEditor = new PathEditor(this.graph);
        this.pathEditor.onVertexSelection(selectedVertex);
        this.sidePanel.updateContent(this.pathEditor.rootElement, () => {
          this.pathEditor?.dispose();
          this.pathEditor = null;
        });
      }
    );

    this.sidePanel.updateContent(vertexEditor.rootElement, () => {
      vertexEditor.dispose();
    });
  }

  private onDrag(deltaX: number, deltaY: number): void {
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
}
