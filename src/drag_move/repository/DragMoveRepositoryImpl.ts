import * as THREE from 'three';
import { DragMoveRepository } from './DragMoveRepository';
import {BattleFieldCardAttributeMarkScene} from "../../battle/card/attribute_mark_scene/entity/BattleFieldCardAttributeMarkScene";
import {LeftClickedArea} from "../../left_click_detect/entity/LeftClickedArea";

export class DragMoveRepositoryImpl implements DragMoveRepository {
    private static instance: DragMoveRepositoryImpl | null = null;

    private selectedObject: THREE.Object3D | null = null;
    private selectedGroup: BattleFieldCardAttributeMarkScene[] = [];
    private selectedArea: LeftClickedArea | null = null;

    private constructor() {}

    static getInstance(): DragMoveRepositoryImpl {
        if (!DragMoveRepositoryImpl.instance) {
            DragMoveRepositoryImpl.instance = new DragMoveRepositoryImpl();
        }
        return DragMoveRepositoryImpl.instance;
    }

    getSelectedObject(): THREE.Object3D | null {
        return this.selectedObject;
    }

    setSelectedObject(object: THREE.Object3D | null): void {
        this.selectedObject = object;
    }

    getSelectedGroup(): BattleFieldCardAttributeMarkScene[] {
        return this.selectedGroup;
    }

    setSelectedGroup(group: BattleFieldCardAttributeMarkScene[]): void {
        this.selectedGroup = group;
    }

    getSelectedArea(): LeftClickedArea | null {
        return this.selectedArea
    }

    setSelectedArea(area: LeftClickedArea | null): void {
        this.selectedArea = area
    }

    deleteSelectedObject(): void {
        this.selectedObject = null;
        console.log("Selected object deleted.");
    }

    deleteSelectedGroup(): void {
        this.selectedGroup = [];
        console.log("Selected group deleted.");
    }

    deleteSelectedArea(): void {
        this.selectedArea = null;
        console.log('Selected area deleted.')
    }
}
