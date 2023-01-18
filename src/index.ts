import Viewport from "./classes/Viewport";
import Graph from "./classes/Graph";
import Controls from "./classes/Controls";
import Display from "./classes/Display";
import ids from "./config/ids";
import "./style.css";

const container = document.getElementById(ids.container);
const canvas = document.getElementById(ids.canvas) as HTMLCanvasElement;

function onResize() {
  canvas.width = container?.offsetWidth ?? 0;
  canvas.height = container?.offsetHeight ?? 0;
}

window.addEventListener("resize", onResize);

onResize();

const viewport = new Viewport(canvas);
const graph = new Graph();
new Controls(canvas, viewport, graph);
const display = new Display(canvas, viewport, graph);
display.update();
