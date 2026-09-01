import * as THREE from 'three';
import { IdGenerator } from "../../../../../common/id_generator/IdGenerator";

export class YourFieldArea {
    id: number;
    xPos: number;
    yPos: number;
    width: number;
    height: number;
    area!: THREE.Mesh;

    constructor(xPos: number, width: number, height: number) {
        this.id = Date.now();  // 예시로 Date.now()를 ID로 사용 (더 나은 ID 생성 방식이 필요하면 IdGenerator 등을 사용할 수 있음)
        this.xPos = xPos;
        this.yPos = -(window.innerHeight / 2) + (0.024 * 3 + 0.11 * 2.5) * window.innerHeight;
        this.width = width;
        this.height = height;
    }

    setArea(fieldArea: THREE.Mesh): void {
        this.area = fieldArea;
        this.area.position.set(this.xPos, this.yPos, 0);
        this.area.renderOrder = 1;

        // userData 설정
        this.area.userData = {
            xPos: this.xPos,
            yPos: this.yPos,
            width: this.width,
            height: this.height
        };
    }

    getArea(): THREE.Mesh {
        return this.area;
    }

    getUserData() {
        return this.area.userData;
    }
}