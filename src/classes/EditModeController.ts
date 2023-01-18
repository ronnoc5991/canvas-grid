import ids from "../config/ids";
import { EditMode } from "../types/EditMode";

export default class EditModeController {
  private explorationButton: HTMLButtonElement;
  private vertexCreationButton: HTMLButtonElement;
  private edgeCreationButton: HTMLButtonElement;

  constructor(private setEditMode: (newEditMode: EditMode) => void) {
    this.explorationButton = document.getElementById(
      ids.explorationButton
    ) as HTMLButtonElement;
    this.vertexCreationButton = document.getElementById(
      ids.vertexCreationButton
    ) as HTMLButtonElement;
    this.edgeCreationButton = document.getElementById(
      ids.edgeCreationButton
    ) as HTMLButtonElement;
    this.explorationButton.addEventListener("click", () => {
      this.setEditMode("exploration");
    });
    this.vertexCreationButton?.addEventListener("click", () => {
      this.setEditMode("vertex-creation");
    });
    this.edgeCreationButton?.addEventListener("click", () => {
      this.setEditMode("edge-creation");
    });
  }
}
