import ids from "../config/ids";
import { EdgeVariant } from "../types/EdgeVariant";

type Setter = (newEdgeVariant: EdgeVariant) => void;

// TODO: does this need to be a class?

export default class EdgeVariantController {
  constructor(setEdgeVariant: Setter) {
    const unidirectionalRadioButton = document.getElementById(
      ids.unidirectionalRadioButton
    ) as HTMLElement;
    const bidirectionalRadioButton = document.getElementById(
      ids.bidirectionalRadioButton
    ) as HTMLElement;
    bidirectionalRadioButton.addEventListener("click", () => {
      setEdgeVariant("bidirectional");
    });
    unidirectionalRadioButton.addEventListener("click", () => {
      setEdgeVariant("unidirectional");
    });
  }
}
