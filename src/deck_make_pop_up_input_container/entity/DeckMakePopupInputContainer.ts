import {IdGenerator} from "../../common/id_generator/IdGenerator";

export class DeckMakePopupInputContainer {
    id: number;
    container: HTMLDivElement;
    inputElement: HTMLInputElement;
    containerPosition: { top: number, left: number };

    constructor(container: HTMLDivElement, inputElement: HTMLInputElement, containerPosition: { top: number, left: number }) {
        this.id = IdGenerator.generateId("DeckMakePopupInputContainer");
        this.container = container;
        this.inputElement = inputElement;
        this.container.style.display = 'none'
        this.containerPosition = containerPosition;
    }

    public getContainer(): HTMLDivElement {
        return this.container;
    }

    public getInputElement(): HTMLInputElement {
        return this.inputElement;
    }

    public setVisibility(isVisible: 'block' | 'none'): void {
        this.container.style.display = isVisible;
    }

    public getVisibility(): string {
        return this.container.style.display;
    }

}
