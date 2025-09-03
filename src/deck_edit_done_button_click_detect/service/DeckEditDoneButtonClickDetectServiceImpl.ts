import * as THREE from "three";
import {getCardById} from "../../card/utility";
import {CardCountManager} from "../../my_deck_card_manager/CardCountManager";

import {DeckEditDoneButton} from "../../deck_edit_done_button/entity/DeckEditDoneButton";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {DeckEditDoneButtonClickDetectService} from "./DeckEditDoneButtonClickDetectService";
import {DeckEditDoneButtonClickDetectRepositoryImpl} from "../repository/DeckEditDoneButtonClickDetectRepositoryImpl";
import {DeckEditDoneButtonRepositoryImpl} from "../../deck_edit_done_button/repository/DeckEditDoneButtonRepositoryImpl";
import {DeckEditButtonClickDetectRepositoryImpl} from "../../deck_edit_button_click_detect/repository/DeckEditButtonClickDetectRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {MyDeckCardMapRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardMapRepositoryImpl";

export class DeckEditDoneButtonClickDetectServiceImpl implements DeckEditDoneButtonClickDetectService {
    private static instance: DeckEditDoneButtonClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private cardCountManager: CardCountManager;
    private deckEditDoneButtonClickDetectRepository: DeckEditDoneButtonClickDetectRepositoryImpl;
    private deckEditDoneButtonRepository: DeckEditDoneButtonRepositoryImpl;
    private deckEditButtonClickDetectRepository: DeckEditButtonClickDetectRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private myDeckCardMapRepository: MyDeckCardMapRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.cardCountManager = CardCountManager.getInstance();
        this.deckEditDoneButtonClickDetectRepository = DeckEditDoneButtonClickDetectRepositoryImpl.getInstance();
        this.deckEditDoneButtonRepository = DeckEditDoneButtonRepositoryImpl.getInstance();
        this.deckEditButtonClickDetectRepository = DeckEditButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckCardMapRepository = MyDeckCardMapRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckEditDoneButtonClickDetectServiceImpl {
        if (!DeckEditDoneButtonClickDetectServiceImpl.instance) {
            DeckEditDoneButtonClickDetectServiceImpl.instance = new DeckEditDoneButtonClickDetectServiceImpl(camera, scene);
        }
        return DeckEditDoneButtonClickDetectServiceImpl.instance;
    }

    private setButtonClickEnabled(isEnabled: boolean): void {
        this.deckEditDoneButtonClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private isButtonClickEnabled(): boolean {
        return this.deckEditDoneButtonClickDetectRepository.isButtonClickEnabled();
    }

    public async handleClick(clickPoint: { x: number; y: number }): Promise<DeckEditDoneButton | null> {
        const { x, y } = clickPoint;
        const currentClickedDeckButtonId = this.getCurrentClickDeckButtonId();
        if (currentClickedDeckButtonId == null) return null;

        const button = this.getDeckEditDoneButton();
        if (button == null) return null;

        const clickedButton = this.deckEditDoneButtonClickDetectRepository.isDeckEditDoneButtonClicked(
            { x, y },
            button,
            this.camera);

        if (clickedButton) {
            this.saveCurrentButtonClickState(true);
            console.log(`%c Clicked Deck Edit Done Button`, 'color: #ffbb00; font-weight: bold;');

            const selectedTotalCardCount = this.cardCountManager.findTotalSelectedCardCount(currentClickedDeckButtonId);
            if (selectedTotalCardCount == 40) {
                console.log(`%c 덱 편집 완료 버튼 클릭 화면 전환 필요 `, 'color: #087500; font-weight: bold;');
                // To-do: 편집 완료 버튼 클릭시 map 데이터에 반영
                this.saveDeckCardCountInfo(currentClickedDeckButtonId);

            } else {
                // To-do: 미충족 알림 팝업창 제작 필요
                console.warn(
                    `%c [DEBUG] 덱을 구성하는 카드의 개수가 부족합니다.(현재 총 카드 개수: ${selectedTotalCardCount})`,
                     'color: #a80000; font-weight: bold;'
                );
                return null;
            }
            return clickedButton;
        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeckEditDoneButton | null> {
        if (!this.isButtonClickEnabled()) return null;
        if (this.getDeckEditDoneButtonVisibility() == false) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            const result = await this.handleClick(clickPoint);
            if (result) {
                this.setInteractionStatesAfterClick();
                return result;
            }
        }
        return null;
    }

    private setInteractionStatesAfterClick(): void {
        this.deckEditButtonClickDetectRepository.setButtonClickEnabled(true);
        this.setButtonClickEnabled(false);
    }

    private getDeckEditDoneButton(): DeckEditDoneButton | null {
        return this.deckEditDoneButtonRepository.findButtonById(1);
    }

    private saveCurrentButtonClickState(state: boolean): void {
        this.deckEditDoneButtonClickDetectRepository.saveCurrentButtonClickState(state);
    }

    public getCurrentButtonClickState(): boolean | null {
        return this.deckEditDoneButtonClickDetectRepository.getCurrentButtonClickState();
    }

    private getDeckEditDoneButtonVisibility(): boolean | undefined {
        const button = this.getDeckEditDoneButton();
        if (button !== null) {
            return button.getVisibility();
        }
    }

    private getCurrentClickDeckButtonId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

    private saveDeckCardCountInfo(deckId: number): void {
        // 덱 초기화 (기존 데이터 삭제)
        this.myDeckCardMapRepository.deleteMyDeck(deckId);

        // 편집 완료한 덱의 카드 아이디 목록 가져오기
        const cardIdList = this.cardCountManager.findSelectedCardIdListByDeck(deckId);

        // 정보 저장(서버에 보낼 데이터)
        for (const cardId of cardIdList) {
            const cardCount = this.cardCountManager.findSelectedCardCountByDeck(deckId, cardId);
            this.myDeckCardMapRepository.addMyDeckCard(deckId, cardId, cardCount);
        }

        // To-do: 확인용 나중에 제거 필요
        this.myDeckCardMapRepository.findCardInfosByDeckId(deckId);
    }

}
