import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {CardGrade} from "../../card/grade";

import {CardFilterGradeOptionActive} from "../entity/CardFilterGradeOptionActive";
import {CardFilterGradeOptionActiveRepositoryImpl} from "../repository/CardFilterGradeOptionActiveRepositoryImpl";
import {CardFilterGradeOptionActiveService} from './CardFilterGradeOptionActiveService';

export class CardFilterGradeOptionActiveServiceImpl implements CardFilterGradeOptionActiveService {
    private static instance: CardFilterGradeOptionActiveServiceImpl;
    private cardFilterGradeOptionActiveRepository: CardFilterGradeOptionActiveRepositoryImpl;

    private constructor(scene: THREE.Scene) {
        this.cardFilterGradeOptionActiveRepository = CardFilterGradeOptionActiveRepositoryImpl.getInstance(scene);
    }

    public static getInstance(scene: THREE.Scene): CardFilterGradeOptionActiveServiceImpl {
        if (!CardFilterGradeOptionActiveServiceImpl.instance) {
            CardFilterGradeOptionActiveServiceImpl.instance = new CardFilterGradeOptionActiveServiceImpl(scene);
        }
        return CardFilterGradeOptionActiveServiceImpl.instance;
    }

    public async createCardFilterGradeOptionActive(type: CardGrade, position: Vector2d): Promise<void> {
        try {
            await this.cardFilterGradeOptionActiveRepository.createGradeOption(type, position);

        } catch (error) {
            console.error('Error creating Card Filter Grade Option:', error);
        }
    }

    public adjustCardFilterGradeOptionActivePosition(): void {
        const optionList = this.getAllCardFilterGradeOptionActive();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        optionList.forEach((option) => {
            const optionMesh = option.getMesh();
            const initialPosition = option.position;

            const optionWidth = 0.127 * windowWidth;
            const optionHeight = optionWidth * (24/244);

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;

            optionMesh.geometry.dispose();
            optionMesh.geometry = new THREE.PlaneGeometry(optionWidth, optionHeight);
            optionMesh.position.set(newPositionX, newPositionY, 0);
        });
    }

    public getAllCardFilterGradeOptionActive(): CardFilterGradeOptionActive[] {
        return this.cardFilterGradeOptionActiveRepository.findAllGradeOptions();
    }

}
