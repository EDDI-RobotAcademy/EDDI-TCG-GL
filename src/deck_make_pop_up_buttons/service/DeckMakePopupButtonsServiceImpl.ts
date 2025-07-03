import * as THREE from 'three';
import {DeckMakePopupButtonsService} from './DeckMakePopupButtonsService';
import {DeckMakePopupButtonsType} from "../entity/DeckMakePopupButtonsType";
import {DeckMakePopupButtons} from "../entity/DeckMakePopupButtons";
import {DeckMakePopupButtonsRepository} from "../repository/DeckMakePopupButtonsRepository";
import {DeckMakePopupButtonsRepositoryImpl} from "../repository/DeckMakePopupButtonsRepositoryImpl";
import {Vector2d} from "../../common/math/Vector2d";

export class DeckMakePopupButtonsServiceImpl implements DeckMakePopupButtonsService {
    private static instance: DeckMakePopupButtonsServiceImpl;
    private deckMakePopupButtonsRepository: DeckMakePopupButtonsRepository;

    private constructor() {
        this.deckMakePopupButtonsRepository = DeckMakePopupButtonsRepositoryImpl.getInstance();
    }

    public static getInstance(): DeckMakePopupButtonsServiceImpl {
        if (!DeckMakePopupButtonsServiceImpl.instance) {
            DeckMakePopupButtonsServiceImpl.instance = new DeckMakePopupButtonsServiceImpl();
        }
        return DeckMakePopupButtonsServiceImpl.instance;
    }

    public async createDeckMakePopupButtons(
        type: DeckMakePopupButtonsType,
        position: Vector2d
    ): Promise<THREE.Group | null> {
        const buttonGroup = new THREE.Group();
        try {
            const button = await this.deckMakePopupButtonsRepository.createDeckMakePopupButtons(type, position);
            const buttonMesh = button.getMesh()
            buttonGroup.add(buttonMesh)

        } catch (error) {
            console.error('Error creating DeckMakePopupButtons:', error);
            return null;
        }
        return buttonGroup;
    }

    public adjustDeckMakePopupButtonsPosition(): void {
        const buttonList = this.getAllDeckMakePopupButtons();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        buttonList.forEach((button) =>{
            const buttonMesh = button.getMesh();
            const initialPosition = button.position;

            const buttonWidth = (138 / 1920) * windowWidth;
            const buttonHeight = (45 / 1080) * windowHeight;

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;

            buttonMesh.geometry.dispose();
            buttonMesh.geometry = new THREE.PlaneGeometry(buttonWidth, buttonHeight);

            buttonMesh.position.set(newPositionX, newPositionY, 0);
        });

    }

    public getDeckMakePopupButtonById(id: number): DeckMakePopupButtons | null {
        return this.deckMakePopupButtonsRepository.findById(id);
    }

    public deleteDeckMakePopupButtonById(id: number): void {
        this.deckMakePopupButtonsRepository.deleteById(id);
    }

    public getAllDeckMakePopupButtons(): DeckMakePopupButtons[] {
        return this.deckMakePopupButtonsRepository.findAll();
    }

    public deleteAllDeckMakePopupButtons(): void {
        this.deckMakePopupButtonsRepository.deleteAll();
    }

}
