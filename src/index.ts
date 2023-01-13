import { containerId, canvasId } from "./config/ids";
import Display from "./classes/Display";
import "./style.css";

// TODO: Create a scrollToOrigin function
// TODO: use gsap to tween the zoom?
// TODO: in node creation, create a mouse follower that is the node, snap it to the grid?

const container = document.getElementById(containerId);
const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
const display = new Display(canvas);

function onResize() {
  // const previousCanvasWidth = canvas.width;
  // const previousCanvasHeight = canvas.height;

  canvas.width = container?.offsetWidth ?? 0;
  canvas.height = container?.offsetHeight ?? 0;

  // offset.x = canvas.width * (offset.x / previousCanvasWidth);
  // offset.y = canvas.height * (offset.y / previousCanvasHeight);
}

function updateCanvasClassName() {
  // canvas.className = editMode;
}

function updateDisplay() {
  display.update();
  requestAnimationFrame(() => updateDisplay());
}

window.addEventListener("resize", onResize);

updateCanvasClassName();
onResize();
updateDisplay();
