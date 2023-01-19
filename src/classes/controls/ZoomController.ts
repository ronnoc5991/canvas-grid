import ids from "../../config/ids";

export type Zoom =
  | { source: "wheel"; event: WheelEvent }
  | { source: "zoomIn" | "zoomOut" };

type EventDispatcher = (zoom: Zoom) => void;

export default class ZoomController {
  constructor(canvas: HTMLCanvasElement, eventDispatcher: EventDispatcher) {
    canvas.addEventListener("wheel", (event) => {
      eventDispatcher({ source: "wheel", event });
    });
    const zoomOutButton = document.getElementById(
      ids.zoomOutButton
    ) as HTMLButtonElement;
    const zoomInButton = document.getElementById(
      ids.zoomInButton
    ) as HTMLButtonElement;
    zoomInButton.addEventListener("click", () => {
      eventDispatcher({ source: "zoomIn" });
    });
    zoomOutButton.addEventListener("click", () => {
      eventDispatcher({ source: "zoomOut" });
    });
  }
}
