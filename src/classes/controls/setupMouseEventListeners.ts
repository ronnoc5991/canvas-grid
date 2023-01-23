type MouseEventSource = "mousedown" | "mouseup" | "mousemove";

export type CustomMouseEvent = { source: MouseEventSource; event: MouseEvent };

type MouseEventDispatcher = (mouseEvent: CustomMouseEvent) => void;

export default function setupMouseEventListeners(
  canvas: HTMLCanvasElement,
  onMouseEvent: MouseEventDispatcher
) {
  canvas.addEventListener("mousedown", (event) => {
    onMouseEvent({ source: "mousedown", event });
  });
  canvas.addEventListener("mouseup", (event) => {
    onMouseEvent({ source: "mouseup", event });
  });
  canvas.addEventListener("mousemove", (event) => {
    onMouseEvent({ source: "mousemove", event });
  });
}
