import ids from "../../config/ids";
import { EditMode } from "../../types/EditMode";

type Setter = (newEditMode: EditMode) => void;

// TODO: does this need to be a class?

export default class EditModeController {
  constructor(setEditMode: Setter) {
    const explorationButton = document.getElementById(
      ids.explorationButton
    ) as HTMLButtonElement;
    const vertexCreationButton = document.getElementById(
      ids.vertexCreationButton
    ) as HTMLButtonElement;
    const edgeCreationButton = document.getElementById(
      ids.edgeCreationButton
    ) as HTMLButtonElement;
    explorationButton.addEventListener("click", () => {
      setEditMode("exploration");
    });
    vertexCreationButton?.addEventListener("click", () => {
      setEditMode("vertex-creation");
    });
    edgeCreationButton?.addEventListener("click", () => {
      setEditMode("edge-creation");
    });
  }
}
