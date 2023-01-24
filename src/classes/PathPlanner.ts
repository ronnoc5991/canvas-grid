import { Path } from "../types/Path";
import getEuclideanDistanceBetweenPoints from "../utils/getEuclideanDistanceBetweenPoints";
import Graph from "./graph/Graph";
import Vertex from "./graph/Vertex";

export default class PathPlanner {
  public rootElement: HTMLElement;
  private startInput: HTMLInputElement;
  private endInput: HTMLInputElement;
  private start: Vertex | null = null;
  private end: Vertex | null = null;
  private path: Path = [];

  constructor(private graph: Graph) {
    this.rootElement = document.createElement("div");
    this.rootElement.classList.add("path-planner");
    this.startInput = this.createVertexInput("start");
    this.endInput = this.createVertexInput("end");
    this.rootElement.appendChild(this.startInput);
    this.rootElement.appendChild(this.endInput);
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
      console.log(this.path);
    }
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
        const connectedVertex = edge.toVertex;

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
}
