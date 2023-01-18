import { DEFAULT_ZOOM_PERCENTAGE } from "../config/constants";
import { canvasId } from "../config/ids";

type Subscriber = (viewport: Viewport) => void;

// RESPONSIBILITES:
// - calculate new viewport based on zoom/drag
// - update subscribers when viewport changes

export default class Viewport {
  private canvas: HTMLCanvasElement;
  private subscribers: Array<Subscriber> = [];
  public zoomPercentage: number;
  public minX: number;
  public maxX: number;
  public minY: number;
  public maxY: number;

  constructor() {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.zoomPercentage = DEFAULT_ZOOM_PERCENTAGE;
    this.minX = 0;
    this.maxX = this.canvas.width;
    this.minY = 0;
    this.maxY = this.canvas.height;
  }

  public subscribe(subscriber: Subscriber) {
    this.subscribers.push(subscriber);
  }

  private publish() {
    this.subscribers.forEach((subscriber) => {
      subscriber(this);
    });
  }

  private update(
    minXDelta: number,
    maxXDelta: number,
    minYDelta: number,
    maxYDelta: number
  ) {
    this.minX += minXDelta;
    this.maxX += maxXDelta;
    this.minY += minYDelta;
    this.maxY += maxYDelta;
    this.publish();
  }

  public zoom(newZoomPercentage: number, event?: WheelEvent) {
    this.zoomPercentage = newZoomPercentage;
    this.onZoom(event);
  }

  private onZoom(event?: WheelEvent) {
    const horizontalMouseFactor = !!event
      ? event.clientX / this.canvas.width
      : 0.5;
    const verticalMouseFactor = !!event
      ? event.clientY / this.canvas.height
      : 0.5;

    const previousWidth = this.maxX - this.minX;
    const previousHeight = this.maxY - this.minY;

    const newWidth = Math.round(
      this.canvas.width * (DEFAULT_ZOOM_PERCENTAGE / this.zoomPercentage)
    );
    const newHeight = Math.round(
      this.canvas.height * (DEFAULT_ZOOM_PERCENTAGE / this.zoomPercentage)
    );

    const deltaX = newWidth - previousWidth;
    const deltaY = newHeight - previousHeight;

    const minXDelta = deltaX * horizontalMouseFactor;
    const maxXDelta = deltaX - minXDelta;
    const minYDelta = deltaY * verticalMouseFactor;
    const maxYDelta = deltaY - minYDelta;

    this.update(-minXDelta, maxXDelta, -minYDelta, maxYDelta);
  }

  public translate(deltaX: number, deltaY: number) {
    const zoomDivisor = this.zoomPercentage / DEFAULT_ZOOM_PERCENTAGE;
    const scaledDeltaX = deltaX / zoomDivisor;
    const scaleddeltaY = deltaY / zoomDivisor;

    this.update(-scaledDeltaX, -scaledDeltaX, -scaleddeltaY, -scaleddeltaY);
  }
}
