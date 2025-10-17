import * as THREE from 'three';
import {AlertModalContainerRepository} from './AlertModalContainerRepository';
import {AlertModalContainer} from "../entity/AlertModalContainer";
import {AlertModalContainerType} from "../entity/AlertModalContainerType";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {MeshDestroyer} from "../../mesh/destroyer";
import {Vector2d} from "../../common/math/Vector2d";

export class AlertModalContainerRepositoryImpl implements AlertModalContainerRepository {
    private static instance: AlertModalContainerRepositoryImpl;
    private containerMap: Map<AlertModalContainerType, AlertModalContainer> = new Map();

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private readonly CONTAINER_WIDTH: number = 0.425

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): AlertModalContainerRepositoryImpl {
        if (!AlertModalContainerRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            AlertModalContainerRepositoryImpl.instance = new AlertModalContainerRepositoryImpl(textureManager, scene);
        }
        return AlertModalContainerRepositoryImpl.instance;
    }

    public async createContainer(type: AlertModalContainerType, position: Vector2d): Promise<AlertModalContainer> {
        const texture = await this.textureManager.getTexture('alert_modal_container', type);
        if (!texture) {
            throw new Error(`Alert Modal Texture not found`);
        }

        const containerWidth = this.CONTAINER_WIDTH * window.innerWidth;
        const containerHeight = containerWidth * (440/1000);
        const containerMesh = MeshGenerator.createMesh(texture, containerWidth, containerHeight, position);

        const positionX = position.getX() * window.innerWidth;
        const positionY = position.getY() * window.innerHeight;
        containerMesh.position.set(positionX, positionY, 0);

        const newContainer = new AlertModalContainer(type, containerMesh, containerWidth, containerHeight, position);
        this.containerMap.set(type, newContainer);

        return newContainer;
    }

    public findContainerByType(type: AlertModalContainerType): AlertModalContainer | null {
        return this.containerMap.get(type) ?? null;
    }

    public findAllContainers(): AlertModalContainer[] {
        return Array.from(this.containerMap.values());
    }

    public deleteContainerByType(type: AlertModalContainerType): void {
        this.containerMap.delete(type);
    }

    public deleteAllContainers(): void {
        this.containerMap.clear();
    }

    public deleteAllContainerMesh(): void {
        const containerList = this.findAllContainers();
        for (const container of containerList) {
            this.meshDestroyer.destroyMesh(container.getMesh());
        }
    }

}
