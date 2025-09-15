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

        this.handleInputChange(currentValue, prevValue);
        this.validateInput(currentValue);
        this.enforceMaxLength(inputElement, 10);

        // To-do: 확인용이므로 나중에 지워야 함
        console.log(`입력 글자의 개수: ${inputElement.maxLength}, 타입은: ${inputElement.type}`);
        inputElement.dataset.prevValue = currentValue;
    }

    // 변경 유형 판별
    private handleInputChange(currentValue: string, prevValue: string): void {
        if (currentValue.length === 0) {
            this.handleEmptyInputChange();
            return;
        }

        const isDeleting = currentValue.length < prevValue.length;
        if (isDeleting) {
            const deletedCount = prevValue.length - currentValue.length;
            deletedCount === 1
                ? this.handleSingleCharacterDelete()
                : this.handleMultiCharacterDelete(currentValue);
        } else {
            this.handleTyping(currentValue);
        }
    }

    // 유효성 검사
    private validateInput(currentValue: string): void {
        if (this.isOverMaxLength(currentValue)) {
            console.log(`⚠️ 10글자 초과`);
        }
        if (this.hasSpecialCharacter(currentValue)) {
            console.log(`⚠️ 특수 문자 포함`);
        }
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

    private isOverMaxLength(currentValue: string): boolean {
        return currentValue.length > 10; // 10글자 초과 시 true 반환
    }

    private hasSpecialCharacter(currentValue: string): boolean {
        // 한글, 영어만 허용 → 나머지는 특수문자로 처리
        const regex = /[^a-zA-Z가-힣\s]/;
        return regex.test(currentValue); // 특수문자 포함시 true 반환
    }

    private enforceMaxLength(inputElement: HTMLInputElement, maxLength: number): void {
        if (inputElement.value.length > maxLength) {
            inputElement.value = inputElement.value.slice(0, maxLength);
        }
    }

}
