import * as THREE from 'three';
import {CardFilterButtonService} from './CardFilterButtonService';
import {CardFilterButton} from "../entity/CardFilterButton";
import {CardFilterButtonRepositoryImpl} from "../repository/CardFilterButtonRepositoryImpl";
import {Vector2d} from "../../common/math/Vector2d";

export class CardFilterButtonServiceImpl implements CardFilterButtonService {
    private static instance: CardFilterButtonServiceImpl;
    private cardFilterButtonRepository: CardFilterButtonRepositoryImpl;

    private constructor(scene: THREE.Scene) {
        this.cardFilterButtonRepository = CardFilterButtonRepositoryImpl.getInstance(scene);
    }

    public static getInstance(scene: THREE.Scene): CardFilterButtonServiceImpl {
        if (!CardFilterButtonServiceImpl.instance) {
            CardFilterButtonServiceImpl.instance = new CardFilterButtonServiceImpl(scene);
        }
        return CardFilterButtonServiceImpl.instance;
    }

    public async createCardFilterButton(): Promise<void> {
        try {
            await this.cardFilterButtonRepository.createButton();

        } catch (error) {
            console.error('Error creating Card Filter Button:', error);
        }
    }

    public adjustCardFilterButtonPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const button = this.getCardFilterButton();
        if (button == null) return;

        const buttonMesh = button.getMesh();
        const initialPosition = button.position;

        const buttonWidth = 0.023 * windowWidth;
        const buttonHeight = buttonWidth * (40/48);

        const newPositionX = initialPosition.getX() * windowWidth;
        const newPositionY = initialPosition.getY() * windowHeight;

        buttonMesh.geometry.dispose();
        buttonMesh.geometry = new THREE.PlaneGeometry(buttonWidth, buttonHeight);

        buttonMesh.position.set(newPositionX, newPositionY, 0);

    }

    public getCardFilterButton(): CardFilterButton | null {
        return this.cardFilterButtonRepository.findButton();
    }

    public deleteCardFilterButton(): void {
        this.cardFilterButtonRepository.deleteButton();
    }

}
