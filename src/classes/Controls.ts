import { EdgeVariant } from "../types/EdgeVariant";
import { EditMode } from "../types/EditMode";
import {
  bidirectionalRadioButtonId,
  canvasId,
  edgeCreationButtonId,
  explorationButtonId,
  unidirectionalRadioButtonId,
  vertexCreationButtonId,
  zoomOutButtonId,
  zoomInButtonId,
} from "../config/ids";

type EditModeHanlder = (newEditMode: EditMode) => void;
type EdgeVariantHandler = (newEdgeVariant: EdgeVariant) => void;
type ScrollHandler = (event: WheelEvent) => void;
type ZoomHandler = () => void;

export default class Controls {
  private canvas: HTMLCanvasElement;
  private explorationButton: HTMLButtonElement;
  private vertexCreationButton: HTMLButtonElement;
  private edgeCreationButton: HTMLButtonElement;
  private unidirectionalRadioButton: HTMLElement;
  private bidirectionalRadioButton: HTMLElement;
  private zoomInButton: HTMLButtonElement;
  private zoomOutButton: HTMLButtonElement;

  constructor(
    private onChangeEditMode: EditModeHanlder,
    private onChangeEdgeVariant: EdgeVariantHandler,
    private onScroll: ScrollHandler,
    private onZoomIn: ZoomHandler,
    private onZoomOut: ZoomHandler
  ) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.explorationButton = document.getElementById(
      explorationButtonId
    ) as HTMLButtonElement;
    this.vertexCreationButton = document.getElementById(
      vertexCreationButtonId
    ) as HTMLButtonElement;
    this.edgeCreationButton = document.getElementById(
      edgeCreationButtonId
    ) as HTMLButtonElement;
    this.unidirectionalRadioButton = document.getElementById(
      unidirectionalRadioButtonId
    ) as HTMLElement;
    this.bidirectionalRadioButton = document.getElementById(
      bidirectionalRadioButtonId
    ) as HTMLElement;
    this.zoomOutButton = document.getElementById(
      zoomOutButtonId
    ) as HTMLButtonElement;
    this.zoomInButton = document.getElementById(
      zoomInButtonId
    ) as HTMLButtonElement;

    this.canvas.addEventListener("wheel", (event) => {
      this.onScroll(event);
    });
    this.explorationButton.addEventListener("click", () => {
      this.onChangeEditMode("exploration");
    });
    this.vertexCreationButton?.addEventListener("click", () => {
      this.onChangeEditMode("vertex-creation");
    });
    this.edgeCreationButton?.addEventListener("click", () => {
      this.onChangeEditMode("edge-creation");
    });
    this.bidirectionalRadioButton.addEventListener("click", () => {
      this.onChangeEdgeVariant("bidirectional");
    });
    this.unidirectionalRadioButton.addEventListener("click", () => {
      this.onChangeEdgeVariant("unidirectional");
    });
    this.zoomInButton.addEventListener("click", () => {
      this.onZoomIn();
    });
    this.zoomOutButton.addEventListener("click", () => {
      this.onZoomOut();
    });
  }
}
