import {InputHandler} from "../input/InputManager";
import {LeftClickDetectService} from "../left_click_detect/service/LeftClickDetectService";
import {RightClickDetectService} from "../right_click_detect/service/RightClickDetectService";
import {DragMoveService} from "../drag_move/service/DragMoveService";
import {MouseDropService} from "../mouse_drop/service/MouseDropService";
import {LeftClickedArea} from "../left_click_detect/entity/LeftClickedArea";

export class MouseInputHandler implements InputHandler {
    constructor(
        private leftClickService: LeftClickDetectService,
        private rightClickService: RightClickDetectService,
        private dragMoveService: DragMoveService,
        private mouseDropService: MouseDropService
    ) {}

    handleInput(event: Event): void {
        if (event instanceof MouseEvent) {
            switch (event.type) {
                case 'mousedown':
                    this.handleMouseDown(event);
                    break;
                case 'mousemove':
                    this.handleMouseMove(event);
                    break;
                case 'mouseup':
                    this.handleMouseUp(event);
                    break;
                case 'contextmenu':
                    event.preventDefault();
                    break;
            }
        }
    }

    private async handleMouseDown(event: MouseEvent): Promise<void> {
        if (event.button === 0) {
            const result = await this.leftClickService.handleLeftClick(event);
            if (result !== null) {
                this.leftClickService.setLeftMouseDown(true);
            }
        } else if (event.button === 2) {
            event.preventDefault();
            const result = await this.rightClickService.handleRightClick(event);
            if (result !== null) {
                this.rightClickService.setRightMouseDown(true);
            }
        }
    }

    private handleMouseMove(event: MouseEvent): void {
        if (this.dragMoveService.getLeftClickedArea() === LeftClickedArea.YOUR_HAND
            && this.leftClickService.isLeftMouseDown()) {
            this.dragMoveService.onMouseMove(event);
        }
    }

    private handleMouseUp(event: MouseEvent): void {
        if (this.dragMoveService.getLeftClickedArea() === LeftClickedArea.YOUR_HAND
            && this.leftClickService.isLeftMouseDown()) {
            this.mouseDropService.onMouseUp();
            this.leftClickService.setLeftMouseDown(false);
        }
    }
}