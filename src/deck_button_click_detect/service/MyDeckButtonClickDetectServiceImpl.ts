import {MyDeckButtonClickDetectService} from "./MyDeckButtonClickDetectService";

import {MyDeckButton} from "../../my_deck_button/entity/MyDeckButton";
import {MyDeckButtonRepository} from "../../my_deck_button/repository/MyDeckButtonRepository";
import {MyDeckButtonRepositoryImpl} from "../../my_deck_button/repository/MyDeckButtonRepositoryImpl";

import {MyDeckButtonEffect} from "../../my_deck_button_effect/entity/MyDeckButtonEffect";
import {MyDeckButtonEffectRepositoryImpl} from "../../my_deck_button_effect/repository/MyDeckButtonEffectRepositoryImpl";

import {MyDeckButtonClickDetectRepositoryImpl} from "../repository/MyDeckButtonClickDetectRepositoryImpl";
import {MyDeckButtonClickDetectRepository} from "../repository/MyDeckButtonClickDetectRepository";
import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";
import {MyDeckCard} from "../../my_deck_card/entity/MyDeckCard";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {ButtonStateManager} from "../../my_deck_button_manager/ButtonStateManager";
import {ButtonEffectManager} from "../../my_deck_button_manager/ButtonEffectManager";
import {ButtonPageManager} from "../../my_deck_button_manager/ButtonPageManager";
import {CardStateManager} from "../../my_deck_card_manager/CardStateManager";
import {CardPageManager} from "../../my_deck_card_manager/CardPageManager";

import * as THREE from "three";

export class MyDeckButtonClickDetectServiceImpl implements MyDeckButtonClickDetectService {
    private static instance: MyDeckButtonClickDetectServiceImpl | null = null;

    private myDeckButtonRepository: MyDeckButtonRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private myDeckButtonEffectRepository: MyDeckButtonEffectRepositoryImpl;
    private myDeckCardRepository: MyDeckCardRepositoryImpl;

    private buttonStateManager: ButtonStateManager;
    private buttonEffectManager: ButtonEffectManager;
    private buttonPageManager: ButtonPageManager;
    private cardStateManager: CardStateManager;
    private cardPageManager: CardPageManager;

    private cameraRepository: CameraRepository
    private buttonClickState: boolean = true;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.myDeckButtonRepository = MyDeckButtonRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.myDeckButtonEffectRepository = MyDeckButtonEffectRepositoryImpl.getInstance();
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance();

        this.buttonStateManager = ButtonStateManager.getInstance();
        this.buttonEffectManager = ButtonEffectManager.getInstance();
        this.cardStateManager = CardStateManager.getInstance();
        this.cardPageManager = CardPageManager.getInstance();
        this.buttonPageManager = ButtonPageManager.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): MyDeckButtonClickDetectServiceImpl {
        if (!MyDeckButtonClickDetectServiceImpl.instance) {
            MyDeckButtonClickDetectServiceImpl.instance = new MyDeckButtonClickDetectServiceImpl(camera, scene);
        }
        return MyDeckButtonClickDetectServiceImpl.instance;
    }

    setButtonClickState(state: boolean): void {
        this.buttonClickState = state;
    }

    getButtonClickState(): boolean {
        return this.buttonClickState;
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
                this.resetCurrentCardPage();
                console.log(`Deck Button ID ${hiddenButtonId} is now shown.`);
            }

            if (currentClickDeckButtonId !== null){
                this.setButtonVisibility(currentClickDeckButtonId, false);
                this.setEffectVisibility(currentClickDeckButtonId, true);
                this.setCurrentPageCardVisibility(currentClickDeckButtonId, true);
                console.log(`Deck Button ID ${currentClickDeckButtonId} is now hidden.`);
            }

            return clickedDeckButton;
        }

        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<MyDeckButton | null> {
        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            return await this.handleLeftClick(clickPoint);
        }
        return null;
    }

    public saveCurrentClickDeckButtonId(buttonDeckId: number): void {
        this.myDeckButtonClickDetectRepository.saveCurrentClickDeckButtonId(buttonDeckId);
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

    private getCardListByDeckId(deckId: number): MyDeckCard[] | null {
        return this.myDeckCardRepository.findCardListByDeckId(deckId) || null;
    }

    private setCardVisibility(deckId: number, cardId: number, isVisible: boolean): void {
        this.cardStateManager.setCardVisibility(deckId, cardId, isVisible);
    }

    private getCardUniqueIdListByDeckId(deckId: number): number[] {
        return this.myDeckCardRepository.findCardUniqueIdListByDeckId(deckId);
    }

    private setCardVisibilityByDeckId(deckId: number, isVisible: boolean): void {
        const cardUniqueIdList = this.getCardUniqueIdListByDeckId(deckId);
        cardUniqueIdList.forEach((cardUniqueId) => {
            this.setCardVisibility(deckId, cardUniqueId, isVisible);
        });
    }

    private setCurrentPageCardVisibility(deckId: number, isVisible: boolean): void {
        const cardPage = this.getCurrentCardPage();
        const cardUniqueIdList = this.getCardUniqueIdListByDeckId(deckId);
        const currentPageCardId = this.getCardIdsForPage(cardPage, cardUniqueIdList);

        currentPageCardId.forEach((cardUniqueId) => {
            this.setCardVisibility(deckId, cardUniqueId, isVisible);
        });
    }

    // 새로운 덱 버튼 클릭시 카드 페이지 초기화
    private resetCurrentCardPage(): void {
        this.cardPageManager.resetCurrentPage();
    }

    private getCurrentCardPage(): number {
        return this.cardPageManager.getCurrentPage();
    }

    private getCardIdsForPage(page: number, cardIdList: number[]): number[] {
        return this.cardPageManager.findCardIdsForPage(page, cardIdList);
    }

}
