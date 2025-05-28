import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {MyDeckNumberOfCardsService} from "./MyDeckNumberOfCardsService";
import {MyDeckNumberOfCards} from "../entity/MyDeckNumberOfCards";
import {MyDeckNumberOfCardsRepositoryImpl} from "../repository/MyDeckNumberOfCardsRepositoryImpl";
import {MyDeckNumberOfCardsPositionRepositoryImpl} from "../../my_deck_number_of_cards_position/repository/MyDeckNumberOfCardsPositionRepositoryImpl";
import {MyDeckNumberOfCardsPosition} from "../../my_deck_number_of_cards_position/entity/MyDeckNumberOfCardsPosition";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class MyDeckNumberOfCardsServiceImpl implements MyDeckNumberOfCardsService {
    private static instance: MyDeckNumberOfCardsServiceImpl;
    private myDeckNumberOfCardsRepository: MyDeckNumberOfCardsRepositoryImpl;
    private myDeckNumberOfCardsPositionRepository: MyDeckNumberOfCardsPositionRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;

    private constructor() {
        this.myDeckNumberOfCardsRepository = MyDeckNumberOfCardsRepositoryImpl.getInstance();
        this.myDeckNumberOfCardsPositionRepository = MyDeckNumberOfCardsPositionRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(): MyDeckNumberOfCardsServiceImpl {
        if (!MyDeckNumberOfCardsServiceImpl.instance) {
            MyDeckNumberOfCardsServiceImpl.instance = new MyDeckNumberOfCardsServiceImpl();
        }
        return MyDeckNumberOfCardsServiceImpl.instance;
    }

    public async createMyDeckNumberOfCardsWithPosition(deckId: number, cardId: number, cardCount: number): Promise<THREE.Group | null> {
        const numberGroup = new THREE.Group();
        try {
            const numberId = this.getNumberIdByDeckIdAndCardId(deckId, cardId);
            if (numberId == null) {
                const position = this.myDeckNumberOfCardsPosition(deckId, cardId);
                console.log(`[Block] CardId ${cardId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);

                const myDeckNumberOfCards = await this.createMyDeckNumberOfCards(deckId, cardId, cardCount, position.position);
                numberGroup.add(myDeckNumberOfCards.getMesh());

            } else {
                const existingPosition = this.getPositionByNumberId(numberId);
                const existingNumberMesh = this.getNumberMeshByDeckIdAndCardId(deckId, cardId);

                if (existingPosition && existingNumberMesh) {
                    const positionX = existingPosition.getX() * window.innerWidth;
                    const positionY = existingPosition.getY() * window.innerHeight;

                    existingNumberMesh.position.set(positionX, positionY, 0);
                    numberGroup.add(existingNumberMesh);
                }
            }

        } catch (error) {
            console.error(`[Error] Failed to create My Deck Number of Cards: ${error}`);
            return null;
        }
        return numberGroup;
    }

    public adjustMyDeckNumberOfCardsPosition(): void {
        const currentDeckButtonId = this.getCurrentClickDeckButton();
        if (currentDeckButtonId === null) {
            console.error("No deck button clicked");
            return;
        }

        const deckIdList = this.getAllDeckIdList();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        for (const deckId of deckIdList) {
            const numberIdList = this.getNumberIdListByDeckId(deckId);
            console.log(`[DEBUG] (adjust) Processing deckId: ${deckId}`);

            for (const numberId of numberIdList) {
                console.log(`[DEBUG] (adjust) My Deck Number Of Cards ID: ${numberId}`);
                const numberMesh = this.getNumberByNumberId(numberId);
                if (!numberMesh) {
                    console.warn(`[WARN] numberMesh with Number ID ${numberId} not found`);
                    continue;
                }

                const initialPosition = this.getPositionByNumberId(numberId);
                console.log(`[DEBUG] (adjust) InitialPosition: ${initialPosition}`);

                if (!initialPosition) {
                    console.error(`[DEBUG] (adjust) No position found for number id: ${numberId}`);
                    continue;
                }

                const numberWidth = 0.013 * window.innerWidth;
                const numberHeight = numberWidth;

                const newPositionX = initialPosition.getX() * windowWidth;
                const newPositionY = initialPosition.getY() * windowHeight;
                console.log(`[DEBUG] (adjust) Number ${numberId}:`, {
                    initialPosition: initialPosition,
                    newPositionX,
                    newPositionY,
                });

                numberMesh.geometry.dispose();
                numberMesh.geometry = new THREE.PlaneGeometry(numberWidth, numberHeight);
                numberMesh.position.set(newPositionX, newPositionY, 0);

                const scrollArea = this.getScrollArea();
                if (scrollArea) {
                    scrollArea.width = 0.54 * windowWidth;
                    scrollArea.height = 0.745 * windowHeight;
                    scrollArea.position.set(0 * window.innerWidth, -0.125 * window.innerHeight);
                    const clippingPlanes = this.clippingMaskManager.setClippingPlanes(3, scrollArea);
                    this.applyClippingPlanesToMesh(numberMesh, clippingPlanes);
                }
            }
        }
    }

    private async createMyDeckNumberOfCards(deckId: number, cardId: number, cardCount: number, position: Vector2d): Promise<MyDeckNumberOfCards> {
        return await this.myDeckNumberOfCardsRepository.createMyDeckNumberOfCards(deckId, cardId, cardCount, position);
    }

    private myDeckNumberOfCardsPosition(deckId: number, cardId: number): MyDeckNumberOfCardsPosition {
        return this.myDeckNumberOfCardsPositionRepository.addMyDeckNumberOfCardsPosition(deckId, cardId);
    }

    public getAllDeckIdList(): number[] {
        return this.myDeckNumberOfCardsRepository.findDeckIdList();
    }

    public getNumberIdListByDeckId(deckId: number): number[] {
        return this.myDeckNumberOfCardsRepository.findNumberIdListByDeckId(deckId);
    }

    private getNumberByNumberId(numberId: number): THREE.Mesh | null {
        const number = this.myDeckNumberOfCardsRepository.findNumberById(numberId);
        if (!number) {
            console.warn(`[WARN] My Deck Number Of Cards with Unique ID ${numberId} not found`);
            return null;
        }
        const numberMesh = number.getMesh();
        return numberMesh;
    }

    private getPositionByNumberId(numberId: number): MyDeckNumberOfCardsPosition | null {
        return this.myDeckNumberOfCardsPositionRepository.findPositionByPositionId(numberId);
    }

    private getNumberMeshByDeckIdAndCardId(deckId: number, cardId: number): THREE.Mesh | null {
        const number = this.myDeckNumberOfCardsRepository.findNumberByDeckIdAndCardId(deckId, cardId);
        if (!number) {
            console.warn(`[WARN] Number with Deck ID: ${deckId}, Card ID ${cardId} not found`);
            return null;
        }
        return number.getMesh();
    }

    private getNumberIdByDeckIdAndCardId(deckId: number, cardId: number): number | null {
        const numberId = this.myDeckNumberOfCardsRepository.findNumberIdByDeckIdAndCardId(deckId, cardId);
        if (!numberId) {
            console.warn(`[WARN] My Deck Number Of Cards ID ${numberId} not found`);
            return null;
        }
        return numberId;
    }

    private getCurrentClickDeckButton(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

    public saveNumberGroup(deckId: number): void {
        this.myDeckNumberOfCardsRepository.saveNumberGroupByDeckId(deckId);
    }

    public getNumberGroupByDeckId(deckId: number): THREE.Group {
        return this.myDeckNumberOfCardsRepository.findNumberGroupByDeckId(deckId);
    }

    public resetNumberGroup(): void {
        this.myDeckNumberOfCardsRepository.resetNumberGroup();
    }

    public getNumberListByDeckId(deckId: number): MyDeckNumberOfCards[] {
        const numberList = this.myDeckNumberOfCardsRepository.findNumberListByDeckId(deckId);
        if (!numberList) {
            return [];
        }
        return numberList;
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(3, 1);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

}
