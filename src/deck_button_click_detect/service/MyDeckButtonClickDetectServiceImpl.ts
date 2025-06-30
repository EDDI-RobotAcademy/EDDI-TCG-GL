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

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {ButtonStateManager} from "../../my_deck_button_manager/ButtonStateManager";
import {ButtonEffectManager} from "../../my_deck_button_manager/ButtonEffectManager";

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

    private buttonStateManager: ButtonStateManager;
    private buttonEffectManager: ButtonEffectManager;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.myDeckButtonRepository = MyDeckButtonRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.myDeckButtonEffectRepository = MyDeckButtonEffectRepositoryImpl.getInstance();
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance(scene);
        this.myDeckBlockRepository = MyDeckBlockRepositoryImpl.getInstance(scene);
        this.myDeckCardNameRepository = MyDeckCardNameRepositoryImpl.getInstance(scene);
        this.deckNameEditButtonRepository = DeckNameEditButtonRepositoryImpl.getInstance();
        this.deckDeleteButtonRepository = DeckDeleteButtonRepositoryImpl.getInstance();
        this.myDeckNumberOfCardsRepository = MyDeckNumberOfCardsRepositoryImpl.getInstance();
        this.myDeckNumberOfSelectedCardsRepository = MyDeckNumberOfSelectedCardsRepositoryImpl.getInstance(scene);
        this.deckCardCountMarkerRepository = DeckCardCountMarkerRepositoryImpl.getInstance(scene);
        this.deckDeleteButtonClickDetectRepository = DeckDeleteButtonClickDetectRepositoryImpl.getInstance();

        this.buttonStateManager = ButtonStateManager.getInstance();
        this.buttonEffectManager = ButtonEffectManager.getInstance();
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
            const buttonId = clickedDeckButton.id;
            const buttonDeckId = this.getDeckIdByButtonId(buttonId);
            console.log(`Clicked Deck Button ID: ${buttonId}, Deck ID: ${buttonDeckId}`);
            this.saveCurrentClickDeckButtonId(buttonDeckId);

            const currentClickDeckButtonId = this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
            const hiddenButtonId = deckIdList.find(
                (deckId) => this.getButtonVisibility(deckId) == false
            );

            if (hiddenButtonId && hiddenButtonId !== currentClickDeckButtonId) {
                this.setButtonVisibility(hiddenButtonId, true);
                this.setEffectVisibility(hiddenButtonId, false);
                this.setCardVisibilityByDeckId(hiddenButtonId, false);
                this.setCardVisibilityByDeckId(hiddenButtonId, false);
                this.setBlockVisibilityByDeckId(hiddenButtonId, false);
                this.setCardNameVisibilityByDeckId(hiddenButtonId, false);
                this.setDeckNameEditButtonVisibility(hiddenButtonId, false);
                this.setDeckDeleteButtonVisibility(hiddenButtonId, false);
                this.setNumberOfCardsVisibilityByDeckId(hiddenButtonId, false);
                this.setNumberOfSelectedCardsVisibilityByDeckId(hiddenButtonId, false);
                this.setDeckCardCountMarkerVisibilityByDeckId(hiddenButtonId, false);
                console.log(`Deck Button ID ${hiddenButtonId} is now shown.`);
            }

            if (currentClickDeckButtonId !== null){
                // 덱 버튼 누를 때마다 카드, 블록 원위치
                const scrollTargets = [
                    this.getBlockGroup(currentClickDeckButtonId),
                    this.getCardNameGroup(currentClickDeckButtonId),
                    this.getCardGroup(currentClickDeckButtonId),
                    this.getNumberOfCardsGroup(currentClickDeckButtonId),
                    this.getNumberOfSelectedCardsGroup(currentClickDeckButtonId),
                    this.getDeckCardCountMarkerGroup(currentClickDeckButtonId),
                ];

                if (scrollTargets.every(target => !target)) return null;
                scrollTargets.forEach(target => {
                    target.position.y = 0;
                });

                this.setButtonVisibility(currentClickDeckButtonId, false);
                this.setEffectVisibility(currentClickDeckButtonId, true);
                this.setCardVisibilityByDeckId(currentClickDeckButtonId, true);
                this.setBlockVisibilityByDeckId(currentClickDeckButtonId, true);
                this.setCardNameVisibilityByDeckId(currentClickDeckButtonId, true);
                this.setDeckNameEditButtonVisibility(currentClickDeckButtonId, true);
                this.setDeckDeleteButtonVisibility(currentClickDeckButtonId, true);
                this.setNumberOfCardsVisibilityByDeckId(currentClickDeckButtonId, true);
                this.setNumberOfSelectedCardsVisibilityByDeckId(currentClickDeckButtonId, true);
                this.setDeckCardCountMarkerVisibilityByDeckId(currentClickDeckButtonId, true);
                console.log(`Deck Button ID ${currentClickDeckButtonId} is now hidden.`);
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

    public getButtonVisibility(deckId: number): boolean {
        return this.buttonStateManager.findButtonVisibility(deckId);
    }

    public setButtonVisibility(deckId: number, isVisible: boolean): void {
        this.buttonStateManager.setButtonVisibility(deckId, isVisible);
    }

    public getEffectVisibility(deckId: number): boolean {
        return this.buttonEffectManager.findVisibility(deckId);
    }

    public setEffectVisibility(deckId: number, isVisible: boolean): void {
        this.buttonEffectManager.setEffectVisibility(deckId, isVisible);
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

}
