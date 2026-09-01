import * as THREE from "three";

import {LeftClickYourFieldDetectRepository} from "./LeftClickYourFieldDetectRepository";
import {YourFieldCardScene} from "../../battle/field/your/card_scene/entity/YourFieldCardScene";

export class LeftClickYourFieldDetectRepositoryImpl implements LeftClickYourFieldDetectRepository {
    private static instance: LeftClickYourFieldDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    public static getInstance(): LeftClickYourFieldDetectRepositoryImpl {
        if (!LeftClickYourFieldDetectRepositoryImpl.instance) {
            LeftClickYourFieldDetectRepositoryImpl.instance = new LeftClickYourFieldDetectRepositoryImpl();
        }
        return LeftClickYourFieldDetectRepositoryImpl.instance;
    }

    isYourFieldAreaClicked(clickPoint: { x: number; y: number },
                           cardSceneList: YourFieldCardScene[],
                           camera: THREE.Camera): any | null {
        const { x, y } = clickPoint;

        const normalizedMouse = new THREE.Vector2(
            (x / window.innerWidth) * 2 - 1,
            -(y / window.innerHeight) * 2 + 1
        );

        this.raycaster.setFromCamera(normalizedMouse, camera);

        const meshes = cardSceneList.map(cardScene => cardScene.getMesh());
        const intersects = this.raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            const intersectedMesh = intersects[0].object;
            const clickedCardScene = cardSceneList.find(
                cardScene => cardScene.getMesh() === intersectedMesh
            );

            if (clickedCardScene) {
                console.log('detect clicked your field card!')
                return clickedCardScene;
            }
        }

        return null;
    }
}