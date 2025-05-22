import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {MyDeckCardNameService} from "./MyDeckCardNameService";
import {MyDeckCardName} from "../../my_deck_card_name/entity/MyDeckCardName";
import {MyDeckCardNameRepositoryImpl} from "../../my_deck_card_name/repository/MyDeckCardNameRepositoryImpl";
import {MyDeckCardNamePositionRepositoryImpl} from "../../my_deck_card_name_position/repository/MyDeckCardNamePositionRepositoryImpl";
import {MyDeckCardNamePosition} from "../../my_deck_card_name_position/entity/MyDeckCardNamePosition";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class MyDeckCardNameServiceImpl implements MyDeckCardNameService {
    private static instance: MyDeckCardNameServiceImpl;
    private myDeckCardNameRepository: MyDeckCardNameRepositoryImpl;
    private myDeckCardNamePositionRepository: MyDeckCardNamePositionRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;

    private constructor() {
        this.myDeckCardNameRepository = MyDeckCardNameRepositoryImpl.getInstance();
        this.myDeckCardNamePositionRepository = MyDeckCardNamePositionRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(): MyDeckCardNameServiceImpl {
        if (!MyDeckCardNameServiceImpl.instance) {
            MyDeckCardNameServiceImpl.instance = new MyDeckCardNameServiceImpl();
        }
        return MyDeckCardNameServiceImpl.instance;
    }

    public async createMyDeckCardNameWithPosition(deckId: number, cardIdList: number[]): Promise<THREE.Group | null> {
        const cardNameGroup = new THREE.Group();
        try {
            await Promise.all(
                cardIdList.map(async (cardId, index) => {
                    const cardNameId = this.getCardNameIdByDeckIdAndCardId(deckId, cardId);
                    if (cardNameId == null) {
                        const position = this.myMyDeckCardNamePosition(deckId, index);
                        console.log(`[Block] CardId ${cardId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);

                        const myDeckBlock = await this.createMyDeckCardName(deckId, cardId, position.position);
                        cardNameGroup.add(myDeckBlock.getMesh());

                    } else {
                        const existingPosition = this.getPositionByCardNameId(cardNameId);
                        const existingCardNameMesh = this.getCardNameMeshByDeckIdAndCardId(deckId, cardId);

                        if (existingPosition && existingCardNameMesh) {
                            const positionX = existingPosition.getX() * window.innerWidth;
                            const positionY = existingPosition.getY() * window.innerHeight;

                            existingCardNameMesh.position.set(positionX, positionY, 0);
                            cardNameGroup.add(existingCardNameMesh);
                        }
                    }

                })
            );
        } catch (error) {
            console.error(`[Error] Failed to create My Deck Card Name: ${error}`);
            return null;
        }
        return cardNameGroup;
    }

    public adjustMyDeckCardNamePosition(): void {
        const currentDeckButtonId = this.getCurrentClickDeckButton();
        if (currentDeckButtonId === null) {
            console.error("No deck button clicked");
            return;
        }

        const deckIdList = this.getAllDeckIdList();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        for (const deckId of deckIdList) {
            const cardNameIdList = this.getCardNameIdListByDeckId(deckId);
            console.log(`[DEBUG] (adjust) Processing deckId: ${deckId}`);

            for (const cardNameId of cardNameIdList) {
                console.log(`[DEBUG] (adjust) Block Unique ID: ${cardNameId}`);
                const cardName = this.getCardNameByCardNameId(cardNameId);
                if (!cardName) {
                    console.warn(`[WARN] cardName with Card Name Unique ID ${cardNameId} not found`);
                    continue;
                }
                const cardNameMesh = cardName.getMesh();

                const initialPosition = this.getPositionByCardNameId(cardNameId);
                console.log(`[DEBUG] (adjust) InitialPosition: ${initialPosition}`);
                if (!initialPosition) {
                    console.error(`[DEBUG] (adjust) No position found for card name id: ${cardNameId}`);
                    continue;
                }

                // 나중에 수정 필요
                const cardNameWidth = cardName.width;
                const cardNameHeight = cardName.height;

                const newPositionX = initialPosition.getX() * windowWidth;
                const newPositionY = initialPosition.getY() * windowHeight;
                console.log(`[DEBUG] (adjust) Card Name With Id ${cardNameId}:`, {
                    initialPosition: initialPosition,
                    newPositionX,
                    newPositionY,
                });

                cardNameMesh.geometry.dispose();
                cardNameMesh.geometry = new THREE.PlaneGeometry(cardNameWidth, cardNameHeight);
                cardNameMesh.position.set(newPositionX, newPositionY, 0);

                const scrollArea = this.getScrollArea();
                if (scrollArea) {
                    scrollArea.width = 0.202 * windowWidth;
                    scrollArea.height = 0.61 * windowHeight;
                    scrollArea.position.set(0.38 * window.innerWidth, -0.024 * window.innerHeight);
                    const clippingPlanes = this.clippingMaskManager.setClippingPlanes(3, scrollArea);
                    this.applyClippingPlanesToMesh(cardNameMesh, clippingPlanes);
                }

            }
        }
    }

    private async createMyDeckCardName(deckId: number, cardId: number, position: Vector2d): Promise<MyDeckCardName> {
        return await this.myDeckCardNameRepository.createMyDeckCardName(deckId, cardId, position);
    }

    private myMyDeckCardNamePosition(deckId: number, cardIndex: number): MyDeckCardNamePosition {
        return this.myDeckCardNamePositionRepository.addMyDeckCardNamePosition(deckId, cardIndex);
    }

    public getCurrentClickDeckButton(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

    public getAllDeckIdList(): number[] {
        return this.myDeckCardNameRepository.findDeckIdList();
    }

    public getCardNameIdListByDeckId(deckId: number): number[] {
        return this.myDeckCardNameRepository.findCardNameIdListByDeckId(deckId);
    }

    private getCardNameMeshByCardNameId(cardNameId: number): THREE.Mesh | null {
        const cardName = this.myDeckCardNameRepository.findCardNameById(cardNameId);
        if (!cardName) {
            console.warn(`[WARN] Card Name with Unique ID ${cardNameId} not found`);
            return null;
        }
        const cardNameMesh = cardName.getMesh();
        return cardNameMesh;
    }

    private getCardNameByCardNameId(cardNameId: number): MyDeckCardName | null {
        const cardName = this.myDeckCardNameRepository.findCardNameById(cardNameId);
        if (!cardName) {
            console.warn(`[WARN] Card Name with Unique ID ${cardNameId} not found`);
            return null;
        }
        return cardName;
    }

    private getPositionByCardNameId(cardNameId: number): MyDeckCardNamePosition | null {
        return this.myDeckCardNamePositionRepository.findPositionByPositionId(cardNameId);
    }

    private getCardNameMeshByDeckIdAndCardId(deckId: number, cardId: number): THREE.Mesh | null {
        const cardName = this.myDeckCardNameRepository.findCardNameByDeckIdAndCardId(deckId, cardId);
        if (!cardName) {
            console.warn(`[WARN] Card Name with Deck ID: ${deckId}, Card ID ${cardId} not found`);
            return null;
        }
        return cardName.getMesh();
    }

    private getCardNameIdByDeckIdAndCardId(deckId: number, cardId: number): number | null {
        const cardNameId = this.myDeckCardNameRepository.findCardNameIdByDeckIdAndCardId(deckId, cardId);
        if (!cardNameId) {
            console.warn(`[WARN] Card Name Id ${cardNameId} not found`);
            return null;
        }
        return cardNameId;
    }

    public saveCardNameGroup(deckId: number): void {
        this.myDeckCardNameRepository.saveCardNameGroupByDeckId(deckId);
    }

    public getCardNameGroupByDeckId(deckId: number): THREE.Group {
        return this.myDeckCardNameRepository.findCardNameGroupByDeckId(deckId);
    }

    public getCardNameListByDeckId(deckId: number): MyDeckCardName[] {
        const cardNameList = this.myDeckCardNameRepository.findCardNameListByDeckId(deckId);
        if (!cardNameList) {
            return [];
        }
        return cardNameList;
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(3, 2);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

    public resetCardNameGroup(): void {
        this.myDeckCardNameRepository.resetCardNameGroup();
    }

}
