import * as THREE from 'three';

import {Vector2d} from "../../../../../common/math/Vector2d";
import {YourFieldCardScene} from "../entity/YourFieldCardScene";

export interface YourFieldCardSceneCache {
    count(): number
    create(cardMesh: THREE.Mesh): Promise<YourFieldCardScene>;
    findById(id: number): YourFieldCardScene | undefined;
    // findIndexByCardMeshId(cardMeshId: number): number | undefined;
    findAll(): YourFieldCardScene[];
    deleteById(id: number): boolean;
    deleteAll(): void;
    extractByIndex(index: number): YourFieldCardScene | undefined
}