import * as THREE from 'three';
import { Vector2d } from "../common/math/Vector2d";

export class MyDeckElementAdjuster {
    private static instance: MyDeckElementAdjuster;

    private constructor() {}

    public static getInstance(): MyDeckElementAdjuster {
        if (!MyDeckElementAdjuster.instance) {
            MyDeckElementAdjuster.instance = new MyDeckElementAdjuster();
        }
        return MyDeckElementAdjuster.instance;
    }

    public adjustElementPosition(elementMesh: THREE.Mesh, widthPercent: number, positionX: number, positionY: number): void {
        const elementWidth = widthPercent * window.innerWidth;
        const elementHeight = elementWidth;
        const newPositionX = positionX * window.innerWidth;
        const newPositionY = positionY * window.innerHeight;

        elementMesh.geometry.dispose();
        elementMesh.geometry = new THREE.PlaneGeometry(elementWidth, elementHeight);
        elementMesh.position.set(newPositionX, newPositionY, 0);
    }

}
