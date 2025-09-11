import * as THREE from "three";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {DeckCardSearchInputChangeDetectService} from "./DeckCardSearchInputChangeDetectService";
import {DeckCardSearchInputChangeDetectRepositoryImpl} from "../repository/DeckCardSearchInputChangeDetectRepositoryImpl";
import {MyDeckSearchInputContainerRepositoryImpl} from "../../my_deck_search_input_container/repository/MyDeckSearchInputContainerRepositoryImpl";

export class DeckCardSearchInputChangeDetectServiceImpl implements DeckCardSearchInputChangeDetectService {
    private static instance: DeckCardSearchInputChangeDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private deckCardSearchInputChangeDetectRepository: DeckCardSearchInputChangeDetectRepositoryImpl;
    private myDeckSearchInputContainerRepository: MyDeckSearchInputContainerRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckCardSearchInputChangeDetectRepository = DeckCardSearchInputChangeDetectRepositoryImpl.getInstance();
        this.myDeckSearchInputContainerRepository = MyDeckSearchInputContainerRepositoryImpl.getInstance();
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
            // 입력창이 전부 지워진 경우
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
        console.log("[EVENT] 입력창 비움 감지");
        // 전체 카드 복원, UI 초기화 등 처리
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
        // 실시간 감지
    }

}
