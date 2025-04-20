import {DeckCardPageMoveButtonClickDetectService} from "./DeckCardPageMoveButtonClickDetectService";

import {MyDeckCardPageMovementButtonRepositoryImpl} from "../../my_deck_card_page_movement_button/repository/MyDeckCardPageMovementButtonRepositoryImpl";
import {MyDeckCardPageMovementButtonRepository} from "../../my_deck_card_page_movement_button/repository/MyDeckCardPageMovementButtonRepository";
import {MyDeckCardPageMovementButton} from "../../my_deck_card_page_movement_button/entity/MyDeckCardPageMovementButton";

import {DeckCardPageMoveButtonClickDetectRepositoryImpl} from "../repository/DeckCardPageMoveButtonClickDetectRepositoryImpl";
import {DeckCardPageMoveButtonClickDetectRepository} from "../repository/DeckCardPageMoveButtonClickDetectRepository";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";

import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";
import {CardPageManager} from "../../my_deck_card_manager/CardPageManager";
import {CardStateManager} from "../../my_deck_card_manager/CardStateManager";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import * as THREE from "three";

export class DeckCardPageMoveButtonClickDetectServiceImpl implements DeckCardPageMoveButtonClickDetectService {
    private static instance: DeckCardPageMoveButtonClickDetectServiceImpl | null = null;

    private myDeckCardPageMovementButtonRepository: MyDeckCardPageMovementButtonRepositoryImpl;
    private deckCardPageMoveButtonClickDetectRepository: DeckCardPageMoveButtonClickDetectRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private myDeckCardRepository: MyDeckCardRepositoryImpl;
    private cardPageManager: CardPageManager;
    private cardStateManager: CardStateManager;

    private cameraRepository: CameraRepository
    private leftMouseDown: boolean = true;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.myDeckCardPageMovementButtonRepository = MyDeckCardPageMovementButtonRepositoryImpl.getInstance();
        this.deckCardPageMoveButtonClickDetectRepository = DeckCardPageMoveButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance();
        this.cameraRepository = CameraRepositoryImpl.getInstance();

        this.cardPageManager = CardPageManager.getInstance();
        this.cardStateManager = CardStateManager.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckCardPageMoveButtonClickDetectServiceImpl {
        if (!DeckCardPageMoveButtonClickDetectServiceImpl.instance) {
            DeckCardPageMoveButtonClickDetectServiceImpl.instance = new DeckCardPageMoveButtonClickDetectServiceImpl(camera, scene);
        }
        return DeckCardPageMoveButtonClickDetectServiceImpl.instance;
    }

    setButtonClickState(state: boolean): void {
        this.leftMouseDown = state;
    }

    getButtonClickState(): boolean {
        return this.leftMouseDown;
    }

    // deck id 마다 페이지 클릭 이벤트가 등록되어야 함.
    async handleLeftClick(
        clickPoint: { x: number; y: number },
    ): Promise<MyDeckCardPageMovementButton | null> {
        const { x, y } = clickPoint;

        const deckCardPageMoveButtonList = this.getAllMovementButton();
        const deckId = this.getCurrentClickDeckButton();
        if (deckId === null) {
            console.error("No deck button clicked");
            return null;
        }

        console.log(`!!!!!!!!!Current DeckId?: ${deckId}`);
        const cardUniqueIdList = this.getCardUniqueIdListByDeckId(deckId);
        const clickedDeckCardPageMovementButton = this.deckCardPageMoveButtonClickDetectRepository.isDeckCardPageMoveButtonClicked(
            { x, y },
            deckCardPageMoveButtonList,
            this.camera
        );

        if (clickedDeckCardPageMovementButton) {
            console.log(`Clicked Deck Page Movement Button ID: ${clickedDeckCardPageMovementButton.id}`);

            if (clickedDeckCardPageMovementButton.id === 0) {
                console.log(`Clicked Pre Page Button!`);
                if (this.getCurrentPage() > 1) {
                    this.setCurrentPageCardVisibility(this.getCurrentPage(), deckId, false);
                    this.setCurrentPage(this.getCurrentPage() - 1);
                    console.log(`[DEBUG]Current Card Page?: ${this.getCurrentPage()}`);
                    this.setCurrentPageCardVisibility(this.getCurrentPage(), deckId, true);
                }
            }

            if (clickedDeckCardPageMovementButton.id === 1) {
                console.log(`Clicked Next Page Button!`);
                if (this.getCurrentPage() < this.getTotalPages(cardUniqueIdList)) {
                    this.setCurrentPageCardVisibility(this.getCurrentPage(), deckId, false);
                    this.setCurrentPage(this.getCurrentPage() + 1);
                    console.log(`[DEBUG]Current Card Page?: ${this.getCurrentPage()}`);
                    this.setCurrentPageCardVisibility(this.getCurrentPage(), deckId, true);
                }
            }
            return clickedDeckCardPageMovementButton;
        }

        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<void> {
        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            await this.handleLeftClick(clickPoint);
        }
    }

    private getAllMovementButton(): MyDeckCardPageMovementButton[] {
        return this.myDeckCardPageMovementButtonRepository.findAll();
    }

    private getCurrentClickDeckButton(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

    private getCurrentPage(): number {
        return this.cardPageManager.getCurrentPage();
    }

    private setCurrentPage(page: number): void {
        this.cardPageManager.setCurrentPage(page);
    }

    private getTotalPages(cardUniqueIdList: number[]): number {
        return this.cardPageManager.getTotalPages(cardUniqueIdList);
    }

    private getCardUniqueIdListByDeckId(deckId: number): number[] {
        return this.myDeckCardRepository.findCardUniqueIdListByDeckId(deckId);
    }

    // 특정 페이지에 해당하는 카드 id 가져오기
    private getCardIdListForPage(page: number, cardUniqueIdList: number[]): number[] {
        return this.cardPageManager.findCardIdsForPage(page, cardUniqueIdList);
    }

    // 특정 덱의 특정 카드 visible 설정
    private setCardVisibility(deckId: number, cardUniqueId: number, isVisible: boolean): void {
        this.cardStateManager.setCardVisibility(deckId, cardUniqueId, isVisible);
    }

    // 특정 덱의 현재 페이지에 해당되는 카드 visible 설정
    private setCurrentPageCardVisibility(page: number, deckId: number, isVisible: boolean): void {
        const cardUniqueIdList = this.getCardUniqueIdListByDeckId(deckId);
        const currentPageCardId = this.getCardIdListForPage(page, cardUniqueIdList);

        currentPageCardId.forEach((cardUniqueId) => {
            this.setCardVisibility(deckId, cardUniqueId, isVisible);
        });
    }

}
