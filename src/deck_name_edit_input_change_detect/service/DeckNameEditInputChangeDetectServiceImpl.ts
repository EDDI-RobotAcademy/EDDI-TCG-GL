import * as THREE from "three";

import {DeckNameEditInfoTextType} from "../../deck_name_edit_info_text/entity/DeckNameEditInfoTextType";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {DeckNameEditInputChangeDetectService} from "./DeckNameEditInputChangeDetectService";
import {DeckNameEditInputChangeDetectRepositoryImpl} from "../repository/DeckNameEditInputChangeDetectRepositoryImpl";
import {DeckNameEditInputContainerRepositoryImpl} from "../../deck_name_edit_input_container/repository/DeckNameEditInputContainerRepositoryImpl";
import {MyDeckNameTextRepositoryImpl} from "../../my_deck_name_text/repository/MyDeckNameTextRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {DeckNameEditInfoTextRepositoryImpl} from "../../deck_name_edit_info_text/repository/DeckNameEditInfoTextRepositoryImpl";

export class DeckNameEditInputChangeDetectServiceImpl implements DeckNameEditInputChangeDetectService {
    private static instance: DeckNameEditInputChangeDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private deckNameEditInputChangeDetectRepository: DeckNameEditInputChangeDetectRepositoryImpl;
    private deckNameEditInputContainerRepository: DeckNameEditInputContainerRepositoryImpl;
    private myDeckNameTextRepository: MyDeckNameTextRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private deckNameEditInfoTextRepository: DeckNameEditInfoTextRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckNameEditInputChangeDetectRepository = DeckNameEditInputChangeDetectRepositoryImpl.getInstance();
        this.deckNameEditInputContainerRepository = DeckNameEditInputContainerRepositoryImpl.getInstance();
        this.myDeckNameTextRepository = MyDeckNameTextRepositoryImpl.getInstance(scene);
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.deckNameEditInfoTextRepository = DeckNameEditInfoTextRepositoryImpl.getInstance(scene);
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

        if (currentValue.length > 0) {
            this.validateInput(currentValue);
        }

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
        const rules: { check: (v: string) => boolean; type: DeckNameEditInfoTextType }[] = [
            { check: this.isOverMaxLength, type: DeckNameEditInfoTextType.OVERFLOW },
            { check: this.hasSpecialCharacter, type: DeckNameEditInfoTextType.SPECIAL_CHARACTER },
            { check: this.isExistingDeckName, type: DeckNameEditInfoTextType.EXIST },
        ];

        // 모든 안내 문구 숨기기
        Object.values(DeckNameEditInfoTextType).forEach((type) => {
            this.setInfoTextVisibility(type as DeckNameEditInfoTextType, false);
        });

        // 조건에 맞는 안내 문구 보이기
        for (const rule of rules) {
            if (rule.check.call(this, currentValue)) {
                this.setInfoTextVisibility(rule.type, true);
                return; // 하나만 켜고 종료 (여러 개 동시에 안 보이게 하고 싶다면)
            }
        }

        // 어떤 룰에도 걸리지 않으면 기본 안내 문구를 보여줌
        this.setInfoTextVisibility(DeckNameEditInfoTextType.ENABLE, true);
    }

    private handleEmptyInputChange(): void {
        console.log("[덱 이름 편집창] 입력창 비움 감지(모든 글자 삭제)");
        Object.values(DeckNameEditInfoTextType).forEach((type) => {
            this.setInfoTextVisibility(type as DeckNameEditInfoTextType, false);
        });
        this.setInfoTextVisibility(DeckNameEditInfoTextType.DEFAULT, true);
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
        const regex = /[^a-zA-Z가-힣ㄱ-ㅎㅏ-ㅣ\s]/;
        return regex.test(currentValue); // 특수문자 포함시 true 반환
    }

    private enforceMaxLength(inputElement: HTMLInputElement, maxLength: number): void {
        if (inputElement.value.length > maxLength) {
            inputElement.value = inputElement.value.slice(0, maxLength);
        }
    }

    private isExistingDeckName(currentValue: string): boolean {
        const currentClickedDeckId = this.myDeckButtonClickDetectRepository.getCurrentClickDeckId();
        if (currentClickedDeckId == null) return false;

        const currentDeckName = this.myDeckNameTextRepository.findDeckNameByDeckId(currentClickedDeckId);
        if (currentDeckName == null) return false;

        const deckNameList = this.myDeckNameTextRepository.findDeckNameList();
        // 현재 덱 이름을 제외한 리스트
        const filteredDeckNameList = deckNameList.filter(name => name !== currentDeckName);

        return filteredDeckNameList.includes(currentValue);
    }

    private setInfoTextVisibility(type: DeckNameEditInfoTextType, isVisible: boolean): void {
        this.deckNameEditInfoTextRepository.findInfoTextByType(type)?.setVisibility(isVisible);
    }

}
