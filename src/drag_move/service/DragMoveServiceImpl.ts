import * as THREE from 'three';

import {DragMoveService} from './DragMoveService';
import {DragMoveRepositoryImpl} from "../repository/DragMoveRepositoryImpl";
import {DragMoveRepository} from "../repository/DragMoveRepository";
import {BattleFieldCardScene} from "../../battle_field_card_scene/entity/BattleFieldCardScene";
import {NeonBorderRepository} from "../../neon_border/repository/NeonBorderRepository";

import {NeonBorderLineSceneRepository} from "../../neon_border_line_scene/repository/NeonBorderLineSceneRepository";
import {NeonBorderLinePositionRepository} from "../../neon_border_line_position/repository/NeonBorderLinePositionRepository";
import {NeonBorderRepositoryImpl} from "../../neon_border/repository/NeonBorderRepositoryImpl";
import {NeonBorderLineSceneRepositoryImpl} from "../../neon_border_line_scene/repository/NeonBorderLineSceneRepositoryImpl";
import {NeonBorderLinePositionRepositoryImpl} from "../../neon_border_line_position/repository/NeonBorderLinePositionRepositoryImpl";
import {NeonBorderSceneType} from "../../neon_border/entity/NeonBorderSceneType";
import {LeftClickedArea} from "../../left_click_detect/entity/LeftClickedArea";
import {NeonBorderType} from "../../neon_border/entity/NeonBorderType";

export class DragMoveServiceImpl implements DragMoveService {
    private static instance: DragMoveServiceImpl | null = null;

    private cardPositions = new Map<string, THREE.Vector3>();

    private raycaster: THREE.Raycaster;
    private plane: THREE.Plane;
    private offset: THREE.Vector3;
    private lastPosition: THREE.Vector3;
    private dragMoveRepository: DragMoveRepository;

    private neonBorderRepository: NeonBorderRepository;
    private neonBorderLineSceneRepository: NeonBorderLineSceneRepository;
    private neonBorderLinePositionRepository: NeonBorderLinePositionRepository;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.raycaster = new THREE.Raycaster();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1));
        this.offset = new THREE.Vector3();
        this.lastPosition = new THREE.Vector3();
        this.dragMoveRepository = DragMoveRepositoryImpl.getInstance();

        this.neonBorderRepository = NeonBorderRepositoryImpl.getInstance()
        this.neonBorderLineSceneRepository = NeonBorderLineSceneRepositoryImpl.getInstance()
        this.neonBorderLinePositionRepository = NeonBorderLinePositionRepositoryImpl.getInstance()
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): DragMoveServiceImpl {
        if (!DragMoveServiceImpl.instance) {
            DragMoveServiceImpl.instance = new DragMoveServiceImpl(camera, scene);
        }
        return DragMoveServiceImpl.instance;
    }

    onMouseMove(event: MouseEvent): void {
        const selectedObject = this.dragMoveRepository.getSelectedObject();
        if (!selectedObject) return;

        const cardScene = selectedObject as unknown as BattleFieldCardScene;
        const mesh = cardScene.getMesh();
        if (!mesh) return;

        const cardId = mesh.id.toString();
        const intersection = this.calculateMouseIntersection(event);

        if (!intersection) return;

        if (!this.cardPositions.has(cardId)) {
            this.initializeCardPosition(cardId, mesh, intersection);
        } else {
            this.updateCardPosition(cardId, mesh, intersection);
        }
    }

    private calculateMouseIntersection(event: MouseEvent): THREE.Vector3 | null {
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        this.raycaster.setFromCamera(mouse, this.camera);

        const intersection = new THREE.Vector3();
        if (this.raycaster.ray.intersectPlane(this.plane, intersection)) {
            return intersection;
        }

        return null;
    }

    private initializeCardPosition(cardId: string, mesh: THREE.Mesh, intersection: THREE.Vector3): void {
        this.offset.copy(intersection).sub(mesh.position);
        this.cardPositions.set(cardId, mesh.position.clone());
        console.log(`Initialized drag for card ${cardId} with offset: ${this.offset.toArray()}`);
    }

    private updateCardPosition(cardId: string, mesh: THREE.Mesh, intersection: THREE.Vector3): void {
        const newPosition = intersection.clone().sub(this.offset);
        const movement = newPosition.clone().sub(mesh.position);

        mesh.position.copy(newPosition);
        this.updateAttributeMarks(movement);

        this.cardPositions.set(cardId, newPosition.clone());
        console.log(`Updated card ${cardId} position to: ${newPosition.toArray()}`);

        const selectedObject = this.dragMoveRepository.getSelectedObject();
        const cardScene = selectedObject as unknown as BattleFieldCardScene;
        const cardSceneId = cardScene.getId();
        console.log(`cardSceneId: ${cardSceneId}`)

        if (cardSceneId !== undefined && cardSceneId !== null) {
            this.updateNeonBorderPosition(cardSceneId, movement);
        } else {
            console.warn(`Invalid cardSceneId: ${cardSceneId}`);
        }
    }

    private updateNeonBorderPosition(cardSceneId: number, movement: THREE.Vector3): void {
        // 해당 카드에 연결된 NeonBorder를 가져옴
        const neonBorder = this.neonBorderRepository.findByCardSceneIdWithPlacement(cardSceneId, NeonBorderSceneType.HAND, NeonBorderType.ALLY);
        if (!neonBorder) {
            console.warn(`No NeonBorder found for card scene ID: ${cardSceneId}`);
            return;
        }
        console.log(`Found NeonBorder for card scene ID: ${cardSceneId}`, neonBorder);

        // NeonBorder와 연결된 라인의 위치를 이동
        neonBorder.getNeonBorderLineSceneIdList().forEach((lineSceneId) => {
            const lineScene = this.neonBorderLineSceneRepository.findById(lineSceneId);
            if (lineScene) {
                const lineMesh = lineScene.getLine();
                if (lineMesh) {
                    lineMesh.position.add(movement);
                    // console.log(`Updated neon border line position to: ${lineMesh.position.toArray()}`);
                }
            }
        });

        // // NeonBorder의 위치 데이터도 이동
        // neonBorder.getPositionIds().forEach((positionId) => {
        //     const position = this.neonBorderLinePositionRepository.findById(positionId);
        //     if (position) {
        //         position.getVector().add(new THREE.Vector2(movement.x, movement.y));
        //         console.log(`Updated neon border position to: ${position.getVector().toArray()}`);
        //     }
        // });
    }

    private updateAttributeMarks(movement: THREE.Vector3): void {
        this.dragMoveRepository.getSelectedGroup().forEach((obj) => {
            const attributeMesh = obj.getMesh();
            if (attributeMesh) {
                attributeMesh.position.add(movement);
                // console.log(`Updated attribute mark position to: ${attributeMesh.position.toArray()}`);
            }
        });
    }

    getLeftClickedArea(): LeftClickedArea | null {
        return this.dragMoveRepository.getSelectedArea()
    }
}
