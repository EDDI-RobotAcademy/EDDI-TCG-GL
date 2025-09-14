import * as THREE from 'three';

import {DeckNameEditInputContainerService} from './DeckNameEditInputContainerService';
import {DeckNameEditInputContainer} from "../entity/DeckNameEditInputContainer";
import {DeckNameEditInputContainerRepositoryImpl} from "../repository/DeckNameEditInputContainerRepositoryImpl";

export class DeckNameEditInputContainerServiceImpl implements DeckNameEditInputContainerService {
    private static instance: DeckNameEditInputContainerServiceImpl;
    private deckNameEditInputContainerRepository: DeckNameEditInputContainerRepositoryImpl;

    private constructor() {
        this.deckNameEditInputContainerRepository = DeckNameEditInputContainerRepositoryImpl.getInstance();
    }

    public static getInstance(): DeckNameEditInputContainerServiceImpl {
        if (!DeckNameEditInputContainerServiceImpl.instance) {
            DeckNameEditInputContainerServiceImpl.instance = new DeckNameEditInputContainerServiceImpl();
        }
        return DeckNameEditInputContainerServiceImpl.instance;
    }

    public async createDeckNameEditInputContainer(): Promise<HTMLDivElement | null> {
        const inputContainer = await this.deckNameEditInputContainerRepository.createDeckNameEditInputContainer();
        const inputContainerMesh = inputContainer.getContainer();

        return inputContainerMesh;
    }

    public adjustDeckNameEditInputContainerPosition(): void {
        const inputContainer = this.getDeckNameEditInputContainer();
        if (!inputContainer) {
            console.error("Input container is null. Cannot adjust position.");
            return;
        }
        const inputContainerMesh = inputContainer.getContainer();

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;


        const containerWidth = 0.28 * windowWidth; // 컨테이너 너비
        const containerHeight = 0.05 * windowHeight; // 컨테이너 높이
        const containerTop = 0.46 * windowHeight; // 컨테이너 Y 위치
        const containerLeft = 0.3705 * windowWidth; // 컨테이너 X 위치
        const containerPosition = { top: containerTop, left: containerLeft };

        const inputWidth = 0.245 * windowWidth; // 입력창 너비
        const inputHeight = 0.014 * windowHeight; // 입력창 높이
        const inputFontSize = 0.009 * windowWidth; // 입력창 폰트 크기

        // 컨테이너 업데이트
        inputContainerMesh.style.width = `${containerWidth}px`;
        inputContainerMesh.style.height = `${containerHeight}px`;
        inputContainerMesh.style.top = `${containerTop}px`;
        inputContainerMesh.style.left = `${containerLeft}px`;

        // 입력창 업데이트
        const inputElement = inputContainerMesh.querySelector('input');
        if (inputElement) {
            inputElement.style.width = `${inputWidth}px`;
            inputElement.style.height = `${inputHeight}px`;
            inputElement.style.fontSize = `${inputFontSize}px`;
        }

        inputContainer.containerPosition = containerPosition;

    }

    public getDeckNameEditInputContainer(): DeckNameEditInputContainer | null {
        return this.deckNameEditInputContainerRepository.findDeckNameEditInputContainer();
    }

}
