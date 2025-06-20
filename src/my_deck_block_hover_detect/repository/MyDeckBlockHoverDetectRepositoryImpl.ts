import * as THREE from "three";

import {MyDeckBlockHoverDetectRepository} from "./MyDeckBlockHoverDetectRepository";
import {MyDeckBlock} from "../../my_deck_block/entity/MyDeckBlock";

export class MyDeckBlockHoverDetectRepositoryImpl implements MyDeckBlockHoverDetectRepository {
    private static instance: MyDeckBlockHoverDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    private currentHoverBlockId: number | null = null;
    private blockHoverEnabled: boolean = false;

    public static getInstance(): MyDeckBlockHoverDetectRepositoryImpl {
        if (!MyDeckBlockHoverDetectRepositoryImpl.instance) {
            MyDeckBlockHoverDetectRepositoryImpl.instance = new MyDeckBlockHoverDetectRepositoryImpl();
        }
        return MyDeckBlockHoverDetectRepositoryImpl.instance;
    }

    public isBlockHover(hoverPoint: { x: number; y: number }, blockList: MyDeckBlock[], camera: THREE.Camera): any | null {
        const { x, y } = hoverPoint;
        const normalizedMouse = new THREE.Vector2(
            (x / window.innerWidth) * 2 - 1,
            -(y / window.innerHeight) * 2 + 1
        );

        this.raycaster.setFromCamera(normalizedMouse, camera);

        const meshes = blockList.map(block => block.getMesh());
        const intersects = this.raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            const intersectedMesh = intersects[0].object;
            const hoveredBlock = blockList.find(
                block => block.getMesh() === intersectedMesh
            );

            if (hoveredBlock) {
//                 console.log('detect hovered block!')
                return hoveredBlock;
            }
            return null;
        }
    }

    public saveCurrentHoveredBlockId(id: number): void {
        this.currentHoverBlockId = id;
    }

    public getCurrentHoveredBlockId(): number | null {
        return this.currentHoverBlockId;
    }

    public resetCurrentHoveredBlockId(): void {
        this.currentHoverBlockId = null;
    }

    public setBlockHoverEnabled(isEnabled: boolean): void {
        this.blockHoverEnabled = isEnabled;
    }

    public isBlockHoverEnabled(): boolean {
        return this.blockHoverEnabled;
    }

}