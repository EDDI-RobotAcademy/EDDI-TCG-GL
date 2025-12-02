export interface InputHandler {
    handleInput(event: Event): void;
}

export class InputManager {
    private handlers: Map<string, InputHandler[]> = new Map();

    register(eventType: string, handler: InputHandler): void {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType)!.push(handler);
    }

    unregister(eventType: string, handler: InputHandler): void {
        const handlers = this.handlers.get(eventType);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    setupListeners(element: HTMLElement): void {
        element.addEventListener('mousedown', (e) => this.dispatch('mousedown', e));
        element.addEventListener('mousemove', (e) => this.dispatch('mousemove', e));
        element.addEventListener('mouseup', (e) => this.dispatch('mouseup', e));
        element.addEventListener('click', (e) => this.dispatch('click', e));
        element.addEventListener('contextmenu', (e) => this.dispatch('contextmenu', e));
        document.addEventListener('keydown', (e) => this.dispatch('keydown', e));
    }

    private dispatch(eventType: string, event: Event): void {
        const handlers = this.handlers.get(eventType);
        if (handlers) {
            handlers.forEach(handler => handler.handleInput(event));
        }
    }
}