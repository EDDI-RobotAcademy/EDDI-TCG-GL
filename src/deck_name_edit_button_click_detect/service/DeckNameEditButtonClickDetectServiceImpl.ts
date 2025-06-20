import * as THREE from "three";
import {getCardById} from "../../card/utility";
import {DeckNameEditButtonClickDetectService} from "./DeckNameEditButtonClickDetectService";
import {DeckNameEditButtonClickDetectRepositoryImpl} from "../repository/DeckNameEditButtonClickDetectRepositoryImpl";
import {DeckNameEditButton} from "../../deck_name_edit_button/entity/DeckNameEditButton";
import {DeckNameEditButtonRepositoryImpl} from "../../deck_name_edit_button/repository/DeckNameEditButtonRepositoryImpl";
import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class DeckNameEditButtonClickDetectServiceImpl implements DeckNameEditButtonClickDetectService {
    private static instance: DeckNameEditButtonClickDetectServiceImpl | null = null;
    private deckNameEditButtonClickDetectRepository: DeckNameEditButtonClickDetectRepositoryImpl;
    private deckNameEditButtonRepository: DeckNameEditButtonRepositoryImpl;
    private cameraRepository: CameraRepository;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.deckNameEditButtonClickDetectRepository = DeckNameEditButtonClickDetectRepositoryImpl.getInstance();
        this.deckNameEditButtonRepository = DeckNameEditButtonRepositoryImpl.getInstance();
        this.cameraRepository = CameraRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckNameEditButtonClickDetectServiceImpl {
        if (!DeckNameEditButtonClickDetectServiceImpl.instance) {
            DeckNameEditButtonClickDetectServiceImpl.instance = new DeckNameEditButtonClickDetectServiceImpl(camera, scene);
        }
        return DeckNameEditButtonClickDetectServiceImpl.instance;
    }

    public setButtonClickEnabled(isEnabled: boolean): void {
        this.deckNameEditButtonClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    public isButtonClickEnabled(): boolean {
        return this.deckNameEditButtonClickDetectRepository.isButtonClickEnabled();
    }

    public async handleButtonClick(clickPoint: { x: number; y: number }): Promise<DeckNameEditButton | null> {
        const { x, y } = clickPoint;
        const buttonList = this.getAllButtons();
        const clickedButton = this.deckNameEditButtonClickDetectRepository.isButtonClicked(
            { x, y },
            buttonList,
            this.camera
        );

        if (clickedButton) {
            const buttonId = clickedButton.id;
            console.log(`[DEBUG] Clicked Deck Name Edit Button ID: ${buttonId}`);
            this.saveCurrentClickedDeckNameEditButtonId(buttonId);

            return clickedButton;

        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeckNameEditButton | null> {
        if (this.isButtonClickEnabled() == false) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            return await this.handleButtonClick(clickPoint);
        }
        return null;
    }

    public getAllButtons(): DeckNameEditButton[] {
        return this.deckNameEditButtonRepository.findAll();
    }

    private saveCurrentClickedDeckNameEditButtonId(buttonId: number): void {
        this.deckNameEditButtonClickDetectRepository.saveCurrentClickedButtonId(buttonId);
    }

}