import Graph from "../classes/Graph";

let graph: Graph | undefined = undefined;

export default function useGraph() {
  if (graph === undefined) {
    graph = new Graph();
  }

  return graph;
}
