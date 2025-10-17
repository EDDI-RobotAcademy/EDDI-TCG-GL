import * as THREE from 'three';
import {AlertModalContainerService} from './AlertModalContainerService';
import {AlertModalContainerType} from "../entity/AlertModalContainerType";
import {AlertModalContainer} from "../entity/AlertModalContainer";
import {AlertModalContainerRepositoryImpl} from "../repository/AlertModalContainerRepositoryImpl";
import {Vector2d} from "../../common/math/Vector2d";

export class AlertModalContainerServiceImpl implements AlertModalContainerService {
    private static instance: AlertModalContainerServiceImpl;
    private alertModalContainerRepository: AlertModalContainerRepositoryImpl;

    private constructor(scene: THREE.Scene) {
        this.alertModalContainerRepository = AlertModalContainerRepositoryImpl.getInstance(scene);
    }

    public static getInstance(scene: THREE.Scene): AlertModalContainerServiceImpl {
        if (!AlertModalContainerServiceImpl.instance) {
            AlertModalContainerServiceImpl.instance = new AlertModalContainerServiceImpl(scene);
        }
        return AlertModalContainerServiceImpl.instance;
    }

    public async createAlertModalContainer(type: AlertModalContainerType, position: Vector2d): Promise<void> {
        try {
            await this.alertModalContainerRepository.createContainer(type, position);

        } catch (error) {
            console.error('Error creating Alert Modal Container:', error);
        }
    }

    public adjustAlertModalContainerPosition(): void {
        const containerList = this.getAllAlertModalContainers();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        containerList.forEach((container) => {
            const containerMesh = container.getMesh();
            const initialPosition = container.position;

            const containerWidth = 0.425 * windowWidth;
            const containerHeight = containerWidth * (440/1000);

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;

            containerMesh.geometry.dispose();
            containerMesh.geometry = new THREE.PlaneGeometry(containerWidth, containerHeight);
            containerMesh.position.set(newPositionX, newPositionY, 0);
        });

    }

    public getAllAlertModalContainers(): AlertModalContainer[] {
        return this.alertModalContainerRepository.findAllContainers();
    }

}
