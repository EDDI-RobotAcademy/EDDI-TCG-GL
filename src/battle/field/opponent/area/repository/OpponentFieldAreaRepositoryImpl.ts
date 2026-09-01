import * as THREE from 'three';

import {OpponentFieldArea} from "../entity/OpponentFieldArea";
import {OpponentFieldAreaRepository} from "./OpponentFieldAreaRepository";


export class OpponentFieldAreaRepositoryImpl implements OpponentFieldAreaRepository {
    private static instance: OpponentFieldAreaRepositoryImpl;
    private opponentFieldArea: OpponentFieldArea | null = null;  // 하나의 엔티티만 저장

    private constructor() {}

    static getInstance(): OpponentFieldAreaRepositoryImpl {
        if (!this.instance) {
            this.instance = new OpponentFieldAreaRepositoryImpl();
        }
        return this.instance;
    }

    // 엔티티 저장
    save(entity: OpponentFieldArea): void {
        this.opponentFieldArea = entity; // 단일 엔티티 저장
    }

    // ID로 엔티티 조회
    findById(id: number): OpponentFieldArea | null {
        return this.opponentFieldArea && this.opponentFieldArea.id === id ? this.opponentFieldArea : null;
    }

    // ID로 엔티티 삭제
    deleteById(id: number): void {
        if (this.opponentFieldArea && this.opponentFieldArea.id === id) {
            this.opponentFieldArea = null; // 해당 엔티티 삭제
        }
    }

    createOpponentFieldArea(xPos: number, yPos: number, width: number, height: number): OpponentFieldArea {
        const opponentFieldArea = new OpponentFieldArea(xPos, width, height);

        // geometry와 material 설정
        const geometry = new THREE.PlaneGeometry(opponentFieldArea.width, opponentFieldArea.height);
        const material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            opacity: 0.1,
            transparent: true,
        });

        // Mesh 생성
        const fieldAreaMesh = new THREE.Mesh(geometry, material);

        // setArea 메서드를 사용하여 area 설정
        opponentFieldArea.setArea(fieldAreaMesh);
        this.save(opponentFieldArea)

        return opponentFieldArea
    }

    getOpponentFieldArea(): OpponentFieldArea | null {
        return this.opponentFieldArea;
    }
}
