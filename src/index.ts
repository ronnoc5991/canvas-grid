import { containerId, canvasId } from "./config/ids";
import Display from "./classes/Display";
import "./style.css";

const container = document.getElementById(containerId);
const canvas = document.getElementById(canvasId) as HTMLCanvasElement;

function onResize() {
  canvas.width = container?.offsetWidth ?? 0;
  canvas.height = container?.offsetHeight ?? 0;
}

function updateDisplay() {
  display.update();
  requestAnimationFrame(() => updateDisplay());
}

window.addEventListener("resize", onResize);

onResize();
const display = new Display(canvas);
updateDisplay();
