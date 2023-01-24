// RESPONSIBILITIES:
// - store the current window to the map
// - update subscribers on changes

const DEFAULT_ZOOM_PERCENTAGE: number = 100;
const MAX_ZOOM_PERCENTAGE: number = 300;
const MIN_ZOOM_PERCENTAGE: number = 25;
const ZOOM_STEP_SIZE: number = 10;

type Subscriber = (mapWindow: MapWindow) => void;

export default class MapWindow {
  private subscribers: Array<Subscriber> = [];
  private zoomPercentage: number;
  public minX: number;
  public maxX: number;
  public minY: number;
  public maxY: number;

  constructor(private canvas: HTMLCanvasElement) {
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

  public onResize() {
    this.onZoom();
  }

  public getScaledValue(value: number) {
    const divisor = this.zoomPercentage / DEFAULT_ZOOM_PERCENTAGE;
    return value / divisor;
  }

  public onDrag(deltaX: number, deltaY: number) {
    // const { scaledDeltaX, scaledDeltaY } = this.scaleDrag(deltaX, deltaY);
    const scaledDeltaX = this.getScaledValue(deltaX);
    const scaledDeltaY = this.getScaledValue(deltaY);
    this.update(-scaledDeltaX, -scaledDeltaX, -scaledDeltaY, -scaledDeltaY);
  }

  // COULD THIS FUNCTION LIVE IN A TRANSLATOR CLASS?
  // IT COULD KNOW ABOUT THE MAPWINDOW AND THE VIEWPORT? AND TRANSLATE THINGS BACK AND FORTH
  private scaleDrag(
    deltaX: number,
    deltaY: number
  ): { scaledDeltaX: number; scaledDeltaY: number } {
    const zoomDivisor = this.zoomPercentage / DEFAULT_ZOOM_PERCENTAGE;
    const scaledDeltaX = deltaX / zoomDivisor;
    const scaledDeltaY = deltaY / zoomDivisor;
    return { scaledDeltaX, scaledDeltaY };
  }

  public onScroll(event: WheelEvent) {
    if (!this.isZoomAllowed(event.deltaY)) return;

    if (event.deltaY > 0 && this.zoomPercentage > MIN_ZOOM_PERCENTAGE) {
      this.zoomPercentage -= 1;
      this.onZoom(event);
    } else if (event.deltaY < 0 && this.zoomPercentage < MAX_ZOOM_PERCENTAGE) {
      this.zoomPercentage += 1;
      this.onZoom(event);
    }
  }

  public onZoomIn() {
    if (!this.isZoomAllowed(ZOOM_STEP_SIZE)) return;
    const allowance = MAX_ZOOM_PERCENTAGE - this.zoomPercentage;
    this.zoomPercentage += Math.min(allowance, ZOOM_STEP_SIZE);
    this.onZoom();
  }

  public onZoomOut() {
    if (!this.isZoomAllowed(-ZOOM_STEP_SIZE)) return;
    const allowance = this.zoomPercentage - MIN_ZOOM_PERCENTAGE;
    this.zoomPercentage -= Math.min(allowance, ZOOM_STEP_SIZE);
    this.onZoom();
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

  private isZoomAllowed(deltaY: number) {
    return !(
      (deltaY > 0 && this.zoomPercentage < MIN_ZOOM_PERCENTAGE) ||
      (deltaY < 0 && this.zoomPercentage > MAX_ZOOM_PERCENTAGE)
    );
  }
}
