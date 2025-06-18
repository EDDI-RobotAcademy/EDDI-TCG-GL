import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";
import {SelectedCardBlockEffectService} from "./SelectedCardBlockEffectService";
import {SelectedCardBlockEffect} from "../../selected_card_block_effect/entity/SelectedCardBlockEffect";
import {SelectedCardBlockEffectRepositoryImpl} from "../../selected_card_block_effect/repository/SelectedCardBlockEffectRepositoryImpl";

import {SelectedCardBlockEffectPosition} from "../../selected_card_block_effect_position/entity/SelectedCardBlockEffectPosition";
import {SelectedCardBlockEffectPositionRepositoryImpl} from "../../selected_card_block_effect_position/repository/SelectedCardBlockEffectPositionRepositoryImpl";

import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class SelectedCardBlockEffectServiceImpl implements SelectedCardBlockEffectService {
    private static instance: SelectedCardBlockEffectServiceImpl;
    private selectedCardBlockEffectRepository: SelectedCardBlockEffectRepositoryImpl;
    private selectedCardBlockEffectPositionRepository: SelectedCardBlockEffectPositionRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;

    private constructor() {
        this.selectedCardBlockEffectRepository = SelectedCardBlockEffectRepositoryImpl.getInstance();
        this.selectedCardBlockEffectPositionRepository = SelectedCardBlockEffectPositionRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(): SelectedCardBlockEffectServiceImpl {
        if (!SelectedCardBlockEffectServiceImpl.instance) {
            SelectedCardBlockEffectServiceImpl.instance = new SelectedCardBlockEffectServiceImpl();
        }
        return SelectedCardBlockEffectServiceImpl.instance;
    }

    public async createSelectedCardBlockEffectWithPosition(cardId: number): Promise<THREE.Group | null> {
        const effectGroup = new THREE.Group();

        try {
            const existingPosition = this.getPositionByCardId(cardId);
            const existingEffectMesh = this.getEffectMeshByCardId(cardId);

            if (existingPosition && existingEffectMesh) {
                const positionX = existingPosition.getX() * window.innerWidth;
                const positionY = existingPosition.getY() * window.innerHeight;

                existingEffectMesh.position.set(positionX, positionY, 0);
                effectGroup.add(existingEffectMesh);
            } else {
                const newPosition = this.makeSelectedCardBlockEffectPosition(cardId);
                console.log(`[DEBUG] Effect Position X=${newPosition.position.getX()}, Y=${newPosition.position.getY()}`);

                const selectedCardBlockEffect = await this.createSelectedCardBlockEffect(cardId, newPosition.position);
                effectGroup.add(selectedCardBlockEffect.getMesh());
            }
//             const position = this.makeSelectedCardBlockEffectPosition(cardId);
//             console.log(`[DEBUG] Effect Position X=${position.position.getX()}, Y=${position.position.getY()}`);
//
//             const selectedCardBlockEffect = await this.createSelectedCardBlockEffect(cardId, position.position);
//             effectGroup.add(selectedCardBlockEffect.getMesh());

        } catch (error) {
            console.error(`[Error] Failed to create Block Effect: ${error}`);
            return null;
        }
        return effectGroup;
    }

    public adjustSelectedCardBlockEffectPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const effectIdList = this.getAllEffectIdList();
        for (const effectId of effectIdList) {
            const effectMesh = this.getEffectMeshByEffectId(effectId);
            if (!effectMesh) {
                console.warn(`[WARN] Effect Mesh with effect ID ${effectId} not found`);
                continue;
            }

            const initialPosition = this.getPositionByEffectId(effectId);
            if (!initialPosition) {
                console.error(`[DEBUG] (adjust) No position found for effect id: ${effectId}`);
                continue;
            }
            console.log(`[DEBUG] (adjust) InitialPosition: ${initialPosition}`);

            const effectWidth = 0.235 * window.innerWidth;
            const effectHeight = 0.145 * window.innerHeight;

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;
            console.log(`[DEBUG] (adjust) Effect ${effectId}:`, {
                initialPosition: initialPosition,
                newPositionX,
                newPositionY,
            });

            effectMesh.geometry.dispose();
            effectMesh.geometry = new THREE.PlaneGeometry(effectWidth, effectHeight);
            effectMesh.position.set(newPositionX, newPositionY, 0);

            const sideScrollArea = this.getSideScrollArea();
            if (sideScrollArea) {
                const clippingPlanes = this.clippingMaskManager.setClippingPlanes(sideScrollArea);
                this.applyClippingPlanesToMesh(effectMesh, clippingPlanes);
            }
        }
    }

    private async createSelectedCardBlockEffect(cardId: number, position: Vector2d): Promise<SelectedCardBlockEffect> {
        return await this.selectedCardBlockEffectRepository.createSelectedCardBlockEffect(cardId, position);
    }

    private makeSelectedCardBlockEffectPosition(cardId: number): SelectedCardBlockEffectPosition {
        return this.selectedCardBlockEffectPositionRepository.addSelectedCardBlockEffectPosition(cardId);
    }

    public getEffectMeshByEffectId(effectId: number): THREE.Mesh | null {
        const effect = this.selectedCardBlockEffectRepository.findEffectByEffectId(effectId);
        if (!effect) {
            console.warn(`[WARN] Effect (ID: ${effectId}) not found`);
            return null;
        }
        const effectMesh = effect.getMesh();
        return effectMesh;
    }

    public getEffectMeshByCardId(cardId: number): THREE.Mesh | null {
        const effect = this.selectedCardBlockEffectRepository.findEffectByCardId(cardId);
        if (!effect) {
            console.warn(`[WARN] Effect (ID: ${cardId}) not found`);
            return null;
        }
        return effect.getMesh();
    }

    public getAllEffectIdList(): number[] {
        return this.selectedCardBlockEffectRepository.findEffectIdList();
    }

    public getPositionByEffectId(effectId: number): SelectedCardBlockEffectPosition | undefined {
        return this.selectedCardBlockEffectPositionRepository.findPositionById(effectId);
    }

    public getAllEffectCardId(): number[] {
        return this.selectedCardBlockEffectRepository.findEffectCardIdList();
    }

    public getAllEffectMesh(): SelectedCardBlockEffect[] {
        return this.selectedCardBlockEffectRepository.findAllEffects();
    }

    private getPositionByCardId(cardId: number): SelectedCardBlockEffectPosition | null {
        return this.selectedCardBlockEffectPositionRepository.findPositionByCardId(cardId);
    }

    public getEffectGroup(): THREE.Group {
        return this.selectedCardBlockEffectRepository.findAllEffectGroup();
    }

    public resetEffectGroup(): void {
        this.selectedCardBlockEffectRepository.resetEffectGroup();
    }

    private getSideScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(1, 0);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

}
