import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {CardRace} from "../../card/race";

import {CardFilterRaceOptionInactive} from "../entity/CardFilterRaceOptionInactive";
import {CardFilterRaceOptionInactiveRepositoryImpl} from "../repository/CardFilterRaceOptionInactiveRepositoryImpl";
import {CardFilterRaceOptionInactiveService} from './CardFilterRaceOptionInactiveService';

export class CardFilterRaceOptionInactiveServiceImpl implements CardFilterRaceOptionInactiveService {
    private static instance: CardFilterRaceOptionInactiveServiceImpl;
    private cardFilterRaceOptionInactiveRepository: CardFilterRaceOptionInactiveRepositoryImpl;

    private constructor(scene: THREE.Scene) {
        this.cardFilterRaceOptionInactiveRepository = CardFilterRaceOptionInactiveRepositoryImpl.getInstance(scene);
    }

    public static getInstance(scene: THREE.Scene): CardFilterRaceOptionInactiveServiceImpl {
        if (!CardFilterRaceOptionInactiveServiceImpl.instance) {
            CardFilterRaceOptionInactiveServiceImpl.instance = new CardFilterRaceOptionInactiveServiceImpl(scene);
        }
        return CardFilterRaceOptionInactiveServiceImpl.instance;
    }

    public async createCardFilterRaceOptionInactive(type: CardRace, position: Vector2d): Promise<void> {
        try {
            await this.cardFilterRaceOptionInactiveRepository.createRaceOption(type, position);

        } catch (error) {
            console.error('Error creating Card Filter Race Option:', error);
        }
    }

    public adjustCardFilterRaceOptionInactivePosition(): void {
        const optionList = this.getAllCardFilterRaceOptionInactive();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        optionList.forEach((option) => {
            const optionMesh = option.getMesh();
            const initialPosition = option.position;

            const optionWidth = 0.033 * windowWidth;
            const optionHeight = optionWidth;

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;

            optionMesh.geometry.dispose();
            optionMesh.geometry = new THREE.PlaneGeometry(optionWidth, optionHeight);
            optionMesh.position.set(newPositionX, newPositionY, 0);
        });
    }

    public getAllCardFilterRaceOptionInactive(): CardFilterRaceOptionInactive[] {
        return this.cardFilterRaceOptionInactiveRepository.findAllOptions();
    }

}
