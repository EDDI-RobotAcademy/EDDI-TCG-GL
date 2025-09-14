import * as THREE from "three";

import {DeckNameEditPopupButtonsClickDetectService} from "./DeckNameEditPopupButtonsClickDetectService";
import {DeckNameEditPopupButtonsClickDetectRepositoryImpl} from "../repository/DeckNameEditPopupButtonsClickDetectRepositoryImpl";

import {DeckNameEditPopupButtons} from "../../deck_name_edit_pop_up_buttons/entity/DeckNameEditPopupButtons";
import {DeckNameEditPopupButtonsRepositoryImpl} from "../../deck_name_edit_pop_up_buttons/repository/DeckNameEditPopupButtonsRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class DeckNameEditPopupButtonsClickDetectServiceImpl implements DeckNameEditPopupButtonsClickDetectService {
    private static instance: DeckNameEditPopupButtonsClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private deckNameEditPopupButtonsClickDetectRepository: DeckNameEditPopupButtonsClickDetectRepositoryImpl;
    private deckNameEditPopupButtonsRepository: DeckNameEditPopupButtonsRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckNameEditPopupButtonsClickDetectRepository = DeckNameEditPopupButtonsClickDetectRepositoryImpl.getInstance();
        this.deckNameEditPopupButtonsRepository = DeckNameEditPopupButtonsRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckNameEditPopupButtonsClickDetectServiceImpl {
        if (!DeckNameEditPopupButtonsClickDetectServiceImpl.instance) {
            DeckNameEditPopupButtonsClickDetectServiceImpl.instance = new DeckNameEditPopupButtonsClickDetectServiceImpl(camera, scene);
        }
        return DeckNameEditPopupButtonsClickDetectServiceImpl.instance;
    }

    private setButtonClickEnabled(isEnabled: boolean): void {
        this.deckNameEditPopupButtonsClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private isButtonClickEnabled(): boolean {
        return this.deckNameEditPopupButtonsClickDetectRepository.isButtonClickEnabled();
    }

    async handleLeftClick(clickPoint: { x: number; y: number }): Promise<DeckNameEditPopupButtons | null> {
        const { x, y } = clickPoint;
        const deckNameEditPopupButtonsList = this.getAllDeckNameEditPopupButtons();
        const clickedDeckNameEditPopupButton = this.deckNameEditPopupButtonsClickDetectRepository.isDeckNameEditPopupButtonsClicked(
            { x, y },
            deckNameEditPopupButtonsList,
            this.camera
        );

        if (clickedDeckNameEditPopupButton) {
            console.log(`Clicked Deck Make Pop-up Button ID: ${clickedDeckNameEditPopupButton.id}`);

            if (clickedDeckNameEditPopupButton.id === 0) {
                console.log(`[DeckNameEditPopupButton] click cancel button!`);
            }

            if (clickedDeckNameEditPopupButton.id === 1) {
                console.log(`[DeckNameEditPopupButton] click edit button!`);
            }
            return clickedDeckNameEditPopupButton;
        }

        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeckNameEditPopupButtons | null> {
        if (!this.isButtonClickEnabled()) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            return await this.handleLeftClick(clickPoint);
        }
        return null;
    }

    private getAllDeckNameEditPopupButtons(): DeckNameEditPopupButtons[] {
        return this.deckNameEditPopupButtonsRepository.findAllButtons();
    }

}