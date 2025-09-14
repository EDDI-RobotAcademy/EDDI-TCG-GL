import * as THREE from 'three';
import {DeckNameEditPopupButtonsService} from './DeckNameEditPopupButtonsService';
import {DeckNameEditPopupButtonsType} from "../entity/DeckNameEditPopupButtonsType";
import {DeckNameEditPopupButtons} from "../entity/DeckNameEditPopupButtons";
import {DeckNameEditPopupButtonsRepositoryImpl} from "../repository/DeckNameEditPopupButtonsRepositoryImpl";
import {Vector2d} from "../../common/math/Vector2d";

export class DeckNameEditPopupButtonsServiceImpl implements DeckNameEditPopupButtonsService {
    private static instance: DeckNameEditPopupButtonsServiceImpl;
    private deckNameEditPopupButtonsRepository: DeckNameEditPopupButtonsRepositoryImpl;

    private constructor() {
        this.deckNameEditPopupButtonsRepository = DeckNameEditPopupButtonsRepositoryImpl.getInstance();
    }

    public static getInstance(): DeckNameEditPopupButtonsServiceImpl {
        if (!DeckNameEditPopupButtonsServiceImpl.instance) {
            DeckNameEditPopupButtonsServiceImpl.instance = new DeckNameEditPopupButtonsServiceImpl();
        }
        return DeckNameEditPopupButtonsServiceImpl.instance;
    }

    public async createDeckNameEditPopupButtons(
        type: DeckNameEditPopupButtonsType,
        position: Vector2d
    ): Promise<THREE.Group | null> {
        const buttonGroup = new THREE.Group();
        try {
            const button = await this.deckNameEditPopupButtonsRepository.createPopupButtons(type, position);
            const buttonMesh = button.getMesh()
            buttonGroup.add(buttonMesh)

        } catch (error) {
            console.error('Error creating Deck Name Edit Popup Buttons:', error);
            return null;
        }
        return buttonGroup;
    }

    public adjustDeckMakePopupButtonsPosition(): void {
        const buttonList = this.getAllDeckNameEditPopupButtons();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        buttonList.forEach((button) =>{
            const buttonMesh = button.getMesh();
            const initialPosition = button.position;

            const buttonWidth = (150 / 1920) * windowWidth;
            const buttonHeight = buttonWidth * (80/360);

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;

            buttonMesh.geometry.dispose();
            buttonMesh.geometry = new THREE.PlaneGeometry(buttonWidth, buttonHeight);

            buttonMesh.position.set(newPositionX, newPositionY, 0);
        });

    }

    public getAllDeckNameEditPopupButtons(): DeckNameEditPopupButtons[] {
        return this.deckNameEditPopupButtonsRepository.findAllButtons();
    }

}
