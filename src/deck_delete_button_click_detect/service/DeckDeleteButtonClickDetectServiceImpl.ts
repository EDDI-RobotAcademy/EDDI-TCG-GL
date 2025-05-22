import * as THREE from "three";
import {getCardById} from "../../card/utility";

import {DeckDeleteButtonClickDetectService} from "./DeckDeleteButtonClickDetectService";
import {DeckDeleteButtonClickDetectRepositoryImpl} from "../repository/DeckDeleteButtonClickDetectRepositoryImpl";
import {DeckDeleteButton} from "../../deck_delete_button/entity/DeckDeleteButton";
import {DeckDeleteButtonRepositoryImpl} from "../../deck_delete_button/repository/DeckDeleteButtonRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {TransparentBackgroundRepositoryImpl} from "../../transparent_background/repository/TransparentBackgroundRepositoryImpl";
import {DeleteDeckPopupWindowRepositoryImpl} from "../../delete_deck_popup_window/repository/DeleteDeckPopupWindowRepositoryImpl";
import {DeleteDeckPopupButtonRepositoryImpl} from "../../delete_deck_popup_button/repository/DeleteDeckPopupButtonRepositoryImpl";


export class DeckDeleteButtonClickDetectServiceImpl implements DeckDeleteButtonClickDetectService {
    private static instance: DeckDeleteButtonClickDetectServiceImpl | null = null;
    private deckDeleteButtonClickDetectRepository: DeckDeleteButtonClickDetectRepositoryImpl;
    private deckDeleteButtonRepository: DeckDeleteButtonRepositoryImpl;
    private transparentBackgroundRepository: TransparentBackgroundRepositoryImpl;
    private deleteDeckPopupWindowRepository: DeleteDeckPopupWindowRepositoryImpl;
    private deleteDeckPopupButtonRepository: DeleteDeckPopupButtonRepositoryImpl;
    private cameraRepository: CameraRepository;

    private buttonClickEnabled: boolean = false;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.deckDeleteButtonClickDetectRepository = DeckDeleteButtonClickDetectRepositoryImpl.getInstance();
        this.deckDeleteButtonRepository = DeckDeleteButtonRepositoryImpl.getInstance();
        this.transparentBackgroundRepository = TransparentBackgroundRepositoryImpl.getInstance();
        this.deleteDeckPopupWindowRepository = DeleteDeckPopupWindowRepositoryImpl.getInstance();
        this.deleteDeckPopupButtonRepository = DeleteDeckPopupButtonRepositoryImpl.getInstance();
        this.cameraRepository = CameraRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckDeleteButtonClickDetectServiceImpl {
        if (!DeckDeleteButtonClickDetectServiceImpl.instance) {
            DeckDeleteButtonClickDetectServiceImpl.instance = new DeckDeleteButtonClickDetectServiceImpl(camera, scene);
        }
        return DeckDeleteButtonClickDetectServiceImpl.instance;
    }

    public setButtonClickEnabled(isEnabled: boolean): void {
        this.buttonClickEnabled = isEnabled;
    }

    public isButtonClickEnabled(): boolean {
        return this.buttonClickEnabled;
    }

    public async handleButtonClick(clickPoint: { x: number; y: number }): Promise<DeckDeleteButton | null> {
        const { x, y } = clickPoint;
        const buttonList = this.getAllButtons();
        const clickedButton = this.deckDeleteButtonClickDetectRepository.isButtonClicked(
            { x, y },
            buttonList,
            this.camera
        );

        if (clickedButton) {
            const buttonId = clickedButton.id;
            console.log(`[DEBUG] Clicked Deck Delete Button ID: ${buttonId}`);
            this.saveCurrentClickedButtonId(buttonId);

            this.setTransparentBackgroundVisibility(true);
            this.setPopupWindowVisibility(true);
            this.setPopupButtonsVisibility(true);

            return clickedButton;

        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeckDeleteButton | null> {
        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            return await this.handleButtonClick(clickPoint);
        }
        return null;
    }

    public getAllButtons(): DeckDeleteButton[] {
        return this.deckDeleteButtonRepository.findAll();
    }

    private saveCurrentClickedButtonId(buttonId: number): void {
        this.deckDeleteButtonClickDetectRepository.saveCurrentClickedButtonId(buttonId);
    }

    private setTransparentBackgroundVisibility(isVisible: boolean): void {
        if (isVisible == true) {
            this.transparentBackgroundRepository.showTransparentBackground();
        } else {
            this.transparentBackgroundRepository.hideTransparentBackground();
        }
    }

    private setPopupWindowVisibility(isVisible: boolean): void {
        const popupWindow = this.deleteDeckPopupWindowRepository.findPopupWindow();
        if (popupWindow !== null) {
            popupWindow.setVisibility(isVisible);
        }
    }

    private setPopupButtonsVisibility(isVisible: boolean): void {
        const popupButtons = this.deleteDeckPopupButtonRepository.findAllButton();
        popupButtons.forEach((button) => button.setVisibility(isVisible));
    }

    public getDeckDeleteButtonVisibility(deckId: number): boolean | undefined {
        const button = this.deckDeleteButtonRepository.findButtonByDeckId(deckId);
        if (button !== null) {
            return button.getVisibility();
        }
        return undefined;
    }

}