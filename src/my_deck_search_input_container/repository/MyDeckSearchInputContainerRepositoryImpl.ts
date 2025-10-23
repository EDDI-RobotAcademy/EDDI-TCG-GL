import * as THREE from 'three';
import {MyDeckSearchInputContainerRepository} from './MyDeckSearchInputContainerRepository';
import {MyDeckSearchInputContainer} from "../entity/MyDeckSearchInputContainer";
import {InputContainerGenerator} from "../../input_container/generator";

export class MyDeckSearchInputContainerRepositoryImpl implements MyDeckSearchInputContainerRepository {
    private static instance: MyDeckSearchInputContainerRepositoryImpl;
    private inputContainer: MyDeckSearchInputContainer | null;

    private constructor() {
        this.inputContainer = null;
    }

    public static getInstance(): MyDeckSearchInputContainerRepositoryImpl {
        if (!MyDeckSearchInputContainerRepositoryImpl.instance) {
            MyDeckSearchInputContainerRepositoryImpl.instance = new MyDeckSearchInputContainerRepositoryImpl();
        }
        return MyDeckSearchInputContainerRepositoryImpl.instance;
    }

    public async createMyDeckSearchInputContainer(): Promise<MyDeckSearchInputContainer> {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const containerWidth = 0.22 * windowWidth;
        const containerHeight = 0.01 * windowHeight;
        const containerTop = 0.21 * windowHeight;
        const containerLeft = 0.258 * windowWidth;
        const containerPosition = { top: containerTop, left: containerLeft };

        const inputWidth = 0.2 * windowWidth;
        const inputHeight = 0.007 * windowHeight;
        const inputFontSize = 0.008 * windowWidth;

        const maxLength = 20;

        const { container: inputContainerMesh, input: inputElement } = InputContainerGenerator.createInputContainer(
            containerWidth, containerHeight, containerPosition,
            inputWidth, inputHeight, inputFontSize, maxLength
        );

//         InputContainerGenerator.setInputStyle(inputContainerMesh, "rgba(0, 0, 0, 0.4)", "0.5px solid #595959", "#f0f0f0");
        InputContainerGenerator.setInputStyle(inputContainerMesh, "transparent", "none", "#f0f0f0");
        const newInputContainer = new MyDeckSearchInputContainer(inputContainerMesh, inputElement, containerPosition);
        this.inputContainer = newInputContainer;

        return newInputContainer;
    }

    public findMyDeckSearchInputContainer(): MyDeckSearchInputContainer | null {
        return this.inputContainer;
    }

    public deleteMyDeckSearchInputContainer(): void {
        this.inputContainer = null;
    }

    public findInputValue(): string | null {
        const inputContainer = this.findMyDeckSearchInputContainer();
        if (!inputContainer) return null;

        const inputElement = inputContainer.getInputElement();
        return inputElement.value.trim();
    }

    public clearUserInput(): void {
        const inputContainer = this.findMyDeckSearchInputContainer();
        if (inputContainer) {
            inputContainer.getInputElement().value = '';
        }
    }

}
