// RESPONSIBILITIES:
// - store the current window to the map

const ZOOM_OUT_BUTTON_ID: string = "zoom-out-button";
const ZOOM_IN_BUTTON_ID: string = "zoom-in-button";
const DEFAULT_ZOOM_PERCENTAGE: number = 100;
const MAX_ZOOM_PERCENTAGE: number = 300;
const MIN_ZOOM_PERCENTAGE: number = 25;
const ZOOM_STEP_SIZE: number = 10;

export default class MapWindow {
  private zoomOutButton = document.getElementById(
    ZOOM_OUT_BUTTON_ID
  ) as HTMLButtonElement;
  private zoomInButton = document.getElementById(
    ZOOM_IN_BUTTON_ID
  ) as HTMLButtonElement;
  private zoomPercentage: number = DEFAULT_ZOOM_PERCENTAGE;
  public minX: number;
  public maxX: number;
  public minY: number;
  public maxY: number;

  constructor(private canvas: HTMLCanvasElement) {
    canvas.addEventListener("wheel", (event) => {
      this.onScroll(event);
    });
    this.zoomInButton.addEventListener("click", () => {
      this.onZoomIn();
    });
    this.zoomOutButton.addEventListener("click", () => {
      this.onZoomOut();
    });

    this.minX = 0;
    this.maxX = this.canvas.width;
    this.minY = 0;
    this.maxY = this.canvas.height;
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
  }

  public onResize() {
    this.onZoom();
  }

  public getScaledValue(value: number) {
    const divisor = this.zoomPercentage / DEFAULT_ZOOM_PERCENTAGE;
    return value / divisor;
  }

  public onDrag(deltaX: number, deltaY: number) {
    const scaledDeltaX = this.getScaledValue(deltaX);
    const scaledDeltaY = this.getScaledValue(deltaY);
    this.update(-scaledDeltaX, -scaledDeltaX, -scaledDeltaY, -scaledDeltaY);
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
