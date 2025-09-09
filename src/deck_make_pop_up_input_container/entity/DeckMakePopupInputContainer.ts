import {IdGenerator} from "../../common/id_generator/IdGenerator";

export class DeckMakePopupInputContainer {
    id: number;
    container: HTMLDivElement;
    containerPosition: { top: number, left: number };

    constructor(container: HTMLDivElement, containerPosition: { top: number, left: number }) {
        this.id = IdGenerator.generateId("DeckMakePopupInputContainer");
        this.container = container;
        this.containerPosition = containerPosition;
    }

    public getContainer(): HTMLDivElement {
        return this.container;
    }

}
