import * as THREE from "three";

import {CloseButtonClickDetectService} from "./CloseButtonClickDetectService";
import {CloseButtonClickDetectRepositoryImpl} from "../repository/CloseButtonClickDetectRepositoryImpl";
import {MyCardCloseButton} from "../../my_card_close_button/entity/MyCardCloseButton";
import {MyCardCloseButtonRepositoryImpl} from "../../my_card_close_button/repository/MyCardCloseButtonRepositoryImpl";
import {MyCardScreenCardClickDetectRepositoryImpl} from "../../my_card_screen_card_click_detect/repository/MyCardScreenCardClickDetectRepositoryImpl";
import {TransparentBackgroundRepositoryImpl} from "../../transparent_background/repository/TransparentBackgroundRepositoryImpl";
import {DetailCardStateManager} from "../../my_card_screen_detail_card_manager/DetailCardStateManager";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class CloseButtonClickDetectServiceImpl implements CloseButtonClickDetectService {
    private static instance: CloseButtonClickDetectServiceImpl | null = null;
    private closeButtonClickDetectRepository: CloseButtonClickDetectRepositoryImpl;
    private myCardCloseButtonRepository: MyCardCloseButtonRepositoryImpl;
    private cardClickDetectRepository: MyCardScreenCardClickDetectRepositoryImpl;
    private transparentBackgroundRepository : TransparentBackgroundRepositoryImpl;
    private detailCardStateManager: DetailCardStateManager;
    private cameraRepository: CameraRepository;

    private hasCloseButtonBeenClicked: boolean = false;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.closeButtonClickDetectRepository = CloseButtonClickDetectRepositoryImpl.getInstance();
        this.myCardCloseButtonRepository = MyCardCloseButtonRepositoryImpl.getInstance();
        this.cardClickDetectRepository = MyCardScreenCardClickDetectRepositoryImpl.getInstance();
        this.transparentBackgroundRepository = TransparentBackgroundRepositoryImpl.getInstance();
        this.detailCardStateManager = DetailCardStateManager.getInstance();
        this.cameraRepository = CameraRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): CloseButtonClickDetectServiceImpl {
        if (!CloseButtonClickDetectServiceImpl.instance) {
            CloseButtonClickDetectServiceImpl.instance = new CloseButtonClickDetectServiceImpl(camera, scene);
        }
        return CloseButtonClickDetectServiceImpl.instance;
    }

    public setCloseButtonClickState(state: boolean): void {
        this.hasCloseButtonBeenClicked = state;
    }

    public getCloseButtonClickState(): boolean {
        return this.hasCloseButtonBeenClicked;
    }

    public async handleCloseButtonClickEvent(clickPoint: { x: number; y: number }): Promise<MyCardCloseButton | null> {
        const { x, y } = clickPoint;
        const button = this.getCloseButton();
        if (button !== null) {
            const clickedButton = this.closeButtonClickDetectRepository.isCloseButtonClicked(
                { x, y },
                button,
                this.camera);

            if (clickedButton) {
                console.log(`!!![DEBUG] Clicked Close Button ID: ${clickedButton.id}`);
                this.setTransparentBackgroundVisibility(false);
                this.setCloseButtonVisibility(false);
                const currentClickedCardId = this.getCurrentClickedCardId();
                if (currentClickedCardId) {
                    this.setDetailCardVisibility(currentClickedCardId, false);
                }
                this.setTransparentBackgroundVisibility(false);
                return clickedButton;
            }
        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<MyCardCloseButton | null> {
        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            return await this.handleCloseButtonClickEvent(clickPoint);
        }
        return null;
    }

    private getCloseButton(): MyCardCloseButton | null {
        return this.myCardCloseButtonRepository.findButtonById(0);
    }

    private getCurrentClickedCardId(): number | null {
        return this.cardClickDetectRepository.findCurrentClickedCardId();
    }

    private setTransparentBackgroundVisibility(isVisible: boolean): void {
        const background = this.transparentBackgroundRepository.findTransparentBackground();
        if (background) {
            background.setVisibility(isVisible);
        }
    }

    private setCloseButtonVisibility(isVisible: boolean): void {
        if (isVisible == true) {
            this.myCardCloseButtonRepository.showButton(0);
        } else {
            this.myCardCloseButtonRepository.hideButton(0);
        }
    }

    private setDetailCardVisibility(cardId: number, isVisible: boolean): void {
        this.detailCardStateManager.setCardVisibility(cardId, isVisible);
    }

}
