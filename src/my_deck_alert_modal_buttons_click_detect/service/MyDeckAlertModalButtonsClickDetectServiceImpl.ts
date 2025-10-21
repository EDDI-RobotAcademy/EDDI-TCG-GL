import * as THREE from "three";

import {MyDeckAlertModalButtonsClickDetectService} from "./MyDeckAlertModalButtonsClickDetectService";
import {MyDeckAlertModalButtonsClickDetectRepositoryImpl} from "../repository/MyDeckAlertModalButtonsClickDetectRepositoryImpl";

import {AlertModalButtons} from "../../alert_modal_buttons/entity/AlertModalButtons";
import {AlertModalButtonsType} from "../../alert_modal_buttons/entity/AlertModalButtonsType";
import {AlertModalButtonsRepositoryImpl} from "../../alert_modal_buttons/repository/AlertModalButtonsRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {AlertModalContainerType} from "../../alert_modal_container/entity/AlertModalContainerType";
import {TransparentBackgroundRepositoryImpl} from "../../transparent_background/repository/TransparentBackgroundRepositoryImpl";
import {AlertModalContainerRepositoryImpl} from "../../alert_modal_container/repository/AlertModalContainerRepositoryImpl";

export class MyDeckAlertModalButtonsClickDetectServiceImpl implements MyDeckAlertModalButtonsClickDetectService {
    private static instance: MyDeckAlertModalButtonsClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private myDeckAlertModalButtonsClickDetectRepository: MyDeckAlertModalButtonsClickDetectRepositoryImpl;
    private alertModalButtonsRepository: AlertModalButtonsRepositoryImpl;
    private transparentBackgroundRepository: TransparentBackgroundRepositoryImpl;
    private alertModalContainerRepository: AlertModalContainerRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.myDeckAlertModalButtonsClickDetectRepository = MyDeckAlertModalButtonsClickDetectRepositoryImpl.getInstance();
        this.alertModalButtonsRepository = AlertModalButtonsRepositoryImpl.getInstance(scene);
        this.transparentBackgroundRepository = TransparentBackgroundRepositoryImpl.getInstance();
        this.alertModalContainerRepository = AlertModalContainerRepositoryImpl.getInstance(scene);
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): MyDeckAlertModalButtonsClickDetectServiceImpl {
        if (!MyDeckAlertModalButtonsClickDetectServiceImpl.instance) {
            MyDeckAlertModalButtonsClickDetectServiceImpl.instance = new MyDeckAlertModalButtonsClickDetectServiceImpl(camera, scene);
        }
        return MyDeckAlertModalButtonsClickDetectServiceImpl.instance;
    }

    async handleButtonClick(clickPoint: { x: number; y: number }): Promise<AlertModalButtons | null> {
        const { x, y } = clickPoint;
        const buttonsList = this.getAllAlertModalButtons();
        const clickedAlertModalButton = this.myDeckAlertModalButtonsClickDetectRepository.isAlertModalButtonsClicked(
            { x, y },
            buttonsList,
            this.camera
        );

        if (clickedAlertModalButton) {
            if (clickedAlertModalButton.type === AlertModalButtonsType.UNMATCHED_CARD) {
                console.log(`[DEBUG] Click Alert Modal Button Type: UNMATCHED_CARD`);
                this.hideNotFoundCardPopup();
            }

            if (clickedAlertModalButton.type === AlertModalButtonsType.INCOMPLETE_DECK) {
                console.log(`[DEBUG] Click Alert Modal Button Type: INCOMPLETE_DECK`);
            }

            return clickedAlertModalButton;
        }

        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<AlertModalButtons | null> {
        if (!this.isButtonClickEnabled()) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            const result  = await this.handleButtonClick(clickPoint);
            if (result) {
                this.setButtonClickEnabled(false);
            }
            return result;
        }
        return null;
    }

    private setButtonClickEnabled(isEnabled: boolean): void {
        this.myDeckAlertModalButtonsClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private isButtonClickEnabled(): boolean {
        return this.myDeckAlertModalButtonsClickDetectRepository.isButtonClickEnabled();
    }

    private getAllAlertModalButtons(): AlertModalButtons[] {
        return this.alertModalButtonsRepository.findAllButtons();
    }

    private hideNotFoundCardPopup(): void {
        this.setTransparentBackgroundVisible(false);
        this.setUnmatchedCardPopupContainerVisibility(false);
        this.setUnmatchedCardPopupButtonVisibility(false);
    }

    private setTransparentBackgroundVisible(isVisible: boolean): void {
        const background = this.transparentBackgroundRepository.findTransparentBackground();
        if (background) {
            background.setVisibility(isVisible);
        }
    }

    private setUnmatchedCardPopupContainerVisibility(isVisible: boolean): void {
        const unmatchedCardPopupContainer = this.alertModalContainerRepository.findContainerByType(AlertModalContainerType.UNMATCHED_CARD);
        if (unmatchedCardPopupContainer !== null) {
            unmatchedCardPopupContainer.setVisibility(isVisible);
        }
    }

    private setUnmatchedCardPopupButtonVisibility(isVisible: boolean): void {
        const unmatchedCardPopupButton = this.alertModalButtonsRepository.findButtonByType(AlertModalButtonsType.UNMATCHED_CARD);

        if (unmatchedCardPopupButton !== null) {
            unmatchedCardPopupButton.setVisibility(isVisible);
        }
    }

}