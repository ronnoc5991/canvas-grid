import Vertex from "./Vertex";
import Edge from "./Edge";
import { Position } from "../../types/Position";

type Subscriber = (graph: Graph) => void;

export default class Graph {
  public vertices: Array<Vertex>;
  public edges: Array<Edge>;
  private subscribers: Array<Subscriber>;
  private vertexCount: number;

  constructor() {
    this.vertices = [];
    this.edges = [];
    this.subscribers = [];
    this.vertexCount = 0;
  }

  public subscribe(subscriber: Subscriber) {
    this.subscribers.push(subscriber);
  }

  private publish() {
    this.subscribers.forEach((subscriber) => {
      subscriber(this);
    });
  }

  public createVertex(position: Position): Vertex {
    this.vertexCount += 1;
    const newVertex = new Vertex(position, `Node ${this.vertexCount}`);
    this.vertices.push(newVertex);
    this.publish();
    return newVertex;
  }

  public createEdge(fromVertex: Vertex, toVertex: Vertex) {
    const euclideanDistance = Math.sqrt(
      Math.pow(fromVertex.position.x - toVertex.position.x, 2) +
        Math.pow(fromVertex.position.y - toVertex.position.y, 2)
    );

    const newEdge = new Edge(euclideanDistance, [fromVertex, toVertex]);
    fromVertex.addEdge(newEdge);
    toVertex.addEdge(newEdge);

    this.edges.push(newEdge);
    this.publish();
  }

  public removeVertex(vertexToDelete: Vertex) {
    this.vertices = this.vertices.filter((vertex) => vertex !== vertexToDelete);
    this.edges = this.edges.filter(
      (edge) => !edge.vertices.includes(vertexToDelete)
    );
    this.publish();
  }

  public removeEdge(edgeToDelete: Edge) {
    this.edges = this.edges.filter((edge) => edge !== edgeToDelete);
    this.vertices.forEach((vertex) => {
      vertex.edges = vertex.edges.filter((edge) => edge !== edgeToDelete);
    });
    this.publish();
  }
}
