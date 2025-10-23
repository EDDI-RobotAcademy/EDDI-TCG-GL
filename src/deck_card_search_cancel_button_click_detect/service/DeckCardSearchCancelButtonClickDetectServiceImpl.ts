import * as THREE from "three";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";
import {MyDeckElementAdjuster} from "../../my_deck_element_adjuster/MyDeckElementAdjuster";
import {CardCountManager} from "../../my_deck_card_manager/CardCountManager";

import {DeckCardSearchCancelButtonClickDetectService} from "./DeckCardSearchCancelButtonClickDetectService";
import {DeckCardSearchCancelButtonClickDetectRepositoryImpl} from "../repository/DeckCardSearchCancelButtonClickDetectRepositoryImpl";

import {MyDeckCardSearchCancelButton} from "../../my_deck_card_search_cancel_button/entity/MyDeckCardSearchCancelButton";
import {MyDeckCardSearchCancelButtonRepositoryImpl} from "../../my_deck_card_search_cancel_button/repository/MyDeckCardSearchCancelButtonRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";
import {MyDeckCardPositionRepositoryImpl} from "../../my_deck_card_position/repository/MyDeckCardPositionRepositoryImpl";
import {MyDeckNumberOfCardsRepositoryImpl} from "../../my_deck_number_of_cards/repository/MyDeckNumberOfCardsRepositoryImpl";
import {MyDeckNumberOfCardsPositionRepositoryImpl} from "../../my_deck_number_of_cards_position/repository/MyDeckNumberOfCardsPositionRepositoryImpl";
import {DeckCardCountMarkerRepositoryImpl} from "../../deck_card_count_marker/repository/DeckCardCountMarkerRepositoryImpl";
import {DeckCardCountMarkerPositionRepositoryImpl} from "../../deck_card_count_marker_position/repository/DeckCardCountMarkerPositionRepositoryImpl";
import {MyDeckSearchInputContainerRepositoryImpl} from "../../my_deck_search_input_container/repository/MyDeckSearchInputContainerRepositoryImpl";
import {DeckCardSearchInputEnterDetectRepositoryImpl} from "../../deck_card_search_input_enter_detect/repository/DeckCardSearchInputEnterDetectRepositoryImpl";
import {DeckEditButtonClickDetectRepositoryImpl} from "../../deck_edit_button_click_detect/repository/DeckEditButtonClickDetectRepositoryImpl";
import {MyDeckOwnedCardsRepositoryImpl} from "../../my_deck_owned_cards/repository/MyDeckOwnedCardsRepositoryImpl";
import {MyDeckOwnedCardsPositionRepositoryImpl} from "../../my_deck_owned_cards_position/repository/MyDeckOwnedCardsPositionRepositoryImpl";
import {CardSelectionBlockerRepositoryImpl} from "../../card_selection_blocker/repository/CardSelectionBlockerRepositoryImpl";
import {CardSelectionBlockerPositionRepositoryImpl} from "../../card_selection_blocker_position/repository/CardSelectionBlockerPositionRepositoryImpl";
import {MyDeckRemainingCardsRepositoryImpl} from "../../my_deck_remaining_cards/repository/MyDeckRemainingCardsRepositoryImpl";
import {MyDeckRemainingCardsPositionRepositoryImpl} from "../../my_deck_remaining_cards_position/repository/MyDeckRemainingCardsPositionRepositoryImpl";
import {MyDeckRemainingOutOfTotalSlashRepositoryImpl} from "../../my_deck_remaining_out_of_total_slash/repository/MyDeckRemainingOutOfTotalSlashRepositoryImpl";
import {MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl} from "../../my_deck_remaining_out_of_total_slash_position/repository/MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl";
import {MyDeckTotalOwnedCardsRepositoryImpl} from "../../my_deck_total_owned_cards/repository/MyDeckTotalOwnedCardsRepositoryImpl";
import {MyDeckTotalOwnedCardsPositionRepositoryImpl} from "../../my_deck_total_owned_cards_position/repository/MyDeckTotalOwnedCardsPositionRepositoryImpl";

export class DeckCardSearchCancelButtonClickDetectServiceImpl implements DeckCardSearchCancelButtonClickDetectService {
    private static instance: DeckCardSearchCancelButtonClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private myDeckElementAdjuster: MyDeckElementAdjuster;
    private cardCountManager: CardCountManager;
    private deckCardSearchCancelButtonClickDetectRepository: DeckCardSearchCancelButtonClickDetectRepositoryImpl;
    private myDeckCardSearchCancelButtonRepository: MyDeckCardSearchCancelButtonRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private myDeckCardRepository: MyDeckCardRepositoryImpl;
    private myDeckCardPositionRepository: MyDeckCardPositionRepositoryImpl;
    private myDeckNumberOfCardsRepository: MyDeckNumberOfCardsRepositoryImpl;
    private myDeckNumberOfCardsPositionRepository: MyDeckNumberOfCardsPositionRepositoryImpl;
    private deckCardCountMarkerRepository: DeckCardCountMarkerRepositoryImpl;
    private deckCardCountMarkerPositionRepository: DeckCardCountMarkerPositionRepositoryImpl;
    private myDeckSearchInputContainerRepository: MyDeckSearchInputContainerRepositoryImpl;
    private deckCardSearchInputEnterDetectRepository: DeckCardSearchInputEnterDetectRepositoryImpl;
    private deckEditButtonClickDetectRepository: DeckEditButtonClickDetectRepositoryImpl;
    private myDeckOwnedCardsRepository: MyDeckOwnedCardsRepositoryImpl;
    private myDeckOwnedCardsPositionRepository: MyDeckOwnedCardsPositionRepositoryImpl;
    private cardSelectionBlockerRepository: CardSelectionBlockerRepositoryImpl;
    private cardSelectionBlockerPositionRepository: CardSelectionBlockerPositionRepositoryImpl;
    private myDeckRemainingCardsRepository: MyDeckRemainingCardsRepositoryImpl;
    private myDeckRemainingCardsPositionRepository: MyDeckRemainingCardsPositionRepositoryImpl;
    private myDeckRemainingOutOfTotalSlashRepository: MyDeckRemainingOutOfTotalSlashRepositoryImpl;
    private myDeckRemainingOutOfTotalSlashPositionRepository: MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl;
    private myDeckTotalOwnedCardsRepository: MyDeckTotalOwnedCardsRepositoryImpl;
    private myDeckTotalOwnedCardsPositionRepository: MyDeckTotalOwnedCardsPositionRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.myDeckElementAdjuster = MyDeckElementAdjuster.getInstance();
        this.cardCountManager = CardCountManager.getInstance();
        this.deckCardSearchCancelButtonClickDetectRepository = DeckCardSearchCancelButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckCardSearchCancelButtonRepository = MyDeckCardSearchCancelButtonRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance(scene);
        this.myDeckCardPositionRepository = MyDeckCardPositionRepositoryImpl.getInstance();
        this.myDeckNumberOfCardsRepository = MyDeckNumberOfCardsRepositoryImpl.getInstance(scene);
        this.myDeckNumberOfCardsPositionRepository = MyDeckNumberOfCardsPositionRepositoryImpl.getInstance();
        this.deckCardCountMarkerRepository = DeckCardCountMarkerRepositoryImpl.getInstance(scene);
        this.deckCardCountMarkerPositionRepository = DeckCardCountMarkerPositionRepositoryImpl.getInstance();
        this.myDeckSearchInputContainerRepository = MyDeckSearchInputContainerRepositoryImpl.getInstance();
        this.deckCardSearchInputEnterDetectRepository = DeckCardSearchInputEnterDetectRepositoryImpl.getInstance();
        this.deckEditButtonClickDetectRepository = DeckEditButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckOwnedCardsRepository = MyDeckOwnedCardsRepositoryImpl.getInstance();
        this.myDeckOwnedCardsPositionRepository = MyDeckOwnedCardsPositionRepositoryImpl.getInstance();
        this.cardSelectionBlockerRepository = CardSelectionBlockerRepositoryImpl.getInstance(scene);
        this.cardSelectionBlockerPositionRepository = CardSelectionBlockerPositionRepositoryImpl.getInstance();
        this.myDeckRemainingCardsRepository = MyDeckRemainingCardsRepositoryImpl.getInstance(scene);
        this.myDeckRemainingCardsPositionRepository = MyDeckRemainingCardsPositionRepositoryImpl.getInstance();
        this.myDeckRemainingOutOfTotalSlashRepository = MyDeckRemainingOutOfTotalSlashRepositoryImpl.getInstance();
        this.myDeckRemainingOutOfTotalSlashPositionRepository = MyDeckRemainingOutOfTotalSlashPositionRepositoryImpl.getInstance();
        this.myDeckTotalOwnedCardsRepository = MyDeckTotalOwnedCardsRepositoryImpl.getInstance();
        this.myDeckTotalOwnedCardsPositionRepository = MyDeckTotalOwnedCardsPositionRepositoryImpl.getInstance();
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
        const currentClickedDeckId = this.myDeckButtonClickDetectRepository.getCurrentClickDeckId();
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
                if (this.isDeckEditMode() == true) {
                    this.restoreAllOwnedCardPositions();
                    this.restoreAllCardBlockerPositions();
                    this.restoreAllNumberOfRemainingCardsPositions();
                    this.restoreAllSlashesPositions();
                    this.restoreAllNumberOfTotalOwnedCardsPositions();

                } else {
                    this.restoreAllCardPositions(currentClickedDeckId);
                    this.restoreAllNumberOfCardsPositions(currentClickedDeckId);
                    this.restoreAllMarkerPositions(currentClickedDeckId);
                }

                this.setSearchCancelButtonVisibility(false);

                const searchInputText = this.myDeckSearchInputContainerRepository.findInputValue();
                if (searchInputText !== null && searchInputText.length > 0) {
                    this.myDeckSearchInputContainerRepository.clearUserInput();
                }

                this.deckCardSearchInputEnterDetectRepository.setEnterPressedState(false);

                return clickedButton;
            }
        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<MyDeckCardSearchCancelButton | null> {
        if (!this.isButtonClickEnabled()) return null;

        if (event.button === 0) {
            const hoverPoint = { x: event.clientX, y: event.clientY };
            const result = await this.handleClick(hoverPoint);
            if (result) {
                this.setButtonClickEnabled(false);
                return result;
            }
        }
        return null;
    }

    private isDeckEditMode(): boolean | null {
        return this.deckEditButtonClickDetectRepository.getCurrentButtonClickState();
    }

    private getSearchCancelButton(): MyDeckCardSearchCancelButton | null {
        return this.myDeckCardSearchCancelButtonRepository.findButton();
    }

    private setSearchCancelButtonVisibility(isVisible: boolean): void {
        this.myDeckCardSearchCancelButtonRepository.findButton()?.setVisibility(isVisible);
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

    private restoreAllNumberOfCardsPositions(deckId: number): void {
        const numberIdList = this.myDeckNumberOfCardsRepository.findNumberIdListByDeckId(deckId);
        for (const numberId of numberIdList) {
            const cardId = this.myDeckNumberOfCardsRepository.findCardIdByNumberId(numberId);
            if (cardId == null) return;

            const numberOfCards = this.myDeckNumberOfCardsRepository.findNumberByDeckIdAndCardId(deckId, cardId);
            if (numberOfCards == null) return;
            const numberOfCardsMesh = numberOfCards.getMesh();

            const numberPosition = this.myDeckNumberOfCardsPositionRepository.findPositionByDeckIdAndCardId(deckId, cardId);
            if (numberPosition == null) return;

            const widthPercent = 0.013;
            const heightPercent = 1;
            const positionX = numberPosition.getX();
            const positionY = numberPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(numberOfCardsMesh, widthPercent, heightPercent, positionX, positionY);
            numberOfCards.setVisibility(true);
        }
    }

    private restoreAllMarkerPositions(deckId: number): void {
        const markerIdList = this.deckCardCountMarkerRepository.findMarkerIdListByDeckId(deckId);
        for (const markerId of markerIdList) {
            const cardId = this.deckCardCountMarkerRepository.findCardIdByMarkerId(markerId);
            if (cardId == null) return;

            const marker = this.deckCardCountMarkerRepository.findMarkerByDeckIdAndCardId(deckId, cardId);
            if (marker == null) return;
            const markerMesh = marker.getMesh();

            const markerPosition = this.deckCardCountMarkerPositionRepository.findPositionByDeckIdAndCardId(deckId, cardId);
            if (markerPosition == null) return;

            const widthPercent = 0.012;
            const heightPercent = 1;
            const positionX = markerPosition.getX();
            const positionY = markerPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(markerMesh, widthPercent, heightPercent, positionX, positionY);
            marker.setVisibility(true);
        }
    }

    private restoreAllOwnedCardPositions(): void {
        const cardIdList = this.myDeckOwnedCardsRepository.findAllCardIdList();
        for (const cardId of cardIdList) {
            const card = this.myDeckOwnedCardsRepository.findCardByCardId(cardId);
            if (card == null) return;
            const cardMesh = card.getMesh();

            const cardPosition = this.myDeckOwnedCardsPositionRepository.findPositionByCardId(cardId);
            if (cardPosition == null) return;

            const widthPercent = 0.096;
            const heightPercent = (1540 / 952);
            const positionX = cardPosition.getX();
            const positionY = cardPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(cardMesh, widthPercent, heightPercent, positionX, positionY);
            card.setVisibility(true);
        }
    }

    private restoreAllCardBlockerPositions(): void {
        const cardIdList = this.cardSelectionBlockerRepository.findAllCardIdList();
        for (const cardId of cardIdList) {
            const blocker = this.cardSelectionBlockerRepository.findBlockerByCardId(cardId);
            if (blocker == null) return;
            const blockerMesh = blocker.getMesh();

            const blockerPosition = this.cardSelectionBlockerPositionRepository.findPositionByCardId(cardId);
            if (blockerPosition == null) return;

            const widthPercent = 0.096;
            const heightPercent = (1540 / 952);
            const positionX = blockerPosition.getX();
            const positionY = blockerPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(blockerMesh, widthPercent, heightPercent, positionX, positionY);

            const remainingCardCount = this.cardCountManager.findRemainingCardCountByCardId(cardId);
            if (remainingCardCount !== null && remainingCardCount == 0) {
                blocker.setVisibility(true);
            }
        }
    }

    private restoreAllNumberOfRemainingCardsPositions(): void {
        const cardIdList = this.myDeckRemainingCardsRepository.findAllCardIdList();
        for (const cardId of cardIdList) {
            const numberObject = this.myDeckRemainingCardsRepository.findRemainingCardByCardId(cardId);
            if (numberObject == null) return;
            const numberMesh = numberObject.getMesh();

            const numberPosition = this.myDeckRemainingCardsPositionRepository.findPositionByCardId(cardId);
            if (numberPosition == null) return;

            const widthPercent = 0.013;
            const heightPercent = 1;
            const positionX = numberPosition.getX();
            const positionY = numberPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(numberMesh, widthPercent, heightPercent, positionX, positionY);
            numberObject.setVisibility(true);
        }
    }

    private restoreAllSlashesPositions(): void {
        const slashIdList = this.myDeckRemainingOutOfTotalSlashRepository.findAllSlashIdList();
        for (const slashId of slashIdList) {
            const slash = this.myDeckRemainingOutOfTotalSlashRepository.findSlashById(slashId);
            if (slash == null) return;
            const slashMesh = slash.getMesh();

            const slashPosition = this.myDeckRemainingOutOfTotalSlashPositionRepository.findPositionByPositionId(slashId);
            if (slashPosition == null) return;

            const widthPercent = 0.013;
            const heightPercent = 1;
            const positionX = slashPosition.getX();
            const positionY = slashPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(slashMesh, widthPercent, heightPercent, positionX, positionY);
            slash.setVisibility(true);
        }
    }

    private restoreAllNumberOfTotalOwnedCardsPositions(): void {
        const numberIdList = this.myDeckTotalOwnedCardsRepository.findAllTotalOwnedCardsIdList();
        for (const numberId of numberIdList) {
            const numberObject = this.myDeckTotalOwnedCardsRepository.findTotalOwnedCardsById(numberId);
            if (numberObject == null) return;
            const numberMesh = numberObject.getMesh();

            const numberPosition = this.myDeckTotalOwnedCardsPositionRepository.findPositionByPositionId(numberId);
            if (numberPosition == null) return;

            const widthPercent = 0.013;
            const heightPercent = 1;
            const positionX = numberPosition.getX();
            const positionY = numberPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(numberMesh, widthPercent, heightPercent, positionX, positionY);
            numberObject.setVisibility(true);
        }
    }

}
