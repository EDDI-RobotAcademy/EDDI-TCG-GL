import * as THREE from "three";

import {LeftClickHandDetectRepository} from "./LeftClickHandDetectRepository";
import {BattleFieldCardScene} from "../../battle_field_card_scene/entity/BattleFieldCardScene";

export class LeftClickHandDetectRepositoryImpl implements LeftClickHandDetectRepository {
    private static instance: LeftClickHandDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    public static getInstance(): LeftClickHandDetectRepositoryImpl {
        if (!LeftClickHandDetectRepositoryImpl.instance) {
            LeftClickHandDetectRepositoryImpl.instance = new LeftClickHandDetectRepositoryImpl();
        }
        return LeftClickHandDetectRepositoryImpl.instance;
    }

    isYourHandAreaClicked(clickPoint: { x: number; y: number },
                          cardSceneList: BattleFieldCardScene[],
                          camera: THREE.Camera): any | null {
        const { x, y } = clickPoint;

        const normalizedMouse = new THREE.Vector2(
            (x / window.innerWidth) * 2 - 1,
            -(y / window.innerHeight) * 2 + 1
        );

        this.raycaster.setFromCamera(normalizedMouse, camera);

        const meshes = cardSceneList
            .map(cardScene => cardScene.getMesh())
            .filter(mesh => mesh && mesh.visible);
        const intersects = this.raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            const intersectedMesh = intersects[0].object;
            const clickedCardScene = cardSceneList.find(
                cardScene => cardScene.getMesh() === intersectedMesh
            );

            if (clickedCardScene) {
                console.log('detect clicked card!')
                return clickedCardScene;
            }
        }

        return null;
    }
}