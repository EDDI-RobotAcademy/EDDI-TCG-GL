import * as THREE from 'three';
import {RequiredNumberOfCardsService} from './RequiredNumberOfCardsService';
import {RequiredNumberOfCards} from "../entity/RequiredNumberOfCards";
import {RequiredNumberOfCardsRepositoryImpl} from "../repository/RequiredNumberOfCardsRepositoryImpl";
import {Vector2d} from "../../common/math/Vector2d";

export class RequiredNumberOfCardsServiceImpl implements RequiredNumberOfCardsService {
    private static instance: RequiredNumberOfCardsServiceImpl;
    private requiredNumberOfCardsRepository: RequiredNumberOfCardsRepositoryImpl;

    private constructor(scene: THREE.Scene) {
        this.requiredNumberOfCardsRepository = RequiredNumberOfCardsRepositoryImpl.getInstance(scene);
    }

    public static getInstance(scene: THREE.Scene): RequiredNumberOfCardsServiceImpl {
        if (!RequiredNumberOfCardsServiceImpl.instance) {
            RequiredNumberOfCardsServiceImpl.instance = new RequiredNumberOfCardsServiceImpl(scene);
        }
        return RequiredNumberOfCardsServiceImpl.instance;
    }

    public async createRequiredNumberOfCards(): Promise<void> {
        try {
            await this.requiredNumberOfCardsRepository.createRequiredNumberOfCards();

        } catch (error) {
            console.error('Error creating RequiredNumberOfCards:', error);
            return;
        }
    }

    public adjustNumberPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const requiredNumberOfCards = this.getNumber();

        if (requiredNumberOfCards !== null) {
            const requiredNumberOfCardsMesh = requiredNumberOfCards.getMesh();
            const initialPosition = requiredNumberOfCards.position;

            const numberWidth = 0.013 * windowWidth;
            const numberHeight = numberWidth;

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;

            requiredNumberOfCardsMesh.geometry.dispose();
            requiredNumberOfCardsMesh.geometry = new THREE.PlaneGeometry(numberWidth, numberHeight);
            requiredNumberOfCardsMesh.position.set(newPositionX, newPositionY, 0);
        }
    }

    public getNumber(): RequiredNumberOfCards | null {
        return this.requiredNumberOfCardsRepository.findNumber();
    }

}
