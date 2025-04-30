import * as THREE from 'three';
import {DeckEditButtonService} from './DeckEditButtonService';
import {DeckEditButton} from "../entity/DeckEditButton";
import {DeckEditButtonRepositoryImpl} from "../repository/DeckEditButtonRepositoryImpl";
import {Vector2d} from "../../common/math/Vector2d";

export class DeckEditButtonServiceImpl implements DeckEditButtonService {
    private static instance: DeckEditButtonServiceImpl;
    private deckEditButtonRepository: DeckEditButtonRepositoryImpl;

    private constructor() {
        this.deckEditButtonRepository = DeckEditButtonRepositoryImpl.getInstance();
    }

    public static getInstance(): DeckEditButtonServiceImpl {
        if (!DeckEditButtonServiceImpl.instance) {
            DeckEditButtonServiceImpl.instance = new DeckEditButtonServiceImpl();
        }
        return DeckEditButtonServiceImpl.instance;
    }

    public async createDeckEditButton(type: number, position: Vector2d): Promise<THREE.Group | null> {
        const buttonGroup = new THREE.Group();
        try {
            const button = await this.deckEditButtonRepository.createDeckEditButton(type, position);
            const buttonMesh = button.getMesh();
            buttonGroup.add(buttonMesh);

        } catch (error) {
            console.error('Error creating Deck Edit Button:', error);
            return null;
        }
        return buttonGroup;
    }

    public adjustDeckEditButtonPosition(): void {
        const buttonList = this.getAllDeckEditButton();
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

    public getDeckEditButtonById(id: number): DeckEditButton | null {
        return this.deckEditButtonRepository.findButtonById(id);
    }

    public deleteDeckEditButtonById(id: number): void {
        this.deckEditButtonRepository.deleteButtonById(id);
    }

    public getAllDeckEditButton(): DeckEditButton[] {
        return this.deckEditButtonRepository.findAll();
    }

    public deleteAllDeckEditButtons(): void {
        this.deckEditButtonRepository.deleteAll();
    }

}
