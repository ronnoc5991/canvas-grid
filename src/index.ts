import Viewport from "./classes/Viewport";
import Graph from "./classes/graph/Graph";
import Controls from "./classes/controls/Controls";
import Display from "./classes/Display";
import ids from "./config/ids";
import "./style.css";

const container = document.getElementById(ids.container);
const canvas = document.getElementById(ids.canvas) as HTMLCanvasElement;

const viewport = new Viewport(canvas);
const graph = new Graph();
new Controls(canvas, viewport, graph);
new Display(canvas, viewport, graph);

function onResize() {
  canvas.width = container?.offsetWidth ?? 0;
  canvas.height = container?.offsetHeight ?? 0;
  viewport?.onResize();
}

window.addEventListener("resize", onResize);
onResize();

// move to simpler buttons
// the button tells us how to interpret mouse clicks
// plain mouse: dragging and selecting
// node: node creation
// bi: bidirectional edge
// uni: unidirectional edge
