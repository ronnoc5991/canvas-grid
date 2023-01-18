import { EdgeVariant } from "../types/EdgeVariant";
import { EditMode } from "../types/EditMode";
import { Position } from "../types/Position";

// RESPONSIBILIES:
// - hold the settings of the app
// - Controls will change these settings

export default class Settings {
  public editMode: EditMode;
  public edgeVariant: EdgeVariant;
  public isDragging: boolean;
  public previousMousePosition: Position;

  constructor() {
    this.editMode = "exploration";
    this.edgeVariant = "bidirectional";
    this.isDragging = false;
    this.previousMousePosition = {
      x: 0,
      y: 0,
    };
  }

  public setPreviousMousePosition(x: number, y: number) {
    this.previousMousePosition.x = x;
    this.previousMousePosition.y = y;
  }
}
