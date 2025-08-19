import {MyDeckButtonClickDetectService} from "./MyDeckButtonClickDetectService";

import {MyDeckButton} from "../../my_deck_button/entity/MyDeckButton";
import {MyDeckButtonEffect} from "../../my_deck_button_effect/entity/MyDeckButtonEffect";

import {MyDeckButtonRepositoryImpl} from "../../my_deck_button/repository/MyDeckButtonRepositoryImpl";
import {MyDeckButtonEffectRepositoryImpl} from "../../my_deck_button_effect/repository/MyDeckButtonEffectRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../repository/MyDeckButtonClickDetectRepositoryImpl";
import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";
import {MyDeckBlockRepositoryImpl} from "../../my_deck_block/repository/MyDeckBlockRepositoryImpl";
import {MyDeckCardNameRepositoryImpl} from "../../my_deck_card_name/repository/MyDeckCardNameRepositoryImpl";
import {DeckNameEditButtonRepositoryImpl} from "../../deck_name_edit_button/repository/DeckNameEditButtonRepositoryImpl";
import {DeckDeleteButtonRepositoryImpl} from "../../deck_delete_button/repository/DeckDeleteButtonRepositoryImpl";
import {MyDeckNumberOfCardsRepositoryImpl} from "../../my_deck_number_of_cards/repository/MyDeckNumberOfCardsRepositoryImpl";
import {MyDeckNumberOfSelectedCardsRepositoryImpl} from "../../my_deck_number_of_selected_cards/repository/MyDeckNumberOfSelectedCardsRepositoryImpl";
import {DeckCardCountMarkerRepositoryImpl} from "../../deck_card_count_marker/repository/DeckCardCountMarkerRepositoryImpl";
import {DeckDeleteButtonClickDetectRepositoryImpl} from "../../deck_delete_button_click_detect/repository/DeckDeleteButtonClickDetectRepositoryImpl";
import {DeckEditButtonClickDetectRepositoryImpl} from "../../deck_edit_button_click_detect/repository/DeckEditButtonClickDetectRepositoryImpl";
import {MyDeckOwnedCardsRepositoryImpl} from "../../my_deck_owned_cards/repository/MyDeckOwnedCardsRepositoryImpl";
import {CardSelectionBlockerRepositoryImpl} from "../../card_selection_blocker/repository/CardSelectionBlockerRepositoryImpl";
import {MyDeckTotalOwnedCardsRepositoryImpl} from "../../my_deck_total_owned_cards/repository/MyDeckTotalOwnedCardsRepositoryImpl";
import {MyDeckRemainingCardsRepositoryImpl} from "../../my_deck_remaining_cards/repository/MyDeckRemainingCardsRepositoryImpl";
import {MyDeckRemainingOutOfTotalSlashRepositoryImpl} from "../../my_deck_remaining_out_of_total_slash/repository/MyDeckRemainingOutOfTotalSlashRepositoryImpl";
import {MyDeckNumberOfSelectedCardsPositionRepositoryImpl} from "../../my_deck_number_of_selected_cards_position/repository/MyDeckNumberOfSelectedCardsPositionRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import * as THREE from "three";

export class MyDeckButtonClickDetectServiceImpl implements MyDeckButtonClickDetectService {
    private static instance: MyDeckButtonClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private myDeckButtonRepository: MyDeckButtonRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private myDeckButtonEffectRepository: MyDeckButtonEffectRepositoryImpl;
    private myDeckCardRepository: MyDeckCardRepositoryImpl;
    private myDeckBlockRepository: MyDeckBlockRepositoryImpl;
    private myDeckCardNameRepository: MyDeckCardNameRepositoryImpl;
    private deckNameEditButtonRepository: DeckNameEditButtonRepositoryImpl;
    private deckDeleteButtonRepository: DeckDeleteButtonRepositoryImpl;
    private myDeckNumberOfCardsRepository: MyDeckNumberOfCardsRepositoryImpl;
    private myDeckNumberOfSelectedCardsRepository: MyDeckNumberOfSelectedCardsRepositoryImpl;
    private deckCardCountMarkerRepository: DeckCardCountMarkerRepositoryImpl;
    private deckDeleteButtonClickDetectRepository: DeckDeleteButtonClickDetectRepositoryImpl;
    private deckEditButtonClickDetectRepository: DeckEditButtonClickDetectRepositoryImpl;
    private myDeckOwnedCardsRepository: MyDeckOwnedCardsRepositoryImpl;
    private cardSelectionBlockerRepository: CardSelectionBlockerRepositoryImpl;
    private myDeckTotalOwnedCardsRepository: MyDeckTotalOwnedCardsRepositoryImpl;
    private myDeckRemainingCardsRepository: MyDeckRemainingCardsRepositoryImpl;
    private myDeckRemainingOutOfTotalSlashRepository: MyDeckRemainingOutOfTotalSlashRepositoryImpl;
    private myDeckNumberOfSelectedCardsPositionRepository: MyDeckNumberOfSelectedCardsPositionRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.myDeckButtonRepository = MyDeckButtonRepositoryImpl.getInstance(scene);
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.myDeckButtonEffectRepository = MyDeckButtonEffectRepositoryImpl.getInstance(scene);
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance(scene);
        this.myDeckBlockRepository = MyDeckBlockRepositoryImpl.getInstance(scene);
        this.myDeckCardNameRepository = MyDeckCardNameRepositoryImpl.getInstance(scene);
        this.deckNameEditButtonRepository = DeckNameEditButtonRepositoryImpl.getInstance(scene);
        this.deckDeleteButtonRepository = DeckDeleteButtonRepositoryImpl.getInstance(scene);
        this.myDeckNumberOfCardsRepository = MyDeckNumberOfCardsRepositoryImpl.getInstance(scene);
        this.myDeckNumberOfSelectedCardsRepository = MyDeckNumberOfSelectedCardsRepositoryImpl.getInstance(scene);
        this.deckCardCountMarkerRepository = DeckCardCountMarkerRepositoryImpl.getInstance(scene);
        this.deckDeleteButtonClickDetectRepository = DeckDeleteButtonClickDetectRepositoryImpl.getInstance();
        this.deckEditButtonClickDetectRepository = DeckEditButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckOwnedCardsRepository = MyDeckOwnedCardsRepositoryImpl.getInstance();
        this.cardSelectionBlockerRepository = CardSelectionBlockerRepositoryImpl.getInstance(scene);
        this.myDeckTotalOwnedCardsRepository = MyDeckTotalOwnedCardsRepositoryImpl.getInstance();
        this.myDeckRemainingCardsRepository = MyDeckRemainingCardsRepositoryImpl.getInstance(scene);
        this.myDeckRemainingOutOfTotalSlashRepository = MyDeckRemainingOutOfTotalSlashRepositoryImpl.getInstance();
        this.myDeckNumberOfSelectedCardsPositionRepository = MyDeckNumberOfSelectedCardsPositionRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): MyDeckButtonClickDetectServiceImpl {
        if (!MyDeckButtonClickDetectServiceImpl.instance) {
            MyDeckButtonClickDetectServiceImpl.instance = new MyDeckButtonClickDetectServiceImpl(camera, scene);
        }
        return MyDeckButtonClickDetectServiceImpl.instance;
    }

    private setButtonClickEnabled(isEnabled: boolean): void {
        this.myDeckButtonClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private isButtonClickEnabled(): boolean {
        return this.myDeckButtonClickDetectRepository.isButtonClickEnabled();
    }

    async handleLeftClick(clickPoint: { x: number; y: number }): Promise<MyDeckButton | null> {
        const { x, y } = clickPoint;
        const deckIdList = this.getDeckIdList();
        const allButton = this.myDeckButtonRepository.findAll();
        const clickedDeckButton = this.myDeckButtonClickDetectRepository.isMyDeckButtonClicked(
            { x, y },
            allButton,
            this.camera
        );

        if (clickedDeckButton) {
            const previousClickedDeckButtonId = this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
            if (previousClickedDeckButtonId !== null) {
                this.setButtonVisibility(previousClickedDeckButtonId, true);
                this.setEffectVisibility(previousClickedDeckButtonId, false);
                this.setCardVisibilityByDeckId(previousClickedDeckButtonId, false);
                this.setCardVisibilityByDeckId(previousClickedDeckButtonId, false);
                this.setBlockVisibilityByDeckId(previousClickedDeckButtonId, false);
                this.setCardNameVisibilityByDeckId(previousClickedDeckButtonId, false);
                this.setDeckNameEditButtonVisibility(previousClickedDeckButtonId, false);
                this.setDeckDeleteButtonVisibility(previousClickedDeckButtonId, false);
                this.setNumberOfCardsVisibilityByDeckId(previousClickedDeckButtonId, false);
                this.setNumberOfSelectedCardsVisibilityByDeckId(previousClickedDeckButtonId, false);
                this.setDeckCardCountMarkerVisibilityByDeckId(previousClickedDeckButtonId, false);

                // To-do: 편집 화면에서 편집 다 못하고 나올 때 원본 데이터로 돌려야 함
                if (this.deckEditButtonClickDetectRepository.getCurrentButtonClickState() == true) {
                    this.myDeckNumberOfSelectedCardsRepository.restoreOriginalDeckState(previousClickedDeckButtonId);
                    this.myDeckNumberOfSelectedCardsPositionRepository.restoreOriginalPositionState(previousClickedDeckButtonId);

                    this.setOwnedCardsVisibility(false);
                    this.setCardSelectionBlockerVisibility(false);
                    this.setNumberOfTotalOwnedCardsVisibility(false);
                    this.setNumberOfRemainingCardsVisibility(false);
                    this.setRemainingOutOfTotalSlashVisibility(false);

                }
            }

            const buttonId = clickedDeckButton.id;
            const currentClickedDeckButtonId = this.getDeckIdByButtonId(buttonId);
            console.log(`Clicked Deck Button ID: ${buttonId}, Deck ID: ${currentClickedDeckButtonId}`);
            this.saveCurrentClickDeckButtonId(currentClickedDeckButtonId);


            if (currentClickedDeckButtonId !== null) {
                // 덱 버튼 누를 때마다 카드, 블록 원위치
                const scrollTargets = [
                    this.getBlockGroup(currentClickedDeckButtonId),
                    this.getCardNameGroup(currentClickedDeckButtonId),
                    this.getCardGroup(currentClickedDeckButtonId),
                    this.getNumberOfCardsGroup(currentClickedDeckButtonId),
                    this.getNumberOfSelectedCardsGroup(currentClickedDeckButtonId),
                    this.getDeckCardCountMarkerGroup(currentClickedDeckButtonId),
                ];

                if (scrollTargets.every(target => !target)) return null;
                scrollTargets.forEach(target => {
                    target.position.y = 0;
                });

                this.setButtonVisibility(currentClickedDeckButtonId, false);
                this.setEffectVisibility(currentClickedDeckButtonId, true);
                this.setCardVisibilityByDeckId(currentClickedDeckButtonId, true);
                this.setBlockVisibilityByDeckId(currentClickedDeckButtonId, true);
                this.setCardNameVisibilityByDeckId(currentClickedDeckButtonId, true);
                this.setDeckNameEditButtonVisibility(currentClickedDeckButtonId, true);
                this.setDeckDeleteButtonVisibility(currentClickedDeckButtonId, true);
                this.setNumberOfCardsVisibilityByDeckId(currentClickedDeckButtonId, true);
                this.setNumberOfSelectedCardsVisibilityByDeckId(currentClickedDeckButtonId, true);
                this.setDeckCardCountMarkerVisibilityByDeckId(currentClickedDeckButtonId, true);
                console.log(`Deck Button ID ${currentClickedDeckButtonId} is now hidden.`);
            }

            return clickedDeckButton;
        }

        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<MyDeckButton | null> {
        if (!this.isButtonClickEnabled()) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            const result = await this.handleLeftClick(clickPoint);
            if (result) {
                this.deckDeleteButtonClickDetectRepository.setButtonClickEnabled(true);
                return result;
            }
        }
        return null;
    }

    public saveCurrentClickDeckButtonId(buttonDeckId: number): void {
        this.myDeckButtonClickDetectRepository.saveCurrentClickDeckButtonId(buttonDeckId);
    }

    public getCurrentClickDeckButtonId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId() ?? null;
    }

    public getDeckIdByButtonId(buttonId: number): number {
        return this.myDeckButtonRepository.findDeckIdByButtonId(buttonId) ?? -1;
    }

    public getDeckIdList(): number[] {
        return this.myDeckButtonRepository.findButtonDeckIdList();
    }

    public getButtonVisibility(deckId: number): boolean | undefined {
        return this.myDeckButtonRepository.findButtonByDeckId(deckId)?.getVisibility();
    }

    public setButtonVisibility(deckId: number, isVisible: boolean): void {
        this.myDeckButtonRepository.findButtonByDeckId(deckId)?.setVisibility(isVisible);
    }

    public getEffectVisibility(deckId: number): boolean | undefined {
        return this.myDeckButtonEffectRepository.findEffectByDeckId(deckId)?.getVisibility();
    }

    public setEffectVisibility(deckId: number, isVisible: boolean): void {
        this.myDeckButtonEffectRepository.findEffectByDeckId(deckId)?.setVisibility(isVisible);
    }

    private getDeckButtonById(buttonId: number): MyDeckButton | null {
        return this.myDeckButtonRepository.findById(buttonId);
    }

    private getDeckButtonEffectById(buttonId: number): MyDeckButtonEffect | null {
        return this.myDeckButtonEffectRepository.findById(buttonId);
    }

    private setCardVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        this.myDeckCardRepository.findCardListByDeckId(deckId)?.forEach(card =>
            card.setVisibility(isVisible)
        );
    }

    private setBlockVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        this.myDeckBlockRepository.findBlockListByDeckId(deckId)?.forEach(block =>
            block.setVisibility(isVisible)
        );
    }

    private setCardNameVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        this.myDeckCardNameRepository.findCardNameListByDeckId(deckId)?.forEach(cardName =>
            cardName.setVisibility(isVisible)
        );
    }

    private setNumberOfCardsVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        this.myDeckNumberOfCardsRepository.findNumberListByDeckId(deckId)?.forEach(number =>
            number.setVisibility(isVisible)
        );
    }

    private setNumberOfSelectedCardsVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        this.myDeckNumberOfSelectedCardsRepository.findNumberListByDeckId(deckId)?.forEach(number =>
            number.setVisibility(isVisible)
        );
    }

    private setDeckCardCountMarkerVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        this.deckCardCountMarkerRepository.findMarkerListByDeckId(deckId)?.forEach(marker =>
            marker.setVisibility(isVisible)
        );
    }

    private getBlockGroup(deckId: number): THREE.Group {
        return this.myDeckBlockRepository.findBlockGroupByDeckId(deckId);
    }

    private getCardNameGroup(deckId: number): THREE.Group {
        return this.myDeckCardNameRepository.findCardNameGroupByDeckId(deckId);
    }

    private getCardGroup(deckId: number): THREE.Group {
        return this.myDeckCardRepository.findCardGroupByDeckId(deckId);
    }

    private getNumberOfCardsGroup(deckId: number): THREE.Group {
        return this.myDeckNumberOfCardsRepository.findNumberGroupByDeckId(deckId);
    }

    private getNumberOfSelectedCardsGroup(deckId: number): THREE.Group {
        return this.myDeckNumberOfSelectedCardsRepository.findNumberGroupByDeckId(deckId);
    }

    private getDeckCardCountMarkerGroup(deckId: number): THREE.Group {
        return this.deckCardCountMarkerRepository.findMarkerGroupByDeckId(deckId);
    }

    private setDeckNameEditButtonVisibility(deckId: number, isVisible: boolean): void {
        const button = this.deckNameEditButtonRepository.findButtonByDeckId(deckId);
        if (button !== null) {
            button.setVisibility(isVisible);
        }
    }

    private setDeckDeleteButtonVisibility(deckId: number, isVisible: boolean): void {
        const button = this.deckDeleteButtonRepository.findButtonByDeckId(deckId);
        if (button !== null) {
            button.setVisibility(isVisible);
        }
    }

    private setOwnedCardsVisibility(isVisible: boolean): void {
        this.myDeckOwnedCardsRepository.findAllCards()?.forEach(card =>
            card.setVisibility(isVisible)
        );
    }

    private setCardSelectionBlockerVisibility(isVisible: boolean): void {
        this.cardSelectionBlockerRepository.findAllBlockers()?.forEach(blocker =>
            blocker.setVisibility(isVisible)
        );
    }

    private setNumberOfTotalOwnedCardsVisibility(isVisible: boolean): void {
        this.myDeckTotalOwnedCardsRepository.findAllTotalOwnedCardsList()?.forEach(numberMesh =>
            numberMesh.setVisibility(isVisible)
        );
    }

    private setNumberOfRemainingCardsVisibility(isVisible: boolean): void {
        this.myDeckRemainingCardsRepository.findAllRemainingCardsList()?.forEach(numberMesh =>
            numberMesh.setVisibility(isVisible)
        );
    }

    private setRemainingOutOfTotalSlashVisibility(isVisible: boolean): void {
        this.myDeckRemainingOutOfTotalSlashRepository.findAllSlashList()?.forEach(slash =>
            slash.setVisibility(isVisible)
        );
    }

}
