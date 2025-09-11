import * as THREE from "three";

import {DeckCardSearchCancelButtonClickDetectService} from "./DeckCardSearchCancelButtonClickDetectService";
import {DeckCardSearchCancelButtonClickDetectRepositoryImpl} from "../repository/DeckCardSearchCancelButtonClickDetectRepositoryImpl";

import {MyDeckCardSearchCancelButton} from "../../my_deck_card_search_cancel_button/entity/MyDeckCardSearchCancelButton";
import {MyDeckCardSearchCancelButtonRepositoryImpl} from "../../my_deck_card_search_cancel_button/repository/MyDeckCardSearchCancelButtonRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";
import {MyDeckCardPositionRepositoryImpl} from "../../my_deck_card_position/repository/MyDeckCardPositionRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {MyDeckElementAdjuster} from "../../my_deck_element_adjuster/MyDeckElementAdjuster";

export class DeckCardSearchCancelButtonClickDetectServiceImpl implements DeckCardSearchCancelButtonClickDetectService {
    private static instance: DeckCardSearchCancelButtonClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private myDeckElementAdjuster: MyDeckElementAdjuster;
    private deckCardSearchCancelButtonClickDetectRepository: DeckCardSearchCancelButtonClickDetectRepositoryImpl;
    private myDeckCardSearchCancelButtonRepository: MyDeckCardSearchCancelButtonRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private myDeckCardRepository: MyDeckCardRepositoryImpl;
    private myDeckCardPositionRepository: MyDeckCardPositionRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.myDeckElementAdjuster = MyDeckElementAdjuster.getInstance();
        this.deckCardSearchCancelButtonClickDetectRepository = DeckCardSearchCancelButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckCardSearchCancelButtonRepository = MyDeckCardSearchCancelButtonRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance(scene);
        this.myDeckCardPositionRepository = MyDeckCardPositionRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckCardSearchCancelButtonClickDetectServiceImpl {
        if (!DeckCardSearchCancelButtonClickDetectServiceImpl.instance) {
            DeckCardSearchCancelButtonClickDetectServiceImpl.instance = new DeckCardSearchCancelButtonClickDetectServiceImpl(camera, scene);
        }
        return DeckCardSearchCancelButtonClickDetectServiceImpl.instance;
    }

    private setButtonClickEnabled(isEnable: boolean): void {
        this.deckCardSearchCancelButtonClickDetectRepository.setButtonClickEnabled(isEnable);
    }

    private isButtonClickEnabled(): boolean {
        return this.deckCardSearchCancelButtonClickDetectRepository.isButtonClickEnabled();
    }

    public async handleClick(clickPoint: { x: number; y: number }): Promise<MyDeckCardSearchCancelButton | null> {
        const { x, y } = clickPoint;
        const currentClickedDeckId = this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
        if (currentClickedDeckId == null) return null;

        const button = this.getSearchCancelButton();
        if (button !== null) {
            const clickedButton = this.deckCardSearchCancelButtonClickDetectRepository.isButtonClicked(
                { x, y },
                button,
                this.camera
            );

            if (clickedButton) {
                console.log(`[DEBUG] Clicked Search Cancel Button`);
                this.restoreAllCardPositions(currentClickedDeckId);

                return clickedButton;
            }
        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<MyDeckCardSearchCancelButton | null> {
        if (!this.isButtonClickEnabled()) return null;

        if (event.button === 0) {
            const hoverPoint = { x: event.clientX, y: event.clientY };
            return await this.handleClick(hoverPoint);
        }
        return null;
    }

    private getSearchCancelButton(): MyDeckCardSearchCancelButton | null {
        return this.myDeckCardSearchCancelButtonRepository.findButton();
    }

    private restoreAllCardPositions(deckId: number): void {
        const cardUniqueIdList = this.myDeckCardRepository.findCardUniqueIdListByDeckId(deckId);
        for (const cardUniqueId of cardUniqueIdList) {
            const cardId = this.myDeckCardRepository.findCardIdByCardUniqueId(cardUniqueId);
            if (cardId == null) return;

            const card = this.myDeckCardRepository.findCardByDeckIdAndCardId(deckId, cardId);
            if (card == null) return;
            const cardMesh = card.getMesh();

            const cardPosition = this.myDeckCardPositionRepository.findPositionByDeckIdAndCardId(deckId, cardId);
            if (cardPosition == null) return;

            const widthPercent = 0.096;
            const heightPercent = (1540 / 952);
            const positionX = cardPosition.getX();
            const positionY = cardPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(cardMesh, widthPercent, heightPercent, positionX, positionY);
            card.setVisibility(true);
        }
    }

}
