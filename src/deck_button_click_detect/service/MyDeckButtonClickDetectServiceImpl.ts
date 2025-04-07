import {MyDeckButtonClickDetectService} from "./MyDeckButtonClickDetectService";

import {MyDeckButton} from "../../my_deck_button/entity/MyDeckButton";
import {MyDeckButtonRepository} from "../../my_deck_button/repository/MyDeckButtonRepository";
import {MyDeckButtonRepositoryImpl} from "../../my_deck_button/repository/MyDeckButtonRepositoryImpl";

import {MyDeckButtonEffect} from "../../my_deck_button_effect/entity/MyDeckButtonEffect";
import {MyDeckButtonEffectRepositoryImpl} from "../../my_deck_button_effect/repository/MyDeckButtonEffectRepositoryImpl";

import {MyDeckButtonClickDetectRepositoryImpl} from "../repository/MyDeckButtonClickDetectRepositoryImpl";
import {MyDeckButtonClickDetectRepository} from "../repository/MyDeckButtonClickDetectRepository";
import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";

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
    private leftMouseDown: boolean = false;

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

    setLeftMouseDown(state: boolean): void {
        this.leftMouseDown = state;
    }

    isLeftMouseDown(): boolean {
        return this.leftMouseDown;
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
            this.myDeckButtonClickDetectRepository.saveCurrentClickDeckButtonId(buttonDeckId);

            const currentClickDeckButtonId = this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
            const hiddenButtonId = deckIdList.find(
                (deckId) => this.getButtonVisibility(deckId) == false
            );

            if (hiddenButtonId && hiddenButtonId !== currentClickDeckButtonId) {
                this.setButtonVisibility(hiddenButtonId, true);
                this.setEffectVisibility(hiddenButtonId, false);
                this.setDeckCardVisibility(hiddenButtonId, false);
                this.resetCurrentCardPage();
                console.log(`Deck Button ID ${hiddenButtonId} is now shown.`);
            }

            if (currentClickDeckButtonId !== null){
                this.setButtonVisibility(currentClickDeckButtonId, false);
                this.setEffectVisibility(currentClickDeckButtonId, true);
                this.showDeckCard(currentClickDeckButtonId);
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

    // 덱 버튼 클릭 시 이전에 클릭한 덱 카드 visible false
    private setDeckCardVisibility(deckId: number, isVisible: boolean): void {
        this.cardStateManager.setAllCardVisibility(deckId, isVisible);

        const cardMeshList = this.getCardMeshesByDeckId(deckId);
        cardMeshList.forEach((mesh) => {
            mesh.visible = isVisible;
        });
    }

    private getCardMeshesByDeckId(deckId: number): THREE.Mesh[] {
        return this.myDeckCardRepository.findCardMeshesByDeckId(deckId);
    }

    // 새로운 덱 버튼 클릭시 카드 페이지 초기화
    private resetCurrentCardPage(): void {
        this.cardPageManager.resetCurrentPage();
    }

    private getCurrentCardPage(): number {
        return this.cardPageManager.getCurrentPage();
    }

    private getCardMeshIdByDeckIdAndCardId(deckId: number, cardId: number): THREE.Mesh | null {
        return this.myDeckCardRepository.findCardMeshByDeckIdAndCardId(deckId, cardId);
    }

    private setCardVisibility(deckId: number, cardId: number, isVisible: boolean): void {
        this.cardStateManager.setCardVisibility(deckId, cardId, isVisible);
    }

    private getCardIdsForPage(page: number, cardIdList: number[]): number[] {
        return this.cardPageManager.findCardIdsForPage(page, cardIdList);
    }

    private getCardIdListByDeckId(deckId: number): number[]{
        return this.myDeckCardRepository.findCardIdsByDeckId(deckId);
    }

    private showDeckCardMesh(deckId: number, cardId: number): void {
        this.setCardVisibility(deckId, cardId, true);
        const cardMesh = this.getCardMeshIdByDeckIdAndCardId(deckId, cardId);
        if (cardMesh) {
            cardMesh.visible = true;
        }
    }

    private showDeckCard(deckId: number): void {
        const cardPage = this.getCurrentCardPage();
        const cardIdList = this.getCardIdListByDeckId(deckId);
        const currentPageCardId = this.getCardIdsForPage(cardPage, cardIdList);

        currentPageCardId.forEach((cardId) => {
            this.showDeckCardMesh(deckId, cardId);
        });

    }

}
