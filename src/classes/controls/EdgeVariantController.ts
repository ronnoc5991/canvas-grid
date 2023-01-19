import ids from "../../config/ids";
import { EdgeVariant } from "../../types/EdgeVariant";

type Setter = (newEdgeVariant: EdgeVariant) => void;

// TODO: does this need to be a class?

export default class EdgeVariantController {
  constructor(setEdgeVariant: Setter) {
    const unidirectionalEdgeButton = document.getElementById(
      ids.unidirectionalEdgeButton
    ) as HTMLButtonElement;
    const bidirectionalEdgeButton = document.getElementById(
      ids.bidirectionalEdgeButton
    ) as HTMLButtonElement;
    bidirectionalEdgeButton.addEventListener("click", () => {
      setEdgeVariant("bidirectional");
    });
    unidirectionalEdgeButton.addEventListener("click", () => {
      setEdgeVariant("unidirectional");
    });
  }
}
