import { EditMode } from "../../types/EditMode";

type Setter = (newEditMode: EditMode) => void;

export default function setupEditModeListeners(setEditMode: Setter) {
  const navigationButton = document.getElementById(
    "navigation-button"
  ) as HTMLButtonElement;
  const vertexCreationButton = document.getElementById(
    "vertex-creation-button"
  ) as HTMLButtonElement;
  const edgeCreationButton = document.getElementById(
    "edge-creation-button"
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
