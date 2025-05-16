import * as THREE from 'three';
import {DeckEditDoneButtonService} from './DeckEditDoneButtonService';
import {DeckEditDoneButton} from "../entity/DeckEditDoneButton";
import {DeckEditDoneButtonRepositoryImpl} from "../repository/DeckEditDoneButtonRepositoryImpl";
import {Vector2d} from "../../common/math/Vector2d";

export class DeckEditDoneButtonServiceImpl implements DeckEditDoneButtonService {
    private static instance: DeckEditDoneButtonServiceImpl;
    private deckEditDoneButtonRepository: DeckEditDoneButtonRepositoryImpl;

    private constructor() {
        this.deckEditDoneButtonRepository = DeckEditDoneButtonRepositoryImpl.getInstance();
    }

    public static getInstance(): DeckEditDoneButtonServiceImpl {
        if (!DeckEditDoneButtonServiceImpl.instance) {
            DeckEditDoneButtonServiceImpl.instance = new DeckEditDoneButtonServiceImpl();
        }
        return DeckEditDoneButtonServiceImpl.instance;
    }

    public async createDeckEditDoneButton(type: number, position: Vector2d): Promise<THREE.Group | null> {
        const buttonGroup = new THREE.Group();
        try {
            const button = await this.deckEditDoneButtonRepository.createDeckEditDoneButton(type, position);
            const buttonMesh = button.getMesh();
            buttonGroup.add(buttonMesh);

        } catch (error) {
            console.error('Error creating Deck Edit Done Button:', error);
            return null;
        }
        return buttonGroup;
    }

    public adjustDeckEditDoneButtonPosition(): void {
        const buttonList = this.getAllDeckEditDoneButton();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        buttonList.forEach((button) => {
            const buttonMesh = button.getMesh();
            const initialPosition = button.position;

            const buttonWidth = 0.18 * windowWidth;
            const buttonHeight = buttonWidth * (250/950);

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;

            buttonMesh.geometry.dispose();
            buttonMesh.geometry = new THREE.PlaneGeometry(buttonWidth, buttonHeight);

            buttonMesh.position.set(newPositionX, newPositionY, 0);
        });

    }

    public getDeckEditDoneButtonById(id: number): DeckEditDoneButton | null {
        return this.deckEditDoneButtonRepository.findButtonById(id);
    }

    public deleteDeckEditDoneButtonById(id: number): void {
        this.deckEditDoneButtonRepository.deleteButtonById(id);
    }

    public getAllDeckEditDoneButton(): DeckEditDoneButton[] {
        return this.deckEditDoneButtonRepository.findAll();
    }

    public deleteAllDeckEditDoneButton(): void {
        this.deckEditDoneButtonRepository.deleteAll();
    }

}
