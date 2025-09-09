import * as THREE from 'three';

import {MyDeckSearchInputContainerService} from './MyDeckSearchInputContainerService';
import {MyDeckSearchInputContainer} from "../entity/MyDeckSearchInputContainer";
import {MyDeckSearchInputContainerRepositoryImpl} from "../repository/MyDeckSearchInputContainerRepositoryImpl";

export class MyDeckSearchInputContainerServiceImpl implements MyDeckSearchInputContainerService {
    private static instance: MyDeckSearchInputContainerServiceImpl;
    private myDeckSearchInputContainerRepository: MyDeckSearchInputContainerRepositoryImpl;

    private constructor() {
        this.myDeckSearchInputContainerRepository = MyDeckSearchInputContainerRepositoryImpl.getInstance();
    }

    public static getInstance(): MyDeckSearchInputContainerServiceImpl {
        if (!MyDeckSearchInputContainerServiceImpl.instance) {
            MyDeckSearchInputContainerServiceImpl.instance = new MyDeckSearchInputContainerServiceImpl();
        }
        return MyDeckSearchInputContainerServiceImpl.instance;
    }

    public async createMyDeckSearchInputContainer(): Promise<HTMLDivElement | null> {
        const inputContainer = await this.myDeckSearchInputContainerRepository.createMyDeckSearchInputContainer();
        const inputContainerMesh = inputContainer.getContainer();

        return inputContainerMesh;
    }

    public adjustMyDeckSearchInputContainerPosition(): void {
        const inputContainer = this.getMyDeckSearchInputContainer();
        if (!inputContainer) {
            console.error("Input container is null. Cannot adjust position.");
            return;
        }
        const inputContainerMesh = inputContainer.getContainer();

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;


        const containerWidth = 0.22 * windowWidth; // 컨테이너 너비
        const containerHeight = 0.01 * windowHeight; // 컨테이너 높이
        const containerTop = 0.21 * windowHeight; // 컨테이너 Y 위치
        const containerLeft = 0.258 * windowWidth; // 컨테이너 X 위치
        const containerPosition = { top: containerTop, left: containerLeft };

        const inputWidth = 0.2 * windowWidth; // 입력창 너비
        const inputHeight = 0.007 * windowHeight; // 입력창 높이
        const inputFontSize = 0.008 * windowWidth; // 입력창 폰트 크기

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

    public getMyDeckSearchInputContainer(): MyDeckSearchInputContainer | null {
        return this.myDeckSearchInputContainerRepository.findMyDeckSearchInputContainer();
    }

}
