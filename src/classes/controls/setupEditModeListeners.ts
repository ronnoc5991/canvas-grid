import ids from "../../config/ids";
import { EditMode } from "../../types/EditMode";

type Setter = (newEditMode: EditMode) => void;

export default function setupEditModeListeners(setEditMode: Setter) {
  const navigationButton = document.getElementById(
    ids.navigationButton
  ) as HTMLButtonElement;
  const vertexCreationButton = document.getElementById(
    ids.vertexCreationButton
  ) as HTMLButtonElement;
  const edgeCreationButton = document.getElementById(
    ids.edgeCreationButton
  ) as HTMLButtonElement;

  navigationButton.addEventListener("click", () => {
    setEditMode("navigation");
  });
  vertexCreationButton?.addEventListener("click", () => {
    setEditMode("vertex-creation");
  });
  edgeCreationButton.addEventListener("click", () => {
    setEditMode("edge-creation");
  });
}
