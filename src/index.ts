import { containerId, canvasId } from "./config/ids";
import Settings from "./classes/Settings";
import Viewport from "./classes/Viewport";
import Graph from "./classes/Graph";
import Controls from "./classes/Controls";
import Display from "./classes/Display";
import "./style.css";

const container = document.getElementById(containerId);
const canvas = document.getElementById(canvasId) as HTMLCanvasElement;

function onResize() {
  canvas.width = container?.offsetWidth ?? 0;
  canvas.height = container?.offsetHeight ?? 0;
}

window.addEventListener("resize", onResize);

onResize();
const settings = new Settings();
const viewport = new Viewport(canvas);
const graph = new Graph();
new Controls(settings, viewport, graph);
new Display(canvas, viewport, graph);
