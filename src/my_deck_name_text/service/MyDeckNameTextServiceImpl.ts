import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {MyDeckNameTextService} from './MyDeckNameTextService';
import {MyDeckNameText} from "../entity/MyDeckNameText";
import {MyDeckNameTextRepository} from "../repository/MyDeckNameTextRepository";
import {MyDeckNameTextRepositoryImpl} from "../repository/MyDeckNameTextRepositoryImpl";
import {MyDeckNameTextPosition} from "../../my_deck_name_text_position/entity/MyDeckNameTextPosition";
import {MyDeckNameTextPositionRepositoryImpl} from "../../my_deck_name_text_position/repository/MyDeckNameTextPositionRepositoryImpl";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class MyDeckNameTextServiceImpl implements MyDeckNameTextService {
    private static instance: MyDeckNameTextServiceImpl;
    private myDeckNameTextRepository: MyDeckNameTextRepositoryImpl;
    private myDeckNameTextPositionRepository: MyDeckNameTextPositionRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;

    private constructor(scene: THREE.Scene) {
        this.myDeckNameTextRepository = MyDeckNameTextRepositoryImpl.getInstance(scene);
        this.myDeckNameTextPositionRepository = MyDeckNameTextPositionRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(scene: THREE.Scene): MyDeckNameTextServiceImpl {
        if (!MyDeckNameTextServiceImpl.instance) {
            MyDeckNameTextServiceImpl.instance = new MyDeckNameTextServiceImpl(scene);
        }
        return MyDeckNameTextServiceImpl.instance;
    }

    public async createMyDeckNameTextWithPosition(deckId: number, deckName: string): Promise<THREE.Group | null> {
        const textGroup = new THREE.Group();
        try {
            const existingPosition = this.getMyDeckNameTextPosition(deckId);
            if (existingPosition == null) {
                const newPosition = this.myDeckNameTextPosition(deckId);
                console.log(`[DEBUG] Deck ${deckId}: Position X=${newPosition.position.getX()}, Y=${newPosition.position.getY()}`);
                this.saveMyDeckNameTextPosition(deckId, newPosition);

                const newDeckNameText = await this.createMyDeckNameText(deckId, deckName, newPosition.position);
                textGroup.add(newDeckNameText.mesh);

            } else {
                const existingDeckNameText = this.getMyDeckNameTextByDeckId(deckId);
                if (existingDeckNameText == null) {
                    const newDeckNameText = await this.createMyDeckNameText(deckId, deckName, existingPosition.position);
                    textGroup.add(newDeckNameText.mesh);

                } else {
                    const positionX = existingPosition.getX() * window.innerWidth;
                    const positionY = existingPosition.getY() * window.innerHeight;
                    const existingTextMesh = existingDeckNameText.getMesh();

                    existingTextMesh.position.set(positionX, positionY, 0);
                    textGroup.add(existingTextMesh);
                }
            }

        } catch (error) {
            console.error('Error creating my deck button with position:', error);
            return null;
        }
        return textGroup;
    }

    private async createMyDeckNameText(deckId: number, deckName: string, position: Vector2d): Promise<MyDeckNameText> {
        return await this.myDeckNameTextRepository.createMyDeckNameText(deckId, deckName, position);
    }

    private myDeckNameTextPosition(deckId: number): MyDeckNameTextPosition {
        return this.myDeckNameTextPositionRepository.addMyDeckNameTextPosition(deckId);
    }

    private saveMyDeckNameTextPosition(deckId: number, position: MyDeckNameTextPosition): void {
        this.myDeckNameTextPositionRepository.save(deckId, position);
    }

    public adjustMyDeckNameTextPosition(): void {
        const nameTextList = this.myDeckNameTextRepository.findAll();
        const Position = this.myDeckNameTextPositionRepository.findAll();

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        console.log('nameTextList:', nameTextList);
        console.log('nameTextPosition:', Position);

        for (const text of nameTextList) {
            const textMesh = text.getMesh();
            const textId = text.id;
            console.log(`Name Text ID: ${text.id}`);
            const initialPosition = this.myDeckNameTextPositionRepository.findById(textId);
            console.log(`InitialPosition: ${initialPosition}`);

            if (!initialPosition) {
                console.error(`No position found for text id: ${textId}`);
                continue;
            }

            const textWidth = (text.width / 1800) * window.innerWidth;
            const textHeight = textWidth * (text.height / text.width);

            const newPositionX = initialPosition.position.getX() * window.innerWidth;
            const newPositionY = initialPosition.position.getY() * window.innerHeight;
            console.log(`text ${textId}:`, {
                initialPosition: initialPosition.position,
                newPositionX,
                newPositionY,
            });

            textMesh.geometry.dispose();
            textMesh.geometry = new THREE.PlaneGeometry(textWidth, textHeight);
            textMesh.position.set(newPositionX, newPositionY, 0);

            const scrollArea = this.getScrollArea();
            if (scrollArea) {
                scrollArea.width = 0.203 * windowWidth;
                scrollArea.height = 0.46 * windowHeight;
                scrollArea.position.set(-0.381 * window.innerWidth, -0.035 * window.innerHeight);
                const clippingPlanes = this.clippingMaskManager.setClippingPlanes(scrollArea);
                this.applyClippingPlanesToMesh(textMesh, clippingPlanes);
            }
        }

    }

    public getMyDeckNameTextByDeckId(deckId: number): MyDeckNameText | null {
        return this.myDeckNameTextRepository.findNameTextByDeckId(deckId);
    }

    public getAllMyDeckNameText(): MyDeckNameText[] {
        return this.myDeckNameTextRepository.findAll();
    }

    public getDeckNameTextIdByDeckId(deckId: number): number | null {
        return this.myDeckNameTextRepository.findNameTextIdByDeckId(deckId);
    }

    public getAllDeckNameTextIdList(): number[] {
        return this.myDeckNameTextRepository.findAllNameTextIdList();
    }

    public deleteDeckNameTextByDeckId(deckId: number): void {
        this.myDeckNameTextRepository.deleteTextByDeckId(deckId);
    }

    private getMyDeckNameTextPosition(deckId: number): MyDeckNameTextPosition | null {
        return this.myDeckNameTextPositionRepository.findPositionByDeckId(deckId);
    }

    public deleteAllDeckNameText(): void {
        this.myDeckNameTextRepository.deleteAll();
    }

    public saveMyDeckTextGroup(): void {
        this.myDeckNameTextRepository.saveTextGroup();
    }

    public getMyDeckTextGroups(): THREE.Group {
        return this.myDeckNameTextRepository.findTextGroup();
    }

    public resetMyDeckTextGroups(): void {
        this.myDeckNameTextRepository.resetTextGroups();
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(3, 0);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

    public applyClippingMaskToDeckNameText(): void {
        const textGroup = this.getMyDeckTextGroups();
        const scrollArea = this.getScrollArea();
        let clippingPlanes: THREE.Plane[] = [];

        if (scrollArea) {
            clippingPlanes = this.clippingMaskManager.setClippingPlanes(scrollArea);
            textGroup.children.forEach((textObject) => {
                if (textObject instanceof THREE.Mesh) {
                    this.applyClippingPlanesToMesh(textObject, clippingPlanes);
                } else {
                    console.warn("[WARN] Skipping non-mesh object in textGroup:", textObject);
                }
            });
        }
    }


}
