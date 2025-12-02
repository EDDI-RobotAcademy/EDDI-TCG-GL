import { InputHandler } from "../input/InputManager";
import { KeyboardService } from "./service/KeyboardService";

export class KeyboardInputHandler implements InputHandler {
    constructor(
        private keyboardService: KeyboardService
    ) {}

    handleInput(event: Event): void {
        if (event instanceof KeyboardEvent) {
            switch (event.type) {
                case 'keydown':
                    this.handleKeyDown(event);
                    break;
                case 'keyup':
                    this.handleKeyUp(event);
                    break;
            }
        }
    }

    private handleKeyDown(event: KeyboardEvent): void {
        console.log(`Key pressed: ${event.key}`);
        this.keyboardService.processKeyboard(event.key);
    }

    private handleKeyUp(event: KeyboardEvent): void {
        // 필요시 keyup 처리 로직 추가
        console.log(`Key released: ${event.key}`);
    }
}