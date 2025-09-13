import * as THREE from 'three';

import {DeckMakePopupInputContainerService} from './DeckMakePopupInputContainerService';
import {DeckMakePopupInputContainer} from "../entity/DeckMakePopupInputContainer";
import {DeckMakePopupInputContainerRepository} from "../repository/DeckMakePopupInputContainerRepository";
import {DeckMakePopupInputContainerRepositoryImpl} from "../repository/DeckMakePopupInputContainerRepositoryImpl";

export class DeckMakePopupInputContainerServiceImpl implements DeckMakePopupInputContainerService {
    private static instance: DeckMakePopupInputContainerServiceImpl;
    private deckMakePopupInputContainerRepository: DeckMakePopupInputContainerRepository;

    private constructor(deckMakePopupInputContainerRepository: DeckMakePopupInputContainerRepository) {
        this.deckMakePopupInputContainerRepository = deckMakePopupInputContainerRepository;
    }

    public static getInstance(): DeckMakePopupInputContainerServiceImpl {
        if (!DeckMakePopupInputContainerServiceImpl.instance) {
            const deckMakePopupInputContainerRepository = DeckMakePopupInputContainerRepositoryImpl.getInstance();
            DeckMakePopupInputContainerServiceImpl.instance = new DeckMakePopupInputContainerServiceImpl(deckMakePopupInputContainerRepository);
        }
        return DeckMakePopupInputContainerServiceImpl.instance;
    }

    public async createDeckMakePopupInputContainer(): Promise<HTMLDivElement | null> {
        const inputContainer = await this.deckMakePopupInputContainerRepository.createDeckMakePopupInputContainer();
        const inputContainerMesh = inputContainer.getContainer();

        return inputContainerMesh;
    }

    public adjustDeckMakePopupInputContainerPosition(): void {
        const inputContainer = this.getDeckMakePopupInputContainer();
        if (!inputContainer) {
            console.error("Input container is null. Cannot adjust position.");
            return;
        }
        const inputContainerMesh = inputContainer.getContainer();

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;


        const containerWidth = 0.28 * windowWidth; // 컨테이너 너비
        const containerHeight = 0.05 * windowHeight; // 컨테이너 높이
        const containerTop = 0.4675 * windowHeight; // 컨테이너 Y 위치
        const containerLeft = 0.3705 * windowWidth; // 컨테이너 X 위치
        const containerPosition = { top: containerTop, left: containerLeft };

        const inputWidth = 0.25 * windowWidth; // 입력창 너비
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

    public getDeckMakePopupInputContainer(): DeckMakePopupInputContainer | null {
        return this.deckMakePopupInputContainerRepository.findDeckMakePopupInputContainer();
    }

    public deleteDeckMakePopupInputContainer(): void {
        this.deckMakePopupInputContainerRepository.deleteDeckMakePopupInputContainer();
    }

}
