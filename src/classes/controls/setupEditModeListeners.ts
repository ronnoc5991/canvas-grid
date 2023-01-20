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
  const unidirectionalEdgeButton = document.getElementById(
    ids.unidirectionalEdgeButton
  ) as HTMLButtonElement;
  const bidirectionalEdgeButton = document.getElementById(
    ids.bidirectionalEdgeButton
  ) as HTMLButtonElement;

  navigationButton.addEventListener("click", () => {
    setEditMode("navigation");
  });
  vertexCreationButton?.addEventListener("click", () => {
    setEditMode("vertex-creation");
  });
  bidirectionalEdgeButton.addEventListener("click", () => {
    setEditMode("bidirectional-edge-creation");
  });
  unidirectionalEdgeButton.addEventListener("click", () => {
    setEditMode("unidirectional-edge-creation");
  });
}
