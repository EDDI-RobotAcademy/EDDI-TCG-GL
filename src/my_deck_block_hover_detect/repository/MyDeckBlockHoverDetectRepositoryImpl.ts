import * as THREE from "three";

import {MyDeckBlockHoverDetectRepository} from "./MyDeckBlockHoverDetectRepository";
import {MyDeckBlock} from "../../my_deck_block/entity/MyDeckBlock";
import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class MyDeckBlockHoverDetectRepositoryImpl implements MyDeckBlockHoverDetectRepository {
    private static instance: MyDeckBlockHoverDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;

    private currentHoverBlockId: number | null = null;
    private blockHoverEnabled: boolean = false;

    private constructor() {
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

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
        const scrollArea = this.getScrollArea();

        if (scrollArea == null) return null;

        scrollArea.width = 0.202 * window.innerWidth;
        scrollArea.height = 0.61 * window.innerHeight;
        scrollArea.position.set(0.38 * window.innerWidth, -0.024 * window.innerHeight);

        const clippingPlanes = this.clippingMaskManager.setClippingPlanes(scrollArea);
        const candidateMeshes = meshes.filter(blockMesh =>
            this.clippingMaskManager.isMeshVisible(blockMesh, clippingPlanes)
        );

        if (candidateMeshes.length === 0) return null;

        const intersects = this.raycaster.intersectObjects(candidateMeshes, false);
        if (intersects.length === 0) {
            return null;
        }

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

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(3, 2);
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