import * as THREE from "three";

import {DeckEditDoneButton} from "../../deck_edit_done_button/entity/DeckEditDoneButton";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {DeckEditDoneButtonClickDetectService} from "./DeckEditDoneButtonClickDetectService";
import {DeckEditDoneButtonClickDetectRepositoryImpl} from "../repository/DeckEditDoneButtonClickDetectRepositoryImpl";
import {DeckEditDoneButtonRepositoryImpl} from "../../deck_edit_done_button/repository/DeckEditDoneButtonRepositoryImpl";
import {DeckEditButtonClickDetectRepositoryImpl} from "../../deck_edit_button_click_detect/repository/DeckEditButtonClickDetectRepositoryImpl";

export class DeckEditDoneButtonClickDetectServiceImpl implements DeckEditDoneButtonClickDetectService {
    private static instance: DeckEditDoneButtonClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private deckEditDoneButtonClickDetectRepository: DeckEditDoneButtonClickDetectRepositoryImpl;
    private deckEditDoneButtonRepository: DeckEditDoneButtonRepositoryImpl;
    private deckEditButtonClickDetectRepository: DeckEditButtonClickDetectRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckEditDoneButtonClickDetectRepository = DeckEditDoneButtonClickDetectRepositoryImpl.getInstance();
        this.deckEditDoneButtonRepository = DeckEditDoneButtonRepositoryImpl.getInstance();
        this.deckEditButtonClickDetectRepository = DeckEditButtonClickDetectRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckEditDoneButtonClickDetectServiceImpl {
        if (!DeckEditDoneButtonClickDetectServiceImpl.instance) {
            DeckEditDoneButtonClickDetectServiceImpl.instance = new DeckEditDoneButtonClickDetectServiceImpl(camera, scene);
        }
        return DeckEditDoneButtonClickDetectServiceImpl.instance;
    }

    private setButtonClickEnabled(isEnabled: boolean): void {
        this.deckEditDoneButtonClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private isButtonClickEnabled(): boolean {
        return this.deckEditDoneButtonClickDetectRepository.isButtonClickEnabled();
    }

    public async handleClick(clickPoint: { x: number; y: number }): Promise<DeckEditDoneButton | null> {
        const { x, y } = clickPoint;
        const button = this.getDeckEditDoneButton();
        if (button !== null) {
            const clickedButton = this.deckEditDoneButtonClickDetectRepository.isDeckEditDoneButtonClicked(
                { x, y },
                button,
                this.camera);

            if (clickedButton) {
                this.saveCurrentButtonClickState(true);
                console.log(`%c Clicked Deck Edit Done Button`, 'color: #ffbb00; font-weight: bold;');

                return clickedButton;
            }
        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeckEditDoneButton | null> {
        if (!this.isButtonClickEnabled()) return null;
        if (this.getDeckEditDoneButtonVisibility() == false) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            const result = await this.handleClick(clickPoint);
            if (result) {
                this.setInteractionStatesAfterClick();
                return result;
            }
        }
        return null;
    }

    private setInteractionStatesAfterClick(): void {
        this.deckEditButtonClickDetectRepository.setButtonClickEnabled(true);
        this.setButtonClickEnabled(false);
    }

    private getDeckEditDoneButton(): DeckEditDoneButton | null {
        return this.deckEditDoneButtonRepository.findButtonById(1);
    }

    private saveCurrentButtonClickState(state: boolean): void {
        this.deckEditDoneButtonClickDetectRepository.saveCurrentButtonClickState(state);
    }

    public getCurrentButtonClickState(): boolean | null {
        return this.deckEditDoneButtonClickDetectRepository.getCurrentButtonClickState();
    }

    private getDeckEditDoneButtonVisibility(): boolean | undefined {
        const button = this.getDeckEditDoneButton();
        if (button !== null) {
            return button.getVisibility();
        }
    }

}
