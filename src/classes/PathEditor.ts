import Editor from "../types/Editor";
import Graph from "./graph/Graph";
import Vertex from "./graph/Vertex";
import { Path } from "../types/Path";
import getEuclideanDistanceBetweenPoints from "../utils/getEuclideanDistanceBetweenPoints";

export default class PathEditor implements Editor {
  public rootElement: HTMLElement;
  private startInput: HTMLInputElement;
  private endInput: HTMLInputElement;
  private pathContainer: HTMLElement;
  private start: Vertex | null = null;
  private end: Vertex | null = null;
  private path: Path = [];

  constructor(private graph: Graph) {
    this.rootElement = document.createElement("div");
    this.rootElement.classList.add("path-planner");
    this.startInput = this.createVertexInput("start");
    this.endInput = this.createVertexInput("end");
    this.pathContainer = document.createElement("div");
    this.rootElement.appendChild(this.startInput);
    this.rootElement.appendChild(this.endInput);
    this.rootElement.appendChild(this.pathContainer);
  }

  public onVertexSelection(selectedVertex: Vertex) {
    if (!this.start) {
      this.start = selectedVertex;
      this.startInput.value = selectedVertex.name;
    } else {
      this.end = selectedVertex;
      this.endInput.value = selectedVertex.name;
    }

    if (this.shouldPlanPath()) {
      this.path = this.getPath();

      if (
        this.path[0] === this.start &&
        this.path[this.path.length - 1] === this.end
      ) {
        this.displayPath();
      } else {
        console.log("no path found :(");
      }
    }
  }

  private clearPathContainer() {
    while (this.pathContainer.firstElementChild) {
      this.pathContainer.removeChild(this.pathContainer.firstElementChild);
    }
  }

  private displayPath() {
    this.clearPathContainer();
    this.path.forEach((step) => {
      const container = document.createElement("div");
      container.classList.add("step-container");
      const title = document.createElement("p");
      title.classList.add("step-title");
      title.innerText = step.name;
      container.appendChild(title);
      this.pathContainer.appendChild(container);
    });
  }

  private shouldPlanPath() {
    return !!this.start && !!this.end;
  }

  private createVertexInput(name: string): HTMLInputElement {
    const input = document.createElement("input");
    input.type = "text";
    input.name = name;
    return input;
  }

  private getPath(): Path {
    if (!this.start || !this.end) return [];

    this.start.cost = 0;

    const unvisitedVertices: Array<Vertex> = [
      this.start,
      ...this.graph.vertices.filter((vertex) => vertex !== this.start),
    ];

    let currentVertex = unvisitedVertices[0];

    while (unvisitedVertices[0].cost < Infinity) {
      if (currentVertex === this.end) break;

      currentVertex.edges.forEach((edge) => {
        const connectedVertex = edge.vertices.find(
          (vertex) => vertex !== currentVertex
        );

        if (!connectedVertex) return;

        if (connectedVertex.distanceToTarget === null && this.end !== null) {
          connectedVertex.distanceToTarget = getEuclideanDistanceBetweenPoints(
            connectedVertex.position,
            this.end.position
          );
        }
        const newCost =
          currentVertex.cost +
          edge.weight +
          (connectedVertex.distanceToTarget ?? 0);

        if (newCost < connectedVertex.cost) {
          connectedVertex.cost = newCost;
          connectedVertex.previousVertexInPath = currentVertex;
        }
      });

      unvisitedVertices.shift();

      unvisitedVertices.sort((a, b) => {
        if (a.cost < b.cost) return -1;
        if (a.cost === b.cost) {
          return 0;
        }

        return 1;
      });

      currentVertex = unvisitedVertices[0];
    }

    const path = this.recreatePath(this.end);
    this.resetGraph();
    return path;
  }

  private recreatePath(currentVertex: Vertex): Path {
    if (currentVertex.previousVertexInPath === null) {
      return [currentVertex];
    } else {
      return [
        ...this.recreatePath(currentVertex.previousVertexInPath),
        currentVertex,
      ];
    }
  }

  private resetGraph() {
    this.graph.vertices.forEach((vertex) => {
      vertex.cost = Infinity;
      vertex.distanceToTarget = null;
      vertex.previousVertexInPath = null;
    });
  }

  public dispose() {
    // TODO: remove any event listeners created for this component
  }
}
