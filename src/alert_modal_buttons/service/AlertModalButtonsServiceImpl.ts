import * as THREE from 'three';
import {AlertModalButtonsService} from './AlertModalButtonsService';
import {AlertModalButtonsType} from "../entity/AlertModalButtonsType";
import {AlertModalButtons} from "../entity/AlertModalButtons";
import {AlertModalButtonsRepositoryImpl} from "../repository/AlertModalButtonsRepositoryImpl";
import {Vector2d} from "../../common/math/Vector2d";

export class AlertModalButtonsServiceImpl implements AlertModalButtonsService {
    private static instance: AlertModalButtonsServiceImpl;
    private alertModalButtonsRepository: AlertModalButtonsRepositoryImpl;

    private constructor(scene: THREE.Scene) {
        this.alertModalButtonsRepository = AlertModalButtonsRepositoryImpl.getInstance(scene);
    }

    public static getInstance(scene: THREE.Scene): AlertModalButtonsServiceImpl {
        if (!AlertModalButtonsServiceImpl.instance) {
            AlertModalButtonsServiceImpl.instance = new AlertModalButtonsServiceImpl(scene);
        }
        return AlertModalButtonsServiceImpl.instance;
    }

    public async createAlertModalButtons(type: AlertModalButtonsType, position: Vector2d): Promise<void> {
        try {
            await this.alertModalButtonsRepository.createButton(type, position);

        } catch (error) {
            console.error('Error creating Alert Modal Buttons:', error);
        }
    }

    public adjustAlertModalButtonsPosition(): void {
        const buttonList = this.getAllAlertModalButtons();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        buttonList.forEach((button) => {
            const buttonMesh = button.getMesh();
            const initialPosition = button.position;

            const buttonWidth = (150/1920) * windowWidth;
            const buttonHeight = buttonWidth * (80/360);

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;

            buttonMesh.geometry.dispose();
            buttonMesh.geometry = new THREE.PlaneGeometry(buttonWidth, buttonHeight);
            buttonMesh.position.set(newPositionX, newPositionY, 0);
        });

    }

    public getAllAlertModalButtons(): AlertModalButtons[] {
        return this.alertModalButtonsRepository.findAllButtons();
    }

}
