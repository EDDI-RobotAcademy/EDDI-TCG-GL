import * as THREE from 'three';
import {MouseDropFieldRepository} from "./MouseDropRepository";
import {YourFieldAreaRepository} from "../../battle/field/your/area/repository/YourFieldAreaRepository";
import {YourFieldAreaRepositoryImpl} from "../../battle/field/your/area/repository/YourFieldAreaRepositoryImpl";
import {BattleFieldCardScene} from "../../battle_field_card_scene/entity/BattleFieldCardScene";

export class MouseDropFieldRepositoryImpl implements MouseDropFieldRepository {
    private static instance: MouseDropFieldRepositoryImpl | null = null;
    private yourFieldAreaRepository;

    constructor() {
        this.yourFieldAreaRepository = YourFieldAreaRepositoryImpl.getInstance();
    }

    public static getInstance(): MouseDropFieldRepositoryImpl {
        if (!MouseDropFieldRepositoryImpl.instance) {
            MouseDropFieldRepositoryImpl.instance = new MouseDropFieldRepositoryImpl();
        }
        return MouseDropFieldRepositoryImpl.instance;
    }

    public isYourFieldAreaDropped(object: THREE.Object3D, raycaster: THREE.Raycaster): boolean {
        // YourFieldArea를 가져옵니다.
        const yourFieldArea = this.yourFieldAreaRepository.getYourFieldArea();
        if (!yourFieldArea) {
            return false;  // YourFieldArea가 없으면 드롭된 곳이 아니라고 판단
        }

        // YourFieldArea의 메쉬를 가져옵니다.
        const yourFieldAreaMesh = yourFieldArea.getArea();

        // YourFieldArea와 드래그된 객체의 Bounding Box를 비교하여 교차 여부를 확인합니다.
        const yourFieldAreaBoundingBox = new THREE.Box3().setFromObject(yourFieldAreaMesh);

        // object가 BattleFieldCardScene 타입인지 확인 후 캐스팅
        if (!(object instanceof BattleFieldCardScene)) {
            console.error("Selected object is not an instance of BattleFieldCardScene.");
            return false;  // 객체가 BattleFieldCardScene이 아니면 처리하지 않음
        }

        const cardScene = object as BattleFieldCardScene; // 안전하게 타입 캐스팅
        const cardSceneMesh = cardScene.getMesh(); // BattleFieldCardScene에서 메쉬 가져오기

        if (!cardSceneMesh) {
            console.error("No mesh found in BattleFieldCardScene object.");
            return false;  // 메쉬가 없다면 드롭된 것이 아님
        }

        const objectBoundingBox = new THREE.Box3().setFromObject(cardSceneMesh);

        const intersects = yourFieldAreaBoundingBox.intersectsBox(objectBoundingBox); // 두 박스가 겹치는지 확인
        console.log(`isYourFieldAreaDropped() intersects: ${intersects}`);
        console.log(`isYourFieldAreaDropped() object Constructor name -> ${object.constructor.name}`);

        // 객체의 메쉬와 YourFieldArea의 메쉬가 물리적으로 겹치는지 확인
        const objectIntersects = yourFieldAreaBoundingBox.intersectsBox(objectBoundingBox);
        console.log(`isYourFieldAreaDropped() objectIntersects: ${objectIntersects}`);

        // 두 객체가 물리적으로 겹쳤을 때만 true 반환
        return intersects && objectIntersects;
    }
}
