import * as THREE from "three";

import {MyDeckCard} from "../../my_deck_card/entity/MyDeckCard";
import {CardRace} from "../../card/race";
import {getCardById} from "../../card/utility";

import {MyDeckElementAdjuster} from "../../my_deck_element_adjuster/MyDeckElementAdjuster";

import {CardFilterRaceOptionClickDetectService} from "./CardFilterRaceOptionClickDetectService";
import {CardFilterRaceOptionClickDetectRepositoryImpl} from "../repository/CardFilterRaceOptionClickDetectRepositoryImpl";

import {CardFilterRaceOptionInactive} from "../../card_filter_race_option_inactive/entity/CardFilterRaceOptionInactive";
import {CardFilterRaceOptionInactiveRepositoryImpl} from "../../card_filter_race_option_inactive/repository/CardFilterRaceOptionInactiveRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";
import {CardFilterRaceOptionActiveRepositoryImpl} from "../../card_filter_race_option_active/repository/CardFilterRaceOptionActiveRepositoryImpl";
import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";
import {MyDeckCardPositionRepositoryImpl} from "../../my_deck_card_position/repository/MyDeckCardPositionRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";

export class CardFilterRaceOptionClickDetectServiceImpl implements CardFilterRaceOptionClickDetectService {
    private static instance: CardFilterRaceOptionClickDetectServiceImpl | null = null;
    private myDeckElementAdjuster: MyDeckElementAdjuster;
    private cameraRepository: CameraRepository;
    private cardFilterRaceOptionButtonsClickDetectRepository: CardFilterRaceOptionClickDetectRepositoryImpl;
    private cardFilterRaceOptionInactiveRepository: CardFilterRaceOptionInactiveRepositoryImpl;
    private cardFilterRaceOptionActiveRepository: CardFilterRaceOptionActiveRepositoryImpl;
    private myDeckCardRepository: MyDeckCardRepositoryImpl;
    private myDeckCardPositionRepository: MyDeckCardPositionRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.myDeckElementAdjuster = MyDeckElementAdjuster.getInstance();
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.cardFilterRaceOptionButtonsClickDetectRepository = CardFilterRaceOptionClickDetectRepositoryImpl.getInstance();
        this.cardFilterRaceOptionInactiveRepository = CardFilterRaceOptionInactiveRepositoryImpl.getInstance(scene);
        this.cardFilterRaceOptionActiveRepository = CardFilterRaceOptionActiveRepositoryImpl.getInstance(scene);
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance(scene);
        this.myDeckCardPositionRepository = MyDeckCardPositionRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): CardFilterRaceOptionClickDetectServiceImpl {
        if (!CardFilterRaceOptionClickDetectServiceImpl.instance) {
            CardFilterRaceOptionClickDetectServiceImpl.instance = new CardFilterRaceOptionClickDetectServiceImpl(camera, scene);
        }
        return CardFilterRaceOptionClickDetectServiceImpl.instance;
    }

    async handleOptionClick(clickPoint: { x: number; y: number }): Promise<CardFilterRaceOptionInactive | null> {
        const { x, y } = clickPoint;
        const optionList = this.getAllCardFilterRaceOptionInactives();
        const clickedOption = this.cardFilterRaceOptionButtonsClickDetectRepository.isOptionClicked(
            { x, y },
            optionList,
            this.camera
        );

        if (clickedOption) {
            const currentClickedOptionType = clickedOption.type;
            console.log(`[DEBUG] Click Card Filter Race Option Type: ${currentClickedOptionType}`);
            this.handleFilterRaceOptionToggle(currentClickedOptionType);

            return clickedOption;
        }

        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<CardFilterRaceOptionInactive | null> {
        if (!this.isAllOptionClickEnabled()) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };

            return await this.handleOptionClick(clickPoint);
        }
        return null;
    }

    private handleFilterRaceOptionToggle(optionType: CardRace): void {
        const prevClickedOptionState = this.getCardFilterRaceOptionClickState(optionType);
        if (prevClickedOptionState == true) {
            // 이전에 클릭했을 때
            this.updateRaceOptionState(optionType, true);
        } else {
            // 이전에 클릭하지 않았을 때
            this.updateRaceOptionState(optionType, false);
            this.sortFilteredMyDeckCards(this.getCurrentClickDeckId()!, optionType);
        }
    }

    private updateRaceOptionState(type: CardRace, isActive: boolean): void {
        this.saveCardFilterRaceOptionClickState(type, !isActive);
        this.updateRaceOptionVisibility(type, isActive);
    }

    private updateRaceOptionVisibility(type: CardRace, isActive: boolean): void {
        this.setCardFilterRaceOptionInactiveVisibility(type, isActive);
        this.setCardFilterRaceOptionActiveVisibility(type, !isActive);
    }

    private sortFilteredMyDeckCards(currentClickedDeckId: number, type: CardRace): void {
        this.hideUnfilteredMyDeckCards(currentClickedDeckId, type);
        this.adjustFilteredMyDeckCardPositions(currentClickedDeckId, type);
    }

    private setAllOptionClickEnabled(isEnabled: boolean): void {
        this.cardFilterRaceOptionButtonsClickDetectRepository.setAllOptionClickEnabled(isEnabled);
    }

    private isAllOptionClickEnabled(): boolean {
        return this.cardFilterRaceOptionButtonsClickDetectRepository.isAllOptionClickEnabled();
    }

    private getAllCardFilterRaceOptionInactives(): CardFilterRaceOptionInactive[] {
        return this.cardFilterRaceOptionInactiveRepository.findAllOptions();
    }

    private setCardFilterRaceOptionInactiveVisibility(type: CardRace, isVisible: boolean): void {
        this.cardFilterRaceOptionInactiveRepository.findRaceOptionByType(type)?.setVisibility(isVisible);
    }

    private setCardFilterRaceOptionActiveVisibility(type: CardRace, isVisible: boolean): void {
        this.cardFilterRaceOptionActiveRepository.findRaceOptionByType(type)?.setVisibility(isVisible);
    }

    private saveCardFilterRaceOptionClickState(type: CardRace, state: boolean): void {
        this.cardFilterRaceOptionButtonsClickDetectRepository.saveOptionClickState(type, state);
    }

    private getCardFilterRaceOptionClickState(type: CardRace): boolean | undefined {
        return this.cardFilterRaceOptionButtonsClickDetectRepository.findOptionClickState(type);
    }

    private getCurrentClickDeckId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckId();
    }

    private filteredMyDeckCardIdList(currentClickedDeckId: number, type: CardRace): number[] {
        const allCardIdList = this.myDeckCardRepository.findCardIdListByDeckId(currentClickedDeckId);

        const filteredCardIdList: number[] = [];
        for (const cardId of allCardIdList) {
            const card = getCardById(cardId);
            if (!card) {
                throw new Error(`Card with ID ${cardId} not found`);
            }

            const cardRace = Number(card.종족);

            if (cardRace === type) {
                filteredCardIdList.push(cardId);
            }
        }
        return filteredCardIdList;
    }

    private adjustFilteredMyDeckCardPositions(deckId: number, type: CardRace): void {
        const filteredCardIdList = this.filteredMyDeckCardIdList(deckId, type);
        const cardCount = filteredCardIdList.length;
        const positionList = this.myDeckCardPositionRepository.findSearchCardPosition(deckId, cardCount);

        for (let i = 0; i < cardCount; i++) {
            const cardId = filteredCardIdList[i];
            const cardPosition = positionList[i]; // 같은 index로 매칭

            if (!cardPosition) return;

            const card = this.myDeckCardRepository.findCardByDeckIdAndCardId(deckId, cardId);
            if (card == null) return;

            card.setVisibility(true);
            const cardMesh = card.getMesh();

            const widthPercent = 0.096;
            const heightPercent = 1540 / 952;
            const positionX = cardPosition.getX();
            const positionY = cardPosition.getY();

            this.myDeckElementAdjuster.adjustElementPosition(cardMesh, widthPercent, heightPercent, positionX, positionY);
        }
    }

    private hideUnfilteredMyDeckCards(currentClickedDeckId: number, type: CardRace): void {
        const allCardIdList = this.myDeckCardRepository.findCardIdListByDeckId(currentClickedDeckId);
        for (const cardId of allCardIdList) {
            const card = getCardById(cardId);
            if (!card) {
                throw new Error(`Card with ID ${cardId} not found`);
            }

            const cardRace = Number(card.종족);

            if (cardRace !== type) {
                this.myDeckCardRepository.findCardByDeckIdAndCardId(currentClickedDeckId, cardId)?.setVisibility(false);
            }
        }
    }

}