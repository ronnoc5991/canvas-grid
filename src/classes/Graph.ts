import Vertex from "./Vertex";
import Edge from "./Edge";

type Subscriber = (graph: Graph) => void;

export default class Graph {
  public vertices: Array<Vertex>;
  public edges: Array<Edge>;
  private subscribers: Array<Subscriber>;

  constructor() {
    this.vertices = [];
    this.edges = [];
    this.subscribers = [];
  }

  public subscribe(subscriber: Subscriber) {
    this.subscribers.push(subscriber);
  }

  private publish() {
    this.subscribers.forEach((subscriber) => {
      subscriber(this);
    });
  }

  public addVertex(vertex: Vertex) {
    this.vertices.push(vertex);
    this.publish();
  }

  public addEdge(edge: Edge) {
    // TODO: Guard against multiple edges between the same two vertices? Could this result in a loop of sorts?
    this.edges.push(edge);
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
