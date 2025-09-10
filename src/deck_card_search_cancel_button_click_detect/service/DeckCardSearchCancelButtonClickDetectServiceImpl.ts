import * as THREE from "three";

import {DeckCardSearchCancelButtonClickDetectService} from "./DeckCardSearchCancelButtonClickDetectService";
import {DeckCardSearchCancelButtonClickDetectRepositoryImpl} from "../repository/DeckCardSearchCancelButtonClickDetectRepositoryImpl";

import {MyDeckCardSearchCancelButton} from "../../my_deck_card_search_cancel_button/entity/MyDeckCardSearchCancelButton";
import {MyDeckCardSearchCancelButtonRepositoryImpl} from "../../my_deck_card_search_cancel_button/repository/MyDeckCardSearchCancelButtonRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class DeckCardSearchCancelButtonClickDetectServiceImpl implements DeckCardSearchCancelButtonClickDetectService {
    private static instance: DeckCardSearchCancelButtonClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private deckCardSearchCancelButtonClickDetectRepository: DeckCardSearchCancelButtonClickDetectRepositoryImpl;
    private myDeckCardSearchCancelButtonRepository: MyDeckCardSearchCancelButtonRepositoryImpl;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.deckCardSearchCancelButtonClickDetectRepository = DeckCardSearchCancelButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckCardSearchCancelButtonRepository = MyDeckCardSearchCancelButtonRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DeckCardSearchCancelButtonClickDetectServiceImpl {
        if (!DeckCardSearchCancelButtonClickDetectServiceImpl.instance) {
            DeckCardSearchCancelButtonClickDetectServiceImpl.instance = new DeckCardSearchCancelButtonClickDetectServiceImpl(camera, scene);
        }
        return DeckCardSearchCancelButtonClickDetectServiceImpl.instance;
    }

    private setButtonClickEnabled(isEnable: boolean): void {
        this.deckCardSearchCancelButtonClickDetectRepository.setButtonClickEnabled(isEnable);
    }

    private isButtonClickEnabled(): boolean {
        return this.deckCardSearchCancelButtonClickDetectRepository.isButtonClickEnabled();
    }

    public async handleClick(clickPoint: { x: number; y: number }): Promise<MyDeckCardSearchCancelButton | null> {
        const { x, y } = clickPoint;
        const button = this.getSearchCancelButton();
        if (button !== null) {
            const clickedButton = this.deckCardSearchCancelButtonClickDetectRepository.isButtonClicked(
                { x, y },
                button,
                this.camera);

            if (clickedButton) {
                console.log(`[DEBUG] Clicked Search Cancel Button`);

                return clickedButton;
            }
        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<MyDeckCardSearchCancelButton | null> {
        if (!this.isButtonClickEnabled()) return null;

        if (event.button === 0) {
            const hoverPoint = { x: event.clientX, y: event.clientY };
            return await this.handleClick(hoverPoint);
        }
        return null;
    }

    private getSearchCancelButton(): MyDeckCardSearchCancelButton | null {
        return this.myDeckCardSearchCancelButtonRepository.findButton();
    }

}
