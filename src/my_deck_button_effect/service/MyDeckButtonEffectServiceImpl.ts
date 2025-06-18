import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {MyDeckButtonEffectService} from './MyDeckButtonEffectService';
import {MyDeckButtonEffect} from "../entity/MyDeckButtonEffect";

import {MyDeckButtonEffectRepository} from "../repository/MyDeckButtonEffectRepository";
import {MyDeckButtonEffectRepositoryImpl} from "../repository/MyDeckButtonEffectRepositoryImpl";

import {MyDeckButtonPosition} from "../../my_deck_button_position/entity/MyDeckButtonPosition";
import {MyDeckButtonPositionRepositoryImpl} from "../../my_deck_button_position/repository/MyDeckButtonPositionRepositoryImpl";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";

import {ButtonEffectManager} from "../../my_deck_button_manager/ButtonEffectManager";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class MyDeckButtonEffectServiceImpl implements MyDeckButtonEffectService {
    private static instance: MyDeckButtonEffectServiceImpl;
    private myDeckButtonPositionRepository: MyDeckButtonPositionRepositoryImpl;
    private myDeckButtonEffectRepository: MyDeckButtonEffectRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;

    private buttonEffectManger: ButtonEffectManager;
    private clippingMaskManager: ClippingMaskManager;

    private constructor(myDeckButtonEffectRepository: MyDeckButtonEffectRepository) {
        this.myDeckButtonEffectRepository = MyDeckButtonEffectRepositoryImpl.getInstance();
        this.myDeckButtonPositionRepository = MyDeckButtonPositionRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();

        this.buttonEffectManger = ButtonEffectManager.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(): MyDeckButtonEffectServiceImpl {
        if (!MyDeckButtonEffectServiceImpl.instance) {
            const repository = MyDeckButtonEffectRepositoryImpl.getInstance();
            MyDeckButtonEffectServiceImpl.instance = new MyDeckButtonEffectServiceImpl(repository);
        }
        return MyDeckButtonEffectServiceImpl.instance;
    }

    public async createDeckButtonEffectWithPosition(deckId: number): Promise<THREE.Group | null> {
        const buttonGroup = new THREE.Group();
        try {
            const position = this.findMyDeckButtonPosition(deckId);

            if (!position) {
                console.error(`Position not found for deckId: ${deckId}`);
                return null;
            }
            console.log(`[DEBUG] Effect ${deckId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);

            const existingButtonEffect = this.getMyDeckButtonEffectByDeckId(deckId);
            if (existingButtonEffect) {
                const positionX = position.getX() * window.innerWidth;
                const positionY = position.getY() * window.innerHeight;
                const existingEffectMesh = existingButtonEffect.getMesh();

                existingEffectMesh.position.set(positionX, positionY, 0);
                buttonGroup.add(existingEffectMesh);

            } else {
                const deckButtonEffect = await this.createMyDeckButtonEffect(deckId, position.position);
                buttonGroup.add(deckButtonEffect.mesh);
            }

        } catch (error) {
            console.log('Error creating button effect with position:', error);
            return null;
        }
        return buttonGroup;
    }

    private findMyDeckButtonPosition(deckId: number): MyDeckButtonPosition | null {
        return this.myDeckButtonPositionRepository.findPositionByDeckId(deckId);
    }

    private async createMyDeckButtonEffect(deckId: number, position: Vector2d): Promise<MyDeckButtonEffect>{
        return await this.myDeckButtonEffectRepository.createMyDeckButtonEffect(deckId, position);
    }

    public adjustMyDeckButtonEffectPosition(): void {
        const positionRepository = this.myDeckButtonPositionRepository
        const buttonEffectRepository = this.myDeckButtonEffectRepository

        const buttonEffectList = buttonEffectRepository.findAll();
        const buttonPosition = positionRepository.findAll();

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        console.log('buttonEffectList:', buttonEffectList);
        console.log('buttonPosition:', buttonPosition);

        for (const buttonEffect of buttonEffectList) {
            const buttonEffectMesh = buttonEffect.getMesh();
            const buttonEffectId = buttonEffect.id;
            const initialPosition = positionRepository.findById(buttonEffectId);

            if (!initialPosition) {
                console.error(`No position found for button id: ${buttonEffectId}`);
                continue;
            }

            const buttonWidth = 0.18 * window.innerWidth;
            const buttonHeight = buttonWidth * (240/1040);

            const newPositionX = initialPosition.position.getX() * window.innerWidth;
            const newPositionY = initialPosition.position.getY() * window.innerHeight;
            console.log(`Button ${buttonEffectId}:`, {
                initialPosition: initialPosition.position,
                newPositionX,
                newPositionY,
            });

            buttonEffectMesh.geometry.dispose();
            buttonEffectMesh.geometry = new THREE.PlaneGeometry(buttonWidth, buttonHeight);

            buttonEffectMesh.position.set(newPositionX, newPositionY, 0);

            const scrollArea = this.getScrollArea();
            if (scrollArea) {
                scrollArea.width = 0.203 * windowWidth;
                scrollArea.height = 0.46 * windowHeight;
                scrollArea.position.set(-0.381 * window.innerWidth, -0.035 * window.innerHeight);
                const clippingPlanes = this.clippingMaskManager.setClippingPlanes(2, scrollArea);
                this.applyClippingPlanesToMesh(buttonEffectMesh, clippingPlanes);
            }
        }

    }

    public initializeDeckButtonEffect(): void {
        this.buttonEffectManger.initializeEffectState();
    }

    public resetEffectVisibility(): void {
        this.buttonEffectManger.resetVisibility();
    }

    public getMyDeckButtonEffectByDeckId(deckId: number): MyDeckButtonEffect | null {
        return this.myDeckButtonEffectRepository.findEffectByDeckId(deckId);
    }

    public getAllMyButtonEffect(): MyDeckButtonEffect[] {
        return this.myDeckButtonEffectRepository.findAll();
    }

    public getDeckButtonEffectIdByDeckId(deckId: number): number | null {
        return this.myDeckButtonEffectRepository.findEffectIdByDeckId(deckId);
    }

    public getAllDeckButtonEffectId(): number[] {
        return this.myDeckButtonEffectRepository.findAllEffectIds();
    }

    public getMyDeckButtonEffectGroups(): THREE.Group {
        return this.myDeckButtonEffectRepository.findAllEffectGroups();
    }

    public resetMyDeckButtonEffectGroups(): void {
        this.myDeckButtonEffectRepository.resetEffectGroups();
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(3, 0);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

    public applyClippingMaskToDeckButtonEffects(): void {
        const deckButtonEffectGroup = this.getMyDeckButtonEffectGroups();
        const scrollArea = this.getScrollArea();
        let clippingPlanes: THREE.Plane[] = [];

        if (scrollArea) {
            clippingPlanes = this.clippingMaskManager.setClippingPlanes(2, scrollArea);
            deckButtonEffectGroup.children.forEach((effectObject) => {
                if (effectObject instanceof THREE.Mesh) {
                    this.applyClippingPlanesToMesh(effectObject, clippingPlanes);
                } else {
                    console.warn("[WARN] Skipping non-mesh object in effectGroup:", effectObject);
                }
            });
        }
    }

}
