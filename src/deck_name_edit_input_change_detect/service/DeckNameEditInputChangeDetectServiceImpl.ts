import * as THREE from "three";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {DeckNameEditInputChangeDetectService} from "./DeckNameEditInputChangeDetectService";
import {DeckNameEditInputChangeDetectRepositoryImpl} from "../repository/DeckNameEditInputChangeDetectRepositoryImpl";
import {DeckNameEditInputContainerRepositoryImpl} from "../../deck_name_edit_input_container/repository/DeckNameEditInputContainerRepositoryImpl";

export class DeckNameEditInputChangeDetectServiceImpl implements DeckNameEditInputChangeDetectService {
    private static instance: DeckNameEditInputChangeDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private deckNameEditInputChangeDetectRepository: DeckNameEditInputChangeDetectRepositoryImpl;
    private deckNameEditInputContainerRepository: DeckNameEditInputContainerRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckNameEditInputChangeDetectRepository = DeckNameEditInputChangeDetectRepositoryImpl.getInstance();
        this.deckNameEditInputContainerRepository = DeckNameEditInputContainerRepositoryImpl.getInstance();
    }

    public static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckNameEditInputChangeDetectServiceImpl {
        if (!DeckNameEditInputChangeDetectServiceImpl.instance) {
            DeckNameEditInputChangeDetectServiceImpl.instance = new DeckNameEditInputChangeDetectServiceImpl(camera, scene);
        }
        return DeckNameEditInputChangeDetectServiceImpl.instance;
    }

    public onInput(event: Event): void {
        const deckNameEditInputContainer = this.deckNameEditInputContainerRepository.findDeckNameEditInputContainer();
        if (!deckNameEditInputContainer) return;

        const inputElement = deckNameEditInputContainer.getInputElement();
        if (!this.deckNameEditInputChangeDetectRepository.isChangeDetectionEnabled()) return;

        const currentValue = this.deckNameEditInputContainerRepository.findInputValue() || "";
        const prevValue = inputElement.dataset.prevValue || "";

        const isDeleting = currentValue.length < prevValue.length;

        if (currentValue.length === 0) {
            this.handleEmptyInputChange();

        } else if (isDeleting) {
            const deletedCount = prevValue.length - currentValue.length;
            if (deletedCount === 1) {
                this.handleSingleCharacterDelete();

            } else {
                this.handleMultiCharacterDelete(currentValue);
            }

        } else {
            // 새 텍스트가 추가된 경우
            this.handleTyping(currentValue);
        }

        inputElement.dataset.prevValue = currentValue;
    }

    private handleEmptyInputChange(): void {
        console.log("[덱 이름 편집창] 입력창 비움 감지(모든 글자 삭제)");
    }

    private handleSingleCharacterDelete(): void {
        console.log("[덱 이름 편집창] 마지막 한 글자 삭제 감지");
    }

    private handleMultiCharacterDelete(currentValue: string): void {
        console.log("[덱 이름 편집창] 여러 글자 삭제 감지:", currentValue);
    }

    private handleTyping(currentValue: string): void {
        console.log("[덱 이름 편집창] 실시간 입력 중:", currentValue);
    }

}
