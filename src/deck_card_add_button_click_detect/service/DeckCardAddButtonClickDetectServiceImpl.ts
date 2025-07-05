import * as THREE from "three";

import {getCardById} from "../../card/utility";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import {DeckCardAddButtonClickDetectService} from "./DeckCardAddButtonClickDetectService";
import {DeckCardAddButtonClickDetectRepositoryImpl} from "../repository/DeckCardAddButtonClickDetectRepositoryImpl";

import {DeckCardAddButton} from "../../deck_card_add_button/entity/DeckCardAddButton";
import {DeckCardAddButtonRepositoryImpl} from "../../deck_card_add_button/repository/DeckCardAddButtonRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";

export class DeckCardAddButtonClickDetectServiceImpl implements DeckCardAddButtonClickDetectService {
    private static instance: DeckCardAddButtonClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private deckCardAddButtonClickDetectRepository: DeckCardAddButtonClickDetectRepositoryImpl;
    private deckCardAddButtonRepository: DeckCardAddButtonRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckCardAddButtonClickDetectRepository = DeckCardAddButtonClickDetectRepositoryImpl.getInstance();
        this.deckCardAddButtonRepository = DeckCardAddButtonRepositoryImpl.getInstance(scene);
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckCardAddButtonClickDetectServiceImpl {
        if (!DeckCardAddButtonClickDetectServiceImpl.instance) {
            DeckCardAddButtonClickDetectServiceImpl.instance = new DeckCardAddButtonClickDetectServiceImpl(camera, scene);
        }
        return DeckCardAddButtonClickDetectServiceImpl.instance;
    }

    private setButtonClickEnabled(isEnabled: boolean): void {
        this.deckCardAddButtonClickDetectRepository.setButtonClickEnabled(isEnabled);
    }

    private isButtonClickEnabled(): boolean {
        return this.deckCardAddButtonClickDetectRepository.isButtonClickEnabled();
    }

    async handleButtonClick(clickPoint: { x: number; y: number }): Promise<DeckCardAddButton | null> {
        const { x, y } = clickPoint;
        const currentClickedDeckId = this.getCurrentClickDeckId();
        if (currentClickedDeckId == null) return null;

        const allButtonList = this.getAllDeckCardAddButtonList(currentClickedDeckId);
        if (allButtonList == null) return null;

        const clickedButton = this.deckCardAddButtonClickDetectRepository.isButtonClicked(
            { x, y },
            allButtonList,
            this.camera
        );

        if (clickedButton) {
            const buttonUniqueId = clickedButton.id;
            console.log(`Clicked Deck Card Add Button Unique ID: ${buttonUniqueId}`);

            this.saveCurrentClickedButtonId(buttonUniqueId);

            return clickedButton;
        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<DeckCardAddButton | null> {
        if (!this.isButtonClickEnabled()) return null;

        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            return await this.handleButtonClick(clickPoint);
        }
        return null;
    }

    private saveCurrentClickedButtonId(cardId: number): void {
        this.deckCardAddButtonClickDetectRepository.saveCurrentClickedButtonId(cardId);
    }

    public getCurrentClickedButtonId(): number | null {
        return this.deckCardAddButtonClickDetectRepository.getCurrentClickedButtonId() ?? null;
    }

    private getAllDeckCardAddButtonList(deckId: number): DeckCardAddButton[] | null {
        return this.deckCardAddButtonRepository.findButtonListByDeckId(deckId);
    }

    private getCurrentClickDeckId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

}
