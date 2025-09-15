import * as THREE from 'three';
import {DeckNameEditInputContainerRepository} from './DeckNameEditInputContainerRepository';
import {DeckNameEditInputContainer} from "../entity/DeckNameEditInputContainer";
import {InputContainerGenerator} from "../../input_container/generator";

export class DeckNameEditInputContainerRepositoryImpl implements DeckNameEditInputContainerRepository {
    private static instance: DeckNameEditInputContainerRepositoryImpl;
    private inputContainer: DeckNameEditInputContainer | null;
    private userInput: string | null;

    private constructor() {
        this.inputContainer = null;
        this.userInput = null;
    }

    public static getInstance(): DeckNameEditInputContainerRepositoryImpl {
        if (!DeckNameEditInputContainerRepositoryImpl.instance) {
            DeckNameEditInputContainerRepositoryImpl.instance = new DeckNameEditInputContainerRepositoryImpl();
        }
        return DeckNameEditInputContainerRepositoryImpl.instance;
    }

    public async createDeckNameEditInputContainer(): Promise<DeckNameEditInputContainer> {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const containerWidth = 0.28 * windowWidth;
        const containerHeight = 0.05 * windowHeight;
        const containerTop = 0.46 * windowHeight;
        const containerLeft = 0.3705 * windowWidth;
        const containerPosition = { top: containerTop, left: containerLeft };

        const inputWidth = 0.245 * windowWidth;
        const inputHeight = 0.014 * windowHeight;
        const inputFontSize = 0.009 * windowWidth;

        const maxLength = 10;

        const { container: inputContainerMesh, input: inputElement } = InputContainerGenerator.createInputContainer(
            containerWidth, containerHeight, containerPosition,
            inputWidth, inputHeight, inputFontSize, maxLength
        );

        InputContainerGenerator.setInputStyle(inputContainerMesh, "rgba(0, 0, 0, 0.4)", "none", "#f0f0f0");
        const newInputContainer = new DeckNameEditInputContainer(inputContainerMesh, inputElement, containerPosition);
        this.inputContainer = newInputContainer;

        return newInputContainer;
    }

    public findDeckNameEditInputContainer(): DeckNameEditInputContainer | null {
        return this.inputContainer;
    }

    public deleteDeckNameEditInputContainer(): void {
        this.inputContainer = null;
    }

    public findInputValue(): string | null {
        const inputContainer = this.findDeckNameEditInputContainer();
        if (!inputContainer) return null;

        const inputElement = inputContainer.getInputElement();
//         return inputElement.value.trim(); // 공백 제거
        return inputElement.value;
    }

    // To-do: 필요 없을 것 같은 메서드
    public updateUserInput(): void {
        const inputContainer = this.findDeckNameEditInputContainer();
        if (inputContainer) {
            this.userInput = inputContainer.getInputElement().value;
        }
        console.log(`user input: ${this.userInput}`);
    }

    public clearUserInput(): void {
        const inputContainer = this.findDeckNameEditInputContainer();
        if (inputContainer) {
            inputContainer.getInputElement().value = '';
        }
    }

    // To-do: 필요 없을 것 같은 메서드
    public findUserInput(): string | null {
        console.log(`Current userInput: ${this.userInput}`);
        return this.userInput;
    }

    public deleteUserInput(): void {
        this.userInput = null;
    }

}
