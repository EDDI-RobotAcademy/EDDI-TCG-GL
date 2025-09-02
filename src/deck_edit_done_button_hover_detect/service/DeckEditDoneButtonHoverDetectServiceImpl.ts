import * as THREE from "three";

import {DeckEditDoneButtonHoverDetectService} from "./DeckEditDoneButtonHoverDetectService";
import {DeckEditDoneButtonHoverDetectRepositoryImpl} from "../repository/DeckEditDoneButtonHoverDetectRepositoryImpl";

import {DeckEditDoneButton} from "../../deck_edit_done_button/entity/DeckEditDoneButton";
import {DeckEditDoneButtonRepositoryImpl} from "../../deck_edit_done_button/repository/DeckEditDoneButtonRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";
import {DeckEditDoneButtonClickDetectRepositoryImpl} from "../../deck_edit_done_button_click_detect/repository/DeckEditDoneButtonClickDetectRepositoryImpl";

export class DeckEditDoneButtonHoverDetectServiceImpl implements DeckEditDoneButtonHoverDetectService {
    private static instance: DeckEditDoneButtonHoverDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private deckEditDoneButtonHoverDetectRepository: DeckEditDoneButtonHoverDetectRepositoryImpl;
    private deckEditDoneButtonRepository: DeckEditDoneButtonRepositoryImpl;
    private deckEditDoneButtonClickDetectRepository: DeckEditDoneButtonClickDetectRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckEditDoneButtonHoverDetectRepository = DeckEditDoneButtonHoverDetectRepositoryImpl.getInstance();
        this.deckEditDoneButtonRepository = DeckEditDoneButtonRepositoryImpl.getInstance();
        this.deckEditDoneButtonClickDetectRepository = DeckEditDoneButtonClickDetectRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckEditDoneButtonHoverDetectServiceImpl {
        if (!DeckEditDoneButtonHoverDetectServiceImpl.instance) {
            DeckEditDoneButtonHoverDetectServiceImpl.instance = new DeckEditDoneButtonHoverDetectServiceImpl(camera, scene);
        }
        return DeckEditDoneButtonHoverDetectServiceImpl.instance;
    }

    private setButtonHoverEnabled(isEnable: boolean): void {
        this.deckEditDoneButtonHoverDetectRepository.setButtonHoverEnabled(isEnable);
    }

    private isButtonHoverEnabled(): boolean {
        return this.deckEditDoneButtonHoverDetectRepository.isButtonHoverEnabled();
    }

    public async handleHover(hoverPoint: { x: number; y: number }): Promise<DeckEditDoneButton | null> {
        const { x, y } = hoverPoint;
        const button = this.getDeckEditDoneButton();
        if (button !== null) {
            const hoveredButton = this.deckEditDoneButtonHoverDetectRepository.isDeckEditDoneButtonHover(
                { x, y },
                button,
                this.camera);

            if (hoveredButton) {
                console.log(`[DEBUG] Hovered Deck Edit Done Button`);
                this.setButtonVisibility(0, false);
                this.setButtonVisibility(1, true);
                return hoveredButton;

            } else {
                this.setButtonVisibility(0, true);
                this.setButtonVisibility(1, false);
            }
        }
        return null;
    }

    public async onMouseMove(event: MouseEvent): Promise<DeckEditDoneButton | null> {
        if (!this.isButtonHoverEnabled()) return null;

        if (event.button === 0) {
            const hoverPoint = { x: event.clientX, y: event.clientY };
            const result = await this.handleHover(hoverPoint);
            if (result) {
                this.setInteractionStatesAfterHover();
                return result;
            }
        }
        return null;
    }

    private setInteractionStatesAfterHover(): void {
        this.deckEditDoneButtonClickDetectRepository.setButtonClickEnabled(true);
    }

    private getDeckEditDoneButton(): DeckEditDoneButton | null {
        return this.deckEditDoneButtonRepository.findButtonById(0);
    }

    private setButtonVisibility(buttonId: number, isVisible: boolean): void {
        this.deckEditDoneButtonRepository.findButtonById(buttonId)?.setVisibility(isVisible);
    }

}
