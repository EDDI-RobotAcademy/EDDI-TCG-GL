import * as THREE from "three";

import {DeleteDeckPopupButtonClickDetectService} from "./DeleteDeckPopupButtonClickDetectService";
import {DeleteDeckPopupButtonClickDetectRepositoryImpl} from '../repository/DeleteDeckPopupButtonClickDetectRepositoryImpl';
import {DeleteDeckPopupButton} from "../../delete_deck_popup_button/entity/DeleteDeckPopupButton";
import {DeleteDeckPopupButtonRepositoryImpl} from "../../delete_deck_popup_button/repository/DeleteDeckPopupButtonRepositoryImpl"
import {DeleteDeckPopupWindowRepositoryImpl} from "../../delete_deck_popup_window/repository/DeleteDeckPopupWindowRepositoryImpl";
import {TransparentBackgroundRepositoryImpl} from "../../transparent_background/repository/TransparentBackgroundRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class DeleteDeckPopupButtonClickDetectServiceImpl implements DeleteDeckPopupButtonClickDetectService {
    private static instance: DeleteDeckPopupButtonClickDetectServiceImpl | null = null;
    private deleteDeckPopupButtonClickDetectRepository: DeleteDeckPopupButtonClickDetectRepositoryImpl;
    private deleteDeckPopupButtonRepository: DeleteDeckPopupButtonRepositoryImpl;
    private deleteDeckPopupWindowRepository: DeleteDeckPopupWindowRepositoryImpl;
    private transparentBackgroundRepository : TransparentBackgroundRepositoryImpl;
    private cameraRepository: CameraRepository;


    private buttonClickState: boolean = false;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.deleteDeckPopupButtonClickDetectRepository = DeleteDeckPopupButtonClickDetectRepositoryImpl.getInstance();
        this.deleteDeckPopupButtonRepository = DeleteDeckPopupButtonRepositoryImpl.getInstance();
        this.deleteDeckPopupWindowRepository = DeleteDeckPopupWindowRepositoryImpl.getInstance();
        this.transparentBackgroundRepository = TransparentBackgroundRepositoryImpl.getInstance();
        this.cameraRepository = CameraRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeleteDeckPopupButtonClickDetectServiceImpl {
        if (!DeleteDeckPopupButtonClickDetectServiceImpl.instance) {
            DeleteDeckPopupButtonClickDetectServiceImpl.instance = new DeleteDeckPopupButtonClickDetectServiceImpl(camera, scene);
        }
        return DeleteDeckPopupButtonClickDetectServiceImpl.instance;
    }

    public setButtonClickState(state: boolean): void {
        this.buttonClickState = state;
    }

    public getButtonClickState(): boolean {
        return this.buttonClickState;
    }

    async handleButtonClick(clickPoint: { x: number; y: number }): Promise<DeleteDeckPopupButton | null> {
        const { x, y } = clickPoint;
        const buttonList = this.getAllButtons();
        const clickedButton = this.deleteDeckPopupButtonClickDetectRepository.isButtonClicked(
            { x, y },
            buttonList,
            this.camera
        );

        if (clickedButton) {
            console.log(`[DEBUG] Clicked Popup Button ID: ${clickedButton.id}`);
            this.saveCurrentClickedButtonId(clickedButton.id);
            const currentClickedButtonId = this.getCurrentClickedButtonId();

            this.setTransparentBackgroundVisibility(false);
            this.setPopupWindowVisibility(false);
            this.setPopupButtonsVisibility(false);


            switch (currentClickedButtonId) {
                case 0:
                    console.log(`Deck Delete Cancel!`);
                    break;
                case 1:
                    console.log(`Deck Delete!`);
                    break;
                default:
                    console.log(`Unknown button action`);
                    break;
            }

            return clickedButton;
        }

        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeleteDeckPopupButton | null> {
        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            return await this.handleButtonClick(clickPoint);
        }
        return null;
    }

    public getAllButtons(): DeleteDeckPopupButton[] {
        return this.deleteDeckPopupButtonRepository.findAllButton();
    }

    public saveCurrentClickedButtonId(buttonId: number): void {
        this.deleteDeckPopupButtonClickDetectRepository.saveCurrentClickedButtonId(buttonId);
    }

    public getCurrentClickedButtonId(): number | null {
        return this.deleteDeckPopupButtonClickDetectRepository.findCurrentClickedButtonId();
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

}
