import {
  DEFAULT_ZOOM_PERCENTAGE,
  MAX_ZOOM_PERCENTAGE,
  MIN_ZOOM_PERCENTAGE,
  ZOOM_STEP_SIZE,
} from "../config/constants";
import { EdgeVariant } from "../types/EdgeVariant";
import { EditMode } from "../types/EditMode";
import Controls from "./Controls";

type ZoomSubscriber = (zoomPercentage: number, event?: WheelEvent) => void;

export default class Settings {
  private editMode: EditMode;
  private edgeVariant: EdgeVariant;
  private zoomPercentage: number;
  private zoomSubscribers: Array<ZoomSubscriber>;

  constructor() {
    this.editMode = "exploration";
    this.edgeVariant = "bidirectional";
    this.zoomPercentage = DEFAULT_ZOOM_PERCENTAGE;
    this.zoomSubscribers = [];
    new Controls(
      this.setEditMode.bind(this),
      this.setEdgeVariant.bind(this),
      this.onScroll.bind(this),
      this.onZoomIn.bind(this),
      this.onZoomOut.bind(this)
    );
  }

  public getEditMode() {
    return this.editMode;
  }

  public getEdgeVariant() {
    return this.edgeVariant;
  }

  public getZoomPercentage() {
    return this.zoomPercentage;
  }

  public subscribeToZoom(subscriber: ZoomSubscriber) {
    this.zoomSubscribers.push(subscriber);
  }

  private setEditMode(newEditMode: EditMode) {
    this.editMode = newEditMode;
  }

  private setEdgeVariant(newEdgeVariant: EdgeVariant) {
    this.edgeVariant = newEdgeVariant;
  }

  private setZoomPercentage(newZoomPercentage: number, event?: WheelEvent) {
    this.zoomPercentage = newZoomPercentage;
    this.zoomSubscribers.forEach((subscriber) => {
      subscriber(this.zoomPercentage, event);
    });
  }

  private onScroll(event: WheelEvent) {
    if (!this.isZoomAllowed(event.deltaY)) return;

    if (event.deltaY > 0 && this.zoomPercentage > MIN_ZOOM_PERCENTAGE) {
      this.setZoomPercentage(this.zoomPercentage - 1, event);
    } else if (event.deltaY < 0 && this.zoomPercentage < MAX_ZOOM_PERCENTAGE) {
      this.setZoomPercentage(this.zoomPercentage + 1, event);
    }
  }

  private onZoomIn() {
    if (!this.isZoomAllowed(ZOOM_STEP_SIZE)) return;
    const allowance = MAX_ZOOM_PERCENTAGE - this.zoomPercentage;
    this.setZoomPercentage(
      this.zoomPercentage + Math.min(allowance, ZOOM_STEP_SIZE)
    );
  }

  private onZoomOut() {
    if (!this.isZoomAllowed(-ZOOM_STEP_SIZE)) return;
    const allowance = this.zoomPercentage - MIN_ZOOM_PERCENTAGE;
    this.setZoomPercentage(
      this.zoomPercentage - Math.min(allowance, ZOOM_STEP_SIZE)
    );
  }

  private isZoomAllowed(deltaY: number) {
    return !(
      (deltaY > 0 && this.zoomPercentage < MIN_ZOOM_PERCENTAGE) ||
      (deltaY < 0 && this.zoomPercentage > MAX_ZOOM_PERCENTAGE)
    );
  }
}
