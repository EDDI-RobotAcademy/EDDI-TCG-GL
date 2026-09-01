import * as THREE from 'three';

import { YourFieldAreaRepository } from './YourFieldAreaRepository';
import {YourFieldArea} from "../entity/YourFieldArea";


export class YourFieldAreaRepositoryImpl implements YourFieldAreaRepository {
    private static instance: YourFieldAreaRepositoryImpl;
    private yourFieldArea: YourFieldArea | null = null;  // 하나의 엔티티만 저장

    private constructor() {}

    static getInstance(): YourFieldAreaRepositoryImpl {
        if (!this.instance) {
            this.instance = new YourFieldAreaRepositoryImpl();
        }
        return this.instance;
    }

    // 엔티티 저장
    save(entity: YourFieldArea): void {
        this.yourFieldArea = entity; // 단일 엔티티 저장
    }

    // ID로 엔티티 조회
    findById(id: number): YourFieldArea | null {
        return this.yourFieldArea && this.yourFieldArea.id === id ? this.yourFieldArea : null;
    }

    // ID로 엔티티 삭제
    deleteById(id: number): void {
        if (this.yourFieldArea && this.yourFieldArea.id === id) {
            this.yourFieldArea = null; // 해당 엔티티 삭제
        }
    }

    createYourFieldArea(xPos: number, yPos: number, width: number, height: number): YourFieldArea {
        const yourFieldArea = new YourFieldArea(xPos, width, height);

        // geometry와 material 설정
        const geometry = new THREE.PlaneGeometry(yourFieldArea.width, yourFieldArea.height);
        const material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            opacity: 0.1,
            transparent: true,
        });

        // Mesh 생성
        const fieldAreaMesh = new THREE.Mesh(geometry, material);

        // setArea 메서드를 사용하여 area 설정
        yourFieldArea.setArea(fieldAreaMesh);
        this.save(yourFieldArea)

        return yourFieldArea
    }

    getYourFieldArea(): YourFieldArea | null {
        return this.yourFieldArea;
    }
}
