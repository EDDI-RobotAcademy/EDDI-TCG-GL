import {IdGenerator} from "../../common/id_generator/IdGenerator";

export class MyDeckSearchInputContainer {
    id: number;
    container: HTMLDivElement;
    containerPosition: { top: number, left: number };

    constructor(container: HTMLDivElement, containerPosition: { top: number, left: number }) {
        this.id = IdGenerator.generateId("MyDeckSearchInputContainer");
        this.container = container;
        this.container.style.display = 'block'
        this.containerPosition = containerPosition;
    }

    public getContainer(): HTMLDivElement {
        return this.container;
    }

    public setVisibility(isVisible: 'block' | 'none'): void {
        this.container.style.display = isVisible;
    }

    public getVisibility(): string {
        return this.container.style.display;
    }

//     public getVisibility(): CSSStyleDeclaration['display'] {
//         return this.container.style.display;
//     }

}
