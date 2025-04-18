import * as THREE from "three";

import {MyDeckButtonEffectHoverDetectRepository} from "./MyDeckButtonEffectHoverDetectRepository";
import {MyDeckButtonEffect} from "../../my_deck_button_effect/entity/MyDeckButtonEffect";

export class MyDeckButtonEffectHoverDetectRepositoryImpl implements MyDeckButtonEffectHoverDetectRepository {
    private static instance: MyDeckButtonEffectHoverDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();
    private currentHoverButtonId: number | null = null;

    public static getInstance(): MyDeckButtonEffectHoverDetectRepositoryImpl {
        if (!MyDeckButtonEffectHoverDetectRepositoryImpl.instance) {
            MyDeckButtonEffectHoverDetectRepositoryImpl.instance = new MyDeckButtonEffectHoverDetectRepositoryImpl();
        }
        return MyDeckButtonEffectHoverDetectRepositoryImpl.instance;
    }

    public isMyDeckButtonEffectHover(hoverPoint: { x: number; y: number },
        effectList: MyDeckButtonEffect[],
        camera: THREE.Camera): any | null {
            const { x, y } = hoverPoint;

            const normalizedMouse = new THREE.Vector2(
                (x / window.innerWidth) * 2 - 1,
                -(y / window.innerHeight) * 2 + 1
            );

            this.raycaster.setFromCamera(normalizedMouse, camera);

            const meshes = effectList.map(effect => effect.getMesh());
            const intersects = this.raycaster.intersectObjects(meshes);

            if (intersects.length > 0) {
                const intersectedMesh = intersects[0].object;
                const hoveredEffect = effectList.find(
                    effect => effect.getMesh() === intersectedMesh
                );

                if (hoveredEffect) {
                    console.log('Detect Hovered Effect!')
                    return hoveredEffect;
                }
            }
            return null;
        }

    public saveCurrentHoveredEffectId(id: number): void {
        this.currentHoverButtonId = id;
    }

    public findCurrentHoveredEffectId(): number | null {
        return this.currentHoverButtonId;
    }

}