import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";

import {MyDeckNumberOfSelectedCardsService} from "./MyDeckNumberOfSelectedCardsService";
import {MyDeckNumberOfSelectedCards} from "../entity/MyDeckNumberOfSelectedCards";
import {MyDeckNumberOfSelectedCardsRepositoryImpl} from "../repository/MyDeckNumberOfSelectedCardsRepositoryImpl";
import {MyDeckNumberOfSelectedCardsPositionRepositoryImpl} from "../../my_deck_number_of_selected_cards_position/repository/MyDeckNumberOfSelectedCardsPositionRepositoryImpl";
import {MyDeckNumberOfSelectedCardsPosition} from "../../my_deck_number_of_selected_cards_position/entity/MyDeckNumberOfSelectedCardsPosition";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";

import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";
import {CardCountManager} from "../../my_deck_card_manager/CardCountManager";

export class MyDeckNumberOfSelectedCardsServiceImpl implements MyDeckNumberOfSelectedCardsService {
    private static instance: MyDeckNumberOfSelectedCardsServiceImpl;
    private myDeckNumberOfSelectedCardsRepository: MyDeckNumberOfSelectedCardsRepositoryImpl;
    private myDeckNumberOfSelectedCardsPositionRepository: MyDeckNumberOfSelectedCardsPositionRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;
    private cardCountManager: CardCountManager;

    private constructor(scene: THREE.Scene) {
        this.myDeckNumberOfSelectedCardsRepository = MyDeckNumberOfSelectedCardsRepositoryImpl.getInstance(scene);
        this.myDeckNumberOfSelectedCardsPositionRepository = MyDeckNumberOfSelectedCardsPositionRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
        this.cardCountManager = CardCountManager.getInstance();
    }

    public static getInstance(scene: THREE.Scene): MyDeckNumberOfSelectedCardsServiceImpl {
        if (!MyDeckNumberOfSelectedCardsServiceImpl.instance) {
            MyDeckNumberOfSelectedCardsServiceImpl.instance = new MyDeckNumberOfSelectedCardsServiceImpl(scene);
        }
        return MyDeckNumberOfSelectedCardsServiceImpl.instance;
    }

    public async createMyDeckNumberOfSelectedCardsWithPosition(deckId: number, cardId: number, cardCount: number): Promise<THREE.Group | null> {
        const numberGroup = new THREE.Group();
        try {
            const existingPosition = this.getPositionByDeckIdAndCardId(deckId, cardId);
            if (existingPosition == null) {
                const position = this.myDeckNumberOfSelectedCardsPosition(deckId, cardId);
                console.log(`%c [New Number] CardId ${cardId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`, 'color: #FE2EF7; font-weight: bold;');

                const myDeckNumberOfCards = await this.createMyDeckNumberOfSelectedCards(deckId, cardId, cardCount, position.position);
                numberGroup.add(myDeckNumberOfCards.getMesh());

            } else {
                const existingNumberMesh = this.getNumberMeshByDeckIdAndCardId(deckId, cardId);
                if (existingNumberMesh == null) {
                    const myDeckNumberOfCards = await this.createMyDeckNumberOfSelectedCards(deckId, cardId, cardCount, existingPosition.position);
                    numberGroup.add(myDeckNumberOfCards.getMesh());
                    console.log(`%c [New Number-position 존재] DeckId: ${deckId}, CardId: ${cardId}`, 'color: #FE2EF7; font-weight: bold;');

                } else {
                    console.log(`%c [Number 존재] DeckId: ${deckId}, CardId: ${cardId}`, 'color: #FE2EF7; font-weight: bold;');
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

    public adjustMyDeckNumberOfSelectedCardsPosition(): void {
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
                console.log(`[DEBUG] (adjust) My Deck Number Of Selected Cards ID: ${numberId}`);
                const numberMesh = this.getNumberByNumberId(numberId);
                if (!numberMesh) {
                    console.warn(`[WARN] numberMesh with Number ID ${numberId} not found`);
                    continue;
                }

                // To-do: position 을 number ID 로 가져오면 안 됨. (scene 에서 삭제 후 다시 그릴 때 number 객체 고유 ID 달라지기 때문)
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
                    scrollArea.width = 0.202 * windowWidth;
                    scrollArea.height = 0.61 * windowHeight;
                    scrollArea.position.set(0.38 * window.innerWidth, -0.024 * window.innerHeight);
                    const clippingPlanes = this.clippingMaskManager.setClippingPlanes(scrollArea);
                    this.applyClippingPlanesToMesh(numberMesh, clippingPlanes);
                }
            }
        }
    }

    private async createMyDeckNumberOfSelectedCards(deckId: number, cardId: number, cardCount: number, position: Vector2d): Promise<MyDeckNumberOfSelectedCards> {
        return await this.myDeckNumberOfSelectedCardsRepository.createMyDeckNumberOfSelectedCards(deckId, cardId, cardCount, position);
    }

    private myDeckNumberOfSelectedCardsPosition(deckId: number, cardId: number): MyDeckNumberOfSelectedCardsPosition {
        return this.myDeckNumberOfSelectedCardsPositionRepository.addMyDeckNumberOfSelectedCardsPosition(deckId, cardId);
    }

    public getAllDeckIdList(): number[] {
        return this.myDeckNumberOfSelectedCardsRepository.findDeckIdList();
    }

    public getNumberIdListByDeckId(deckId: number): number[] {
        return this.myDeckNumberOfSelectedCardsRepository.findNumberIdListByDeckId(deckId);
    }

    private getNumberByNumberId(numberId: number): THREE.Mesh | null {
        const number = this.myDeckNumberOfSelectedCardsRepository.findNumberById(numberId);
        if (!number) {
            console.warn(`[WARN] My Deck Number Of Selected Cards with Unique ID ${numberId} not found`);
            return null;
        }
        const numberMesh = number.getMesh();
        return numberMesh;
    }

    private getPositionByNumberId(numberId: number): MyDeckNumberOfSelectedCardsPosition | null {
        return this.myDeckNumberOfSelectedCardsPositionRepository.findPositionByPositionId(numberId);
    }

    private getNumberMeshByDeckIdAndCardId(deckId: number, cardId: number): THREE.Mesh | null {
        const numberMesh = this.myDeckNumberOfSelectedCardsRepository.findNumberByDeckIdAndCardId(deckId, cardId);
        if (!numberMesh) {
            console.warn(`[WARN] Number with Deck ID: ${deckId}, Card ID ${cardId} not found`);
            return null;
        }
        return numberMesh.getMesh();
    }

    private getNumberIdByDeckIdAndCardId(deckId: number, cardId: number): number | null {
        const numberId = this.myDeckNumberOfSelectedCardsRepository.findNumberIdByDeckIdAndCardId(deckId, cardId);
        if (!numberId) {
            console.warn(`[WARN] My Deck Number Of Cards ID ${numberId} not found`);
            return null;
        }
        return numberId;
    }

    private getPositionByDeckIdAndCardId(deckId: number, cardId: number): MyDeckNumberOfSelectedCardsPosition | null {
        const numberPosition = this.myDeckNumberOfSelectedCardsPositionRepository.findPositionByDeckIdAndCardId(deckId, cardId);
        if (!numberPosition) {
            console.warn(`[WARN] My Deck Number Of Cards Position not found`);
        }
        return numberPosition;
    }

    private getCurrentClickDeckButton(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

    public saveNumberGroup(deckId: number): void {
        this.myDeckNumberOfSelectedCardsRepository.saveNumberGroupByDeckId(deckId);
    }

    public getNumberGroupByDeckId(deckId: number): THREE.Group {
        return this.myDeckNumberOfSelectedCardsRepository.findNumberGroupByDeckId(deckId);
    }

    public resetNumberGroup(): void {
        this.myDeckNumberOfSelectedCardsRepository.resetNumberGroup();
    }

    public getNumberListByDeckId(deckId: number): MyDeckNumberOfSelectedCards[] {
        const numberList = this.myDeckNumberOfSelectedCardsRepository.findNumberListByDeckId(deckId);
        if (!numberList) {
            return [];
        }
        return numberList;
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(3, 2);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

    public initializeNumberVisibility(): void {
        const deckIdList = this.getAllDeckIdList();
        const sortedDeckIdList = [...deckIdList].sort((a, b) => a - b);
        const firstDeckId = sortedDeckIdList[0];

        deckIdList.forEach((deckId, index) => {
            const numberList = this.getNumberListByDeckId(deckId);
            if (deckId === firstDeckId) {
                numberList.forEach((number) => number.setVisibility(true));
            } else {
                numberList.forEach((number) => number.setVisibility(false));
            }
        });
    }

    public applyClippingMaskToNumber(): void {
        const deckIdList = this.getAllDeckIdList();
        const scrollArea = this.getScrollArea();
        let clippingPlanes: THREE.Plane[] = [];

        if (scrollArea) {
            clippingPlanes = this.clippingMaskManager.setClippingPlanes(scrollArea);
            deckIdList.forEach((deckId) => {
                const numberGroup = this.getNumberGroupByDeckId(deckId);
                numberGroup.children.forEach((numberObject) => {
                    if (numberObject instanceof THREE.Mesh) {
                        this.applyClippingPlanesToMesh(numberObject, clippingPlanes);
                    } else {
                        console.warn("[WARN] Skipping non-mesh object in numberGroup:", numberObject);
                    }
                });
            });
        }
    }

}
