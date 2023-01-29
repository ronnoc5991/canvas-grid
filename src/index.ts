import Graph from "./classes/graph/Graph";
import MapWindow from "./classes/MapWindow";
import Viewport from "./classes/viewport/Viewport";
import Controls from "./classes/Controls";
import SidePanel from "./classes/sidePanel/SidePanel";
import "./style.css";

const container = document.getElementById("canvas-container");
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const graph = new Graph();
const mapWindow = new MapWindow(canvas);
const sidePanel = new SidePanel();
new Controls(canvas, graph, mapWindow, sidePanel);
new Viewport(canvas, graph, mapWindow);

function onResize() {
  canvas.width = container?.offsetWidth ?? 0;
  canvas.height = container?.offsetHeight ?? 0;
  mapWindow.onResize();
}

window.addEventListener("resize", onResize);
onResize();
