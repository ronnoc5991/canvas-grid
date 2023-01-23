import ids from "../../config/ids";

export type ZoomEvent =
  | { source: "wheel"; event: WheelEvent }
  | { source: "zoomIn" | "zoomOut" };

type ZoomEventDispatcher = (zoomEvent: ZoomEvent) => void;

export default function setupZoomListeners(
  canvas: HTMLCanvasElement,
  onZoomEvent: ZoomEventDispatcher
) {
  const zoomOutButton = document.getElementById(
    ids.zoomOutButton
  ) as HTMLButtonElement;
  const zoomInButton = document.getElementById(
    ids.zoomInButton
  ) as HTMLButtonElement;
  canvas.addEventListener("wheel", (event) => {
    onZoomEvent({ source: "wheel", event });
  });
  zoomInButton.addEventListener("click", () => {
    onZoomEvent({ source: "zoomIn" });
  });
  zoomOutButton.addEventListener("click", () => {
    onZoomEvent({ source: "zoomOut" });
  });
}
