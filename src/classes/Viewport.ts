import { DEFAULT_ZOOM_PERCENTAGE } from "../config/constants";
import { canvasId } from "../config/ids";
import State from "./State";

type Subscriber = (viewport: Viewport) => void;

// RESPONSIBILITES:
// - calculate new viewport based on zoom/drag
// - update subscribers when viewport changes

export default class Viewport {
  public minX: number;
  public maxX: number;
  public minY: number;
  public maxY: number;
  private canvas: HTMLCanvasElement;
  private subscribers: Array<Subscriber> = [];

  constructor() {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.minX = 0;
    this.maxX = this.canvas.width;
    this.minY = 0;
    this.maxY = this.canvas.height;
    State.subscribeToZoom(this.zoom.bind(this));
  }

  public subscribe(subscriber: Subscriber) {
    this.subscribers.push(subscriber);
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
    this.subscribers.forEach((subscriber) => {
      subscriber(this);
    });
  }

  private zoom(zoomPercentage: number, event?: WheelEvent) {
    const horizontalMouseFactor = !!event
      ? event.clientX / this.canvas.width
      : 0.5;
    const verticalMouseFactor = !!event
      ? event.clientY / this.canvas.height
      : 0.5;

    const previousWidth = this.maxX - this.minX;
    const previousHeight = this.maxY - this.minY;

    const newWidth = Math.round(
      this.canvas.width * (DEFAULT_ZOOM_PERCENTAGE / zoomPercentage)
    );
    const newHeight = Math.round(
      this.canvas.height * (DEFAULT_ZOOM_PERCENTAGE / zoomPercentage)
    );

    const deltaX = newWidth - previousWidth;
    const deltaY = newHeight - previousHeight;

    const minXDelta = deltaX * horizontalMouseFactor;
    const maxXDelta = deltaX - minXDelta;
    const minYDelta = deltaY * verticalMouseFactor;
    const maxYDelta = deltaY - minYDelta;

    this.update(-minXDelta, maxXDelta, -minYDelta, maxYDelta);
  }

  public translate(deltaX: number, deltaY: number, zoomPercentage: number) {
    const zoomDivisor = zoomPercentage / DEFAULT_ZOOM_PERCENTAGE;
    const scaledDeltaX = deltaX / zoomDivisor;
    const scaleddeltaY = deltaY / zoomDivisor;

    this.update(-scaledDeltaX, -scaledDeltaX, -scaleddeltaY, -scaleddeltaY);
  }
}
