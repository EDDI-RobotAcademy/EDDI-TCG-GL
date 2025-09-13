import * as THREE from 'three';
import {DeckMakePopupInputContainerRepository} from './DeckMakePopupInputContainerRepository';
import {DeckMakePopupInputContainer} from "../entity/DeckMakePopupInputContainer";
import {InputContainerGenerator} from "../../input_container/generator";

export class DeckMakePopupInputContainerRepositoryImpl implements DeckMakePopupInputContainerRepository {
    private static instance: DeckMakePopupInputContainerRepositoryImpl;
    private inputContainer: DeckMakePopupInputContainer | null;
    private userInput: string | null;

    private constructor() {
        this.inputContainer = null;
        this.userInput = null;
    }

    public static getInstance(): DeckMakePopupInputContainerRepositoryImpl {
        if (!DeckMakePopupInputContainerRepositoryImpl.instance) {
            DeckMakePopupInputContainerRepositoryImpl.instance = new DeckMakePopupInputContainerRepositoryImpl();
        }
        return DeckMakePopupInputContainerRepositoryImpl.instance;
    }

    public async createDeckMakePopupInputContainer(): Promise<DeckMakePopupInputContainer> {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const containerWidth = 0.28 * windowWidth;
        const containerHeight = 0.05 * windowHeight;
        const containerTop = 0.4675 * windowHeight;
        const containerLeft = 0.3705 * windowWidth;
        const containerPosition = { top: containerTop, left: containerLeft };

        const inputWidth = 0.245 * windowWidth;
        const inputHeight = 0.014 * windowHeight;
        const inputFontSize = 0.009 * windowWidth;

        const maxLength = 12;

        const { container: inputContainerMesh, input: inputElement } = InputContainerGenerator.createInputContainer(
            containerWidth, containerHeight, containerPosition,
            inputWidth, inputHeight, inputFontSize, maxLength, 'deck name'
        );

        InputContainerGenerator.setInputStyle(inputContainerMesh, "rgba(0, 0, 0, 0.5)", "none", "#f0f0f0");

        const newInputContainer = new DeckMakePopupInputContainer(inputContainerMesh, inputElement, containerPosition);
        this.inputContainer = newInputContainer;

        return newInputContainer;
    }

    public findDeckMakePopupInputContainer(): DeckMakePopupInputContainer | null {
        return this.inputContainer;
    }

    public deleteDeckMakePopupInputContainer(): void {
        this.inputContainer = null;
    }

    public findInputValue(): string | null {
        const inputContainer = this.findDeckMakePopupInputContainer();
        if (!inputContainer) return null;

        const inputElement = inputContainer.getInputElement();
        return inputElement.value.trim();
    }

    public updateUserInput(): void {
        const inputContainer = this.findDeckMakePopupInputContainer();
        if (inputContainer){
            this.userInput = inputContainer.getInputElement().value;
        }
        console.log(`user input: ${this.userInput}`);
    }

    public clearUserInput(): void {
        const inputContainer = this.findDeckMakePopupInputContainer();
        if (inputContainer) {
            inputContainer.getInputElement().value = '';
        }
    }

    public findUserInput(): string | null {
        console.log(`Current userInput: ${this.userInput}`);
        return this.userInput;
    }

    public deleteUserInput(): void {
        this.userInput = null;
    }

}
