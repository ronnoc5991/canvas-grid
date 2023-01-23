import Graph from "../classes/graph/Graph";
import Vertex from "../classes/graph/Vertex";
import { Path } from "../types/Path";
import getEuclideanDistanceBetweenPoints from "./getEuclideanDistanceBetweenPoints";

export default function getPath(
  graph: Graph,
  startingVertex: Vertex,
  endingVertex: Vertex
): Path {
  startingVertex.cost = 0;

  const unvisitedVertices: Array<Vertex> = [
    startingVertex,
    ...graph.vertices.filter((vertex) => vertex !== startingVertex),
  ];

  let currentVertex = unvisitedVertices[0];

  while (unvisitedVertices[0].cost < Infinity) {
    if (currentVertex === endingVertex) break;

    currentVertex.edges.forEach((edge) => {
      const connectedVertex = edge.toVertex;

      if (connectedVertex.distanceToTarget === null) {
        connectedVertex.distanceToTarget = getEuclideanDistanceBetweenPoints(
          connectedVertex.position,
          endingVertex.position
        );
      }
      const newCost =
        currentVertex.cost + edge.weight + connectedVertex.distanceToTarget;

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

  return recreatePath(endingVertex);
}

function recreatePath(currentVertex: Vertex): Path {
  if (!!currentVertex.previousVertexInPath) {
    return [...recreatePath(currentVertex.previousVertexInPath)];
  } else {
    return [currentVertex];
  }
}
