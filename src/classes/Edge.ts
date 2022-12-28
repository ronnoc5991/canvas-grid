import Vertex from "./Vertex";

// TODO: Support custom edge colors?

export default class Edge {
  constructor(public weight: number, public vertices: [Vertex, Vertex]) {}
}
