import { EdgeVariant } from "../types/EdgeVariant";
import { EditMode } from "../types/EditMode";

export default class Settings {
  private editMode: EditMode;
  private edgeVariant: EdgeVariant;

  constructor() {
    this.editMode = "exploration";
    this.edgeVariant = "bidirectional";
  }

  public getEditMode() {
    return this.editMode;
  }

  public getEdgeVariant() {
    return this.edgeVariant;
  }

  public setEditMode(newEditMode: EditMode) {
    this.editMode = newEditMode;
  }

  public setEdgeVariant(newEdgeVariant: EdgeVariant) {
    this.edgeVariant = newEdgeVariant;
  }
}
