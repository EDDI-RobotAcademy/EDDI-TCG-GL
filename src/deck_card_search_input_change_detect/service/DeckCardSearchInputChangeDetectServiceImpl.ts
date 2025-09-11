import * as THREE from "three";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {DeckCardSearchInputChangeDetectService} from "./DeckCardSearchInputChangeDetectService";
import {DeckCardSearchInputChangeDetectRepositoryImpl} from "../repository/DeckCardSearchInputChangeDetectRepositoryImpl";
import {MyDeckSearchInputContainerRepositoryImpl} from "../../my_deck_search_input_container/repository/MyDeckSearchInputContainerRepositoryImpl";
import {MyDeckCardSearchCancelButtonRepositoryImpl} from "../../my_deck_card_search_cancel_button/repository/MyDeckCardSearchCancelButtonRepositoryImpl";
import {DeckCardSearchCancelButtonClickDetectRepositoryImpl} from "../../deck_card_search_cancel_button_click_detect/repository/DeckCardSearchCancelButtonClickDetectRepositoryImpl";

export class DeckCardSearchInputChangeDetectServiceImpl implements DeckCardSearchInputChangeDetectService {
    private static instance: DeckCardSearchInputChangeDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private deckCardSearchInputChangeDetectRepository: DeckCardSearchInputChangeDetectRepositoryImpl;
    private myDeckSearchInputContainerRepository: MyDeckSearchInputContainerRepositoryImpl;
    private myDeckCardSearchCancelButtonRepository: MyDeckCardSearchCancelButtonRepositoryImpl;
    private deckCardSearchCancelButtonClickDetectRepository: DeckCardSearchCancelButtonClickDetectRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckCardSearchInputChangeDetectRepository = DeckCardSearchInputChangeDetectRepositoryImpl.getInstance();
        this.myDeckSearchInputContainerRepository = MyDeckSearchInputContainerRepositoryImpl.getInstance();
        this.myDeckCardSearchCancelButtonRepository = MyDeckCardSearchCancelButtonRepositoryImpl.getInstance();
        this.deckCardSearchCancelButtonClickDetectRepository = DeckCardSearchCancelButtonClickDetectRepositoryImpl.getInstance();
    }

    public static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckCardSearchInputChangeDetectServiceImpl {
        if (!DeckCardSearchInputChangeDetectServiceImpl.instance) {
            DeckCardSearchInputChangeDetectServiceImpl.instance = new DeckCardSearchInputChangeDetectServiceImpl(camera, scene);
        }
        return DeckCardSearchInputChangeDetectServiceImpl.instance;
    }

    public onInput(event: Event): void {
        const searchInputContainer = this.myDeckSearchInputContainerRepository.findMyDeckSearchInputContainer();
        if (!searchInputContainer) return;

        const inputElement = searchInputContainer.getInputElement();
        if (!this.deckCardSearchInputChangeDetectRepository.isChangeDetectionEnabled()) return;

        const currentValue = this.myDeckSearchInputContainerRepository.findInputValue() || "";
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
        console.log("[EVENT] 입력창 비움 감지(모든 글자 삭제)");
        // 전체 카드 복원, UI 초기화 등 처리
        this.setSearchCancelButtonVisibility(false);
        this.setSearchCancelButtonClickEnabled(false);
    }

    private handleSingleCharacterDelete(): void {
        console.log("[EVENT] 마지막 한 글자 삭제 감지");
        // 최소 글자 수 알림 등 처리
    }

    private handleMultiCharacterDelete(currentValue: string): void {
        console.log("[EVENT] 여러 글자 삭제 감지:", currentValue);
        // 일부 필터링, UI 재조정 등 처리
    }

    private handleTyping(currentValue: string): void {
        console.log("[EVENT] 실시간 입력 중:", currentValue);
        this.setSearchCancelButtonVisibility(true);
        this.setSearchCancelButtonClickEnabled(true);
    }

    private setSearchCancelButtonVisibility(isVisible: boolean): void {
        this.myDeckCardSearchCancelButtonRepository.findButton()?.setVisibility(isVisible);
    }

    private setSearchCancelButtonClickEnabled(isEnable: boolean): void {
        this.deckCardSearchCancelButtonClickDetectRepository.setButtonClickEnabled(isEnable);
    }

}
