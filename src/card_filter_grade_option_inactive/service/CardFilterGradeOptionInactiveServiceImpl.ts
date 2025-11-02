import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {CardGrade} from "../../card/grade";

import {CardFilterGradeOptionInactive} from "../entity/CardFilterGradeOptionInactive";
import {CardFilterGradeOptionInactiveRepositoryImpl} from "../repository/CardFilterGradeOptionInactiveRepositoryImpl";
import {CardFilterGradeOptionInactiveService} from './CardFilterGradeOptionInactiveService';

export class CardFilterGradeOptionInactiveServiceImpl implements CardFilterGradeOptionInactiveService {
    private static instance: CardFilterGradeOptionInactiveServiceImpl;
    private cardFilterGradeOptionInactiveRepository: CardFilterGradeOptionInactiveRepositoryImpl;

    private constructor(scene: THREE.Scene) {
        this.cardFilterGradeOptionInactiveRepository = CardFilterGradeOptionInactiveRepositoryImpl.getInstance(scene);
    }

    public static getInstance(scene: THREE.Scene): CardFilterGradeOptionInactiveServiceImpl {
        if (!CardFilterGradeOptionInactiveServiceImpl.instance) {
            CardFilterGradeOptionInactiveServiceImpl.instance = new CardFilterGradeOptionInactiveServiceImpl(scene);
        }
        return CardFilterGradeOptionInactiveServiceImpl.instance;
    }

    public async createCardFilterGradeOptionInactive(type: CardGrade, position: Vector2d): Promise<void> {
        try {
            await this.cardFilterGradeOptionInactiveRepository.createGradeOption(type, position);

        } catch (error) {
            console.error('Error creating Card Filter Grade Option:', error);
        }
    }

    public adjustCardFilterGradeOptionInactivePosition(): void {
        const optionList = this.getAllCardFilterGradeOptionInactive();
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

    public getAllCardFilterGradeOptionInactive(): CardFilterGradeOptionInactive[] {
        return this.cardFilterGradeOptionInactiveRepository.findAllGradeOptions();
    }

}
