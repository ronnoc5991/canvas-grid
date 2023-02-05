import { Position } from "../types/Position";

type OnDrag = (deltaX: number, deltaY: number) => void;
type OnUp = (event: MouseEvent) => void;

const DRAGGING_THRESHOLD: number = 5;

// could update it on every mouseMove?
// could also subscribe to edit mode changes so I know when to update my follower type?

// create a mouse follower for each mode
// dont tell the mouse about the mode
// set the follower from the controls?
// follower does not have to be on the canvas...
// could it be a dom element?

export default class Mouse {
  private isDown: boolean = false;
  private isDragging: boolean = false;
  private previousPosition: Position = { x: 0, y: 0 };

  constructor(
    canvas: HTMLCanvasElement,
    private onDrag: OnDrag,
    private onUp: OnUp
  ) {
    canvas.addEventListener("mousedown", (event) => {
      this.onDown(event);
    });
    canvas.addEventListener("mouseup", (event) => {
      if (!this.isDragging) this.onUp(event);
      this.isDown = false;
      this.isDragging = false;
    });
    canvas.addEventListener("mousemove", (event) => {
      this.onMove(event);
    });
  }

  private onDown(event: MouseEvent) {
    this.isDown = true;
    this.setPreviousPosition(event.clientX, event.clientY);
  }

  private onMove(event: MouseEvent) {
    if (!this.isDown) return;
    if (this.isDragging) {
      const deltaX = event.clientX - this.previousPosition.x;
      const deltaY = event.clientY - this.previousPosition.y;
      this.setPreviousPosition(event.clientX, event.clientY);
      this.onDrag(deltaX, deltaY);
      return;
    }
    if (this.hasStartedDragging(event)) {
      this.setPreviousPosition(event.clientX, event.clientY);
      this.isDragging = true;
    }
  }

  private hasStartedDragging({ clientX, clientY }: MouseEvent): boolean {
    return (
      Math.abs(clientX - this.previousPosition.x) > DRAGGING_THRESHOLD ||
      Math.abs(clientY - this.previousPosition.y) > DRAGGING_THRESHOLD
    );
  }

  private setPreviousPosition(x: number, y: number): void {
    this.previousPosition.x = x;
    this.previousPosition.y = y;
  }
}
