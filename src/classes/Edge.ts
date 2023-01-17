import Vertex from "./Vertex";

export default class Edge {
  constructor(public weight: number, public vertices: [Vertex, Vertex]) {}
}
