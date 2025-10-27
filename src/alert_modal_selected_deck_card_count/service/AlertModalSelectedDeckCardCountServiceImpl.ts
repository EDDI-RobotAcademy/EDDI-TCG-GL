import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {AlertModalSelectedDeckCardCountService} from './AlertModalSelectedDeckCardCountService';
import {AlertModalSelectedDeckCardCount} from "../entity/AlertModalSelectedDeckCardCount";
import {AlertModalSelectedDeckCardCountRepositoryImpl} from "../repository/AlertModalSelectedDeckCardCountRepositoryImpl";

export class AlertModalSelectedDeckCardCountServiceImpl implements AlertModalSelectedDeckCardCountService {
    private static instance: AlertModalSelectedDeckCardCountServiceImpl;
    private alertModalSelectedDeckCardCountRepository: AlertModalSelectedDeckCardCountRepositoryImpl;

    private constructor(scene: THREE.Scene) {
        this.alertModalSelectedDeckCardCountRepository = AlertModalSelectedDeckCardCountRepositoryImpl.getInstance(scene);
    }

    public static getInstance(scene: THREE.Scene): AlertModalSelectedDeckCardCountServiceImpl {
        if (!AlertModalSelectedDeckCardCountServiceImpl.instance) {
            AlertModalSelectedDeckCardCountServiceImpl.instance = new AlertModalSelectedDeckCardCountServiceImpl(scene);
        }
        return AlertModalSelectedDeckCardCountServiceImpl.instance;
    }

    public async createAlertModalSelectedDeckCardCount(count: number): Promise<void> {
        try {
            await this.alertModalSelectedDeckCardCountRepository.createSelectedDeckCardCount(count);

        } catch (error) {
            console.error('Error creating Alert Modal Selected Deck Card Count:', error);
        }
    }

    public adjustAlertModalSelectedDeckCardCount(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const count = this.getAlertModalSelectedDeckCardCount();
        if (count == null) return;

        const countMesh = count.getMesh();
        const initialPosition = count.position;

        const countWidth = (count.width / 1800) * windowWidth;
        const countHeight = countWidth * (count.height / count.width);

        const newPositionX = initialPosition.getX() * windowWidth;
        const newPositionY = initialPosition.getY() * windowHeight;

        countMesh.geometry.dispose();
        countMesh.geometry = new THREE.PlaneGeometry(countWidth, countHeight);
        countMesh.position.set(newPositionX, newPositionY, 0);
    }

    public getAlertModalSelectedDeckCardCount(): AlertModalSelectedDeckCardCount | null {
        return this.alertModalSelectedDeckCardCountRepository.findSelectedDeckCardCount();
    }

}
