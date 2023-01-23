import Graph from "./classes/graph/Graph";
import MapWindow from "./classes/MapWindow";
import Viewport from "./classes/Viewport";
import Controls from "./classes/controls/Controls";
import SidePanel from "./classes/sidePanel/SidePanel";
import ids from "./config/ids";
import "./style.css";

const container = document.getElementById(ids.container);
const canvas = document.getElementById(ids.canvas) as HTMLCanvasElement;

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
