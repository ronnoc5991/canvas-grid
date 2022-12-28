import type { Position } from "./types/Position";
import type { Offset } from "./types/Offset";
import type { Viewport } from "./types/Viewport";
import type { EditMode } from "./types/EditMode";
import type { EdgeVariant } from "./types/EdgeVariant";
import Vertex from "./classes/Vertex";
import { CIRCLE_CONFIG } from "./config/circle";
import drawVertices from "./utils/drawVertices";
import drawGrid from "./utils/drawGrid";
import getClickedVertex from "./utils/getClickedVertex";
import useGraph from "./hooks/useGraph";
import {
  explorationButtonId,
  vertexCreationButtonId,
  edgeCreationButtonId,
  containerId,
  canvasId,
  unidirectionalRadioButtonId,
  bidirectionalRadioButtonId,
} from "./config/ids";
import "./style.css";
import Edge from "./classes/Edge";
import drawEdges from "./utils/drawEdges";

// TODO: Create a scrollToOrigin function
// TODO: use gsap to tween the zoom?
// TODO: in node creation, create a mouse follower that is the node, snap it to the grid?

const explorationButton = document.getElementById(explorationButtonId);
const vertexCreationButton = document.getElementById(vertexCreationButtonId);
const edgeCreationButton = document.getElementById(edgeCreationButtonId);
const unidirectionalRadioButton = document.getElementById(
  unidirectionalRadioButtonId
);
const bidirectionalRadioButton = document.getElementById(
  bidirectionalRadioButtonId
);
const container = document.getElementById(containerId);
const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
const context = canvas.getContext("2d");

const offset: Offset = {
  x: 0,
  y: 0,
};

const viewport: Viewport = {
  minX: 0,
  maxX: canvas.width,
  minY: 0,
  maxY: canvas.height,
};

const graph = useGraph();
const previousMousePosition: Position = { x: 0, y: 0 };
let editMode: EditMode = "vertex-creation";
let isDragging: boolean = false;
let fromVertex: Vertex | null = null;
let edgeVariant: EdgeVariant = "bidirectional";

function onResize() {
  const previousCanvasWidth = canvas.width;
  const previousCanvasHeight = canvas.height;

  canvas.width = container?.offsetWidth ?? 0;
  canvas.height = container?.offsetHeight ?? 0;

  offset.x = canvas.width * (offset.x / previousCanvasWidth);
  offset.y = canvas.height * (offset.y / previousCanvasHeight);

  viewport.minX = -offset.x;
  viewport.maxX = viewport.minX + canvas.width;
  viewport.minY = -offset.y;
  viewport.maxY = viewport.minY + canvas.height;
}

function draw() {
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid(viewport, offset, canvas, context);
  drawEdges(graph.edges, offset, viewport, context);
  drawVertices(graph.vertices, CIRCLE_CONFIG, offset, viewport, context);

  requestAnimationFrame(() => {
    draw();
  });
}

function onMouseDown({ clientX, clientY }: MouseEvent) {
  if (editMode == "exploration") {
    isDragging = true;
    previousMousePosition.x = clientX;
    previousMousePosition.y = clientY;
  } else if (editMode == "vertex-creation") {
    const { x, y } = canvas.getBoundingClientRect();
    const newVertex = new Vertex({
      x: clientX - x - offset.x,
      y: clientY - y - offset.y,
    });
    graph.addVertex(newVertex);
  } else if (editMode === "edge-creation") {
    const { x, y } = canvas.getBoundingClientRect();
    const clickedVertex = getClickedVertex(
      { x: clientX - x - offset.x, y: clientY - y - offset.y },
      graph.vertices,
      CIRCLE_CONFIG.radius
    );

    if (clickedVertex === undefined) return;

    if (fromVertex === null) {
      fromVertex = clickedVertex;
    } else {
      const euclideanDistance = Math.sqrt(
        Math.pow(fromVertex.position.x - clickedVertex.position.x, 2) +
          Math.pow(fromVertex.position.y - clickedVertex.position.y, 2)
      );
      const newEdge = new Edge(euclideanDistance, [fromVertex, clickedVertex]);
      graph.addEdge(newEdge);

      fromVertex.addEdge(newEdge);
      if (edgeVariant === "bidirectional") clickedVertex.addEdge(newEdge);

      console.log(graph);
      fromVertex = null;
    }

    // should clear out the stored vertex if we switch edit modes!

    // could draw a line between the first vertex and the mouse until the second vertex is clicked?
    // could also snap that line to the other vertices?
    // create a function that takes a position (of the mouse) and returns the nearest grid point/vertex within a range (these could be two different functions)
  }
}

function onMouseUp() {
  isDragging = false;
}

function onMouseMove(event: MouseEvent) {
  if (!isDragging || editMode !== "exploration") return;
  const currentMousePosition: Position = { x: event.clientX, y: event.clientY };
  const deltaX = currentMousePosition.x - previousMousePosition.x;
  const deltaY = currentMousePosition.y - previousMousePosition.y;
  previousMousePosition.x = currentMousePosition.x;
  previousMousePosition.y = currentMousePosition.y;

  offset.x += deltaX;
  offset.y += deltaY;

  viewport.minX = -offset.x;
  viewport.maxX = viewport.minX + canvas.width;
  viewport.minY = -offset.y;
  viewport.maxY = viewport.minY + canvas.height;
}

function updateCanvasClassName() {
  canvas.className = editMode;
}

function onExplorationClick() {
  editMode = "exploration";
  updateCanvasClassName();
}

function onVertexCreationClick() {
  editMode = "vertex-creation";
  updateCanvasClassName();
}

function onEdgeCreationClick() {
  editMode = "edge-creation";
  fromVertex = null;
  updateCanvasClassName();
}

function onBidirectionalRadioButtonClick() {
  edgeVariant = "bidirectional";
}

function onUnidirectionalRadioButtonClick() {
  edgeVariant = "unidirectional";
}

window.addEventListener("resize", onResize);
explorationButton?.addEventListener("click", onExplorationClick);
vertexCreationButton?.addEventListener("click", onVertexCreationClick);
edgeCreationButton?.addEventListener("click", onEdgeCreationClick);
canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("mouseup", onMouseUp);
canvas.addEventListener("mousemove", onMouseMove);
bidirectionalRadioButton?.addEventListener(
  "click",
  onBidirectionalRadioButtonClick
);
unidirectionalRadioButton?.addEventListener(
  "click",
  onUnidirectionalRadioButtonClick
);

updateCanvasClassName();
onResize();
draw();
