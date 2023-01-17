import {
  bidirectionalRadioButtonId,
  edgeCreationButtonId,
  explorationButtonId,
  unidirectionalRadioButtonId,
  vertexCreationButtonId,
  //   zoomOutButtonId,
  //   zoomInButtonId,
} from "../config/ids";
import useSettings from "../hooks/useSettings";
import Settings from "./Settings";

export default class Controls {
  private settings: Settings;
  private explorationButton: HTMLButtonElement;
  private vertexCreationButton: HTMLButtonElement;
  private edgeCreationButton: HTMLButtonElement;
  private unidirectionalRadioButton: HTMLElement;
  private bidirectionalRadioButton: HTMLElement;
  //   private zoomOutButton: HTMLButtonElement;
  //   private zoomInButton: HTMLButtonElement;

  constructor() {
    this.settings = useSettings();
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

  private onExplorationClick() {
    this.settings.setEditMode("exploration");
  }

  private onVertexCreationClick() {
    this.settings.setEditMode("vertex-creation");
  }

  private onEdgeCreationClick() {
    this.settings.setEditMode("edge-creation");
  }

  private onBidirectionalRadioButtonClick() {
    this.settings.setEdgeVariant("bidirectional");
  }

  private onUnidirectionalRadioButtonClick() {
    this.settings.setEdgeVariant("unidirectional");
  }
}
