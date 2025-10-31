import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {CardRace} from "../../card/race";

import {CardFilterRaceOptionActive} from "../entity/CardFilterRaceOptionActive";
import {CardFilterRaceOptionActiveRepositoryImpl} from "../repository/CardFilterRaceOptionActiveRepositoryImpl";
import {CardFilterRaceOptionActiveService} from './CardFilterRaceOptionActiveService';

export class CardFilterRaceOptionActiveServiceImpl implements CardFilterRaceOptionActiveService {
    private static instance: CardFilterRaceOptionActiveServiceImpl;
    private cardFilterRaceOptionActiveRepository: CardFilterRaceOptionActiveRepositoryImpl;

    private constructor(scene: THREE.Scene) {
        this.cardFilterRaceOptionActiveRepository = CardFilterRaceOptionActiveRepositoryImpl.getInstance(scene);
    }

    public static getInstance(scene: THREE.Scene): CardFilterRaceOptionActiveServiceImpl {
        if (!CardFilterRaceOptionActiveServiceImpl.instance) {
            CardFilterRaceOptionActiveServiceImpl.instance = new CardFilterRaceOptionActiveServiceImpl(scene);
        }
        return CardFilterRaceOptionActiveServiceImpl.instance;
    }

    public async createCardFilterRaceOptionActive(type: CardRace, position: Vector2d): Promise<void> {
        try {
            await this.cardFilterRaceOptionActiveRepository.createRaceOption(type, position);

        } catch (error) {
            console.error('Error creating Card Filter Race Option:', error);
        }
    }

    public adjustCardFilterRaceOptionActivePosition(): void {
        const optionList = this.getAllCardFilterRaceOptionActive();
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

    public getAllCardFilterRaceOptionActive(): CardFilterRaceOptionActive[] {
        return this.cardFilterRaceOptionActiveRepository.findAllOptions();
    }

}
