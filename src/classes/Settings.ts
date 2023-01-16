import {
  bidirectionalRadioButtonId,
  edgeCreationButtonId,
  explorationButtonId,
  unidirectionalRadioButtonId,
  vertexCreationButtonId,
  // zoomOutButtonId,
  // zoomInButtonId,
} from "../config/ids";
import { EdgeVariant } from "../types/EdgeVariant";
import { EditMode } from "../types/EditMode";

// TODO: allow for changing the circle config (radius)

export default class Settings {
  private editMode: EditMode;
  private edgeVariant: EdgeVariant;
  private explorationButton: HTMLButtonElement;
  private vertexCreationButton: HTMLButtonElement;
  private edgeCreationButton: HTMLButtonElement;
  private unidirectionalRadioButton: HTMLElement;
  private bidirectionalRadioButton: HTMLElement;
  // private zoomOutButton: HTMLButtonElement;
  // private zoomInButton: HTMLButtonElement;

  constructor() {
    this.editMode = "exploration";
    this.edgeVariant = "bidirectional";
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
    // this.zoomOutButton = document.getElementById(
    //   zoomOutButtonId
    // ) as HTMLButtonElement;
    // this.zoomInButton = document.getElementById(
    //   zoomInButtonId
    // ) as HTMLButtonElement;
    this.explorationButton.addEventListener("click", () =>
      this.onExplorationClick()
    );
    this.vertexCreationButton?.addEventListener("click", () =>
      this.onVertexCreationClick()
    );
    this.edgeCreationButton?.addEventListener("click", () =>
      this.onEdgeCreationClick()
    );
    this.bidirectionalRadioButton.addEventListener("click", () =>
      this.onBidirectionalRadioButtonClick()
    );
    this.unidirectionalRadioButton.addEventListener("click", () =>
      this.onUnidirectionalRadioButtonClick()
    );
  }

  public getEditMode() {
    return this.editMode;
  }

  public getEdgeVariant() {
    return this.edgeVariant;
  }

  private onExplorationClick() {
    this.editMode = "exploration";
  }

  private onVertexCreationClick() {
    this.editMode = "vertex-creation";
  }

  private onEdgeCreationClick() {
    this.editMode = "edge-creation";
  }

  private onBidirectionalRadioButtonClick() {
    this.edgeVariant = "bidirectional";
  }

  private onUnidirectionalRadioButtonClick() {
    this.edgeVariant = "unidirectional";
  }
}
