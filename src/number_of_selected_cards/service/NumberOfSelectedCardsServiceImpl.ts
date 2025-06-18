import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {NumberOfSelectedCardsService} from "./NumberOfSelectedCardsService";
import {NumberOfSelectedCards} from "../../number_of_selected_cards/entity/NumberOfSelectedCards";
import {NumberOfSelectedCardsRepositoryImpl} from "../../number_of_selected_cards/repository/NumberOfSelectedCardsRepositoryImpl";

import {NumberOfSelectedCardsPositionRepositoryImpl} from "../../number_of_selected_cards_position/repository/NumberOfSelectedCardsPositionRepositoryImpl";
import {NumberOfSelectedCardsPosition} from "../../number_of_selected_cards_position/entity/NumberOfSelectedCardsPosition";
import {SelectedCardBlockPositionRepositoryImpl} from "../../selected_card_block_position/repository/SelectedCardBlockPositionRepositoryImpl";
import {SelectedCardBlockPosition} from "../../selected_card_block_position/entity/SelectedCardBlockPosition";
import {MakeDeckScreenCardClickDetectRepositoryImpl} from "../../make_deck_screen_card_click_detect/repository/MakeDeckScreenCardClickDetectRepositoryImpl";
import {CardCountManager} from "../../make_deck_screen_card_manager/CardCountManager";

import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class NumberOfSelectedCardsServiceImpl implements NumberOfSelectedCardsService {
    private static instance: NumberOfSelectedCardsServiceImpl;
    private numberOfSelectedCardsRepository: NumberOfSelectedCardsRepositoryImpl;
    private numberOfSelectedCardsPositionRepository: NumberOfSelectedCardsPositionRepositoryImpl;
    private selectedCardBlockPositionRepository: SelectedCardBlockPositionRepositoryImpl;
    private makeDeckScreenCardClickDetectRepository: MakeDeckScreenCardClickDetectRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;
    private cardCountManager: CardCountManager;

    private constructor() {
        this.numberOfSelectedCardsRepository = NumberOfSelectedCardsRepositoryImpl.getInstance();
        this.numberOfSelectedCardsPositionRepository = NumberOfSelectedCardsPositionRepositoryImpl.getInstance();
        this.selectedCardBlockPositionRepository = SelectedCardBlockPositionRepositoryImpl.getInstance();
        this.makeDeckScreenCardClickDetectRepository = MakeDeckScreenCardClickDetectRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
        this.cardCountManager = CardCountManager.getInstance();

    }

    public static getInstance(): NumberOfSelectedCardsServiceImpl {
        if (!NumberOfSelectedCardsServiceImpl.instance) {
            NumberOfSelectedCardsServiceImpl.instance = new NumberOfSelectedCardsServiceImpl();
        }
        return NumberOfSelectedCardsServiceImpl.instance;
    }

    public async createNumberOfSelectedCardsWithPosition(cardId: number): Promise<THREE.Group | null> {
        const numberObjectGroup = new THREE.Group();

        try {
            const cardCount = this.getCardClickCount(cardId);
            console.log(`card count? ${cardCount}`);

            const existingPosition = this.getPositionByCardId(cardId);
            const existingNumberMesh = this.getNumberObjectMeshByCardId(cardId);
            if (existingPosition && existingNumberMesh) {
                const positionX = existingPosition.getX() * window.innerWidth;
                const positionY = existingPosition.getY() * window.innerHeight;

                existingNumberMesh.position.set(positionX, positionY, 0);
                console.log(`카드 ${cardId}의 Number position: ${positionY}`);
                numberObjectGroup.add(existingNumberMesh);

            } else {
                if (cardCount && cardCount >= 2) {
                    const position = this.numberOfSelectedCardsPosition(cardId);
                    console.log(`[DEBUG] number object CardId ${cardId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);

                    const numberObject = await this.createNumberOfSelectedCards(cardId, cardCount, position.position);
                    numberObjectGroup.add(numberObject.getMesh());
                }
            }

//                 const position = this.numberOfSelectedCardsPosition(cardId);
//                 console.log(`[DEBUG] number object CardId ${cardId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);
//
//                 const numberObject = await this.createNumberOfSelectedCards(cardId, cardCount, position.position);
//                 numberObjectGroup.add(numberObject.getMesh());

        } catch (error) {
            console.error(`[Error] Failed to create Number Object: ${error}`);
            return null;
        }
        return numberObjectGroup;
    }

    public adjustNumberOfSelectedCardsPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const multiSelectedCardIdList = this.getMultiSelectedCardIds();
        for (const cardId of multiSelectedCardIdList) {
            const numberObjectMesh = this.getNumberObjectMeshByCardId(cardId);
            if (!numberObjectMesh) {
                console.warn(`[WARN] Number Object Mesh with card ID ${cardId} not found`);
                continue;
            }

            const initialPosition = this.getPositionByCardId(cardId);
            if (!initialPosition) {
                console.error(`[DEBUG] (adjust) No position found for card id: ${cardId}`);
                continue;
            }
            console.log(`[DEBUG] (adjust) InitialPosition: ${initialPosition}`);

            const numberObjectWidth = 0.028 * window.innerWidth;
            const numberObjectHeight = 0.034 * window.innerHeight;

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;
            console.log(`[DEBUG] (adjust) Number Of Selected Cards ${cardId}:`, {
                initialPosition: initialPosition,
                newPositionX,
                newPositionY,
            });

            numberObjectMesh.geometry.dispose();
            numberObjectMesh.geometry = new THREE.PlaneGeometry(numberObjectWidth, numberObjectHeight);
            numberObjectMesh.position.set(newPositionX, newPositionY, 0);

            const sideScrollArea = this.getSideScrollArea();
            if (sideScrollArea) {
                const clippingPlanes = this.clippingMaskManager.setClippingPlanes(sideScrollArea);
                this.applyClippingPlanesToMesh(numberObjectMesh, clippingPlanes);
            }
        }
    }


    private async createNumberOfSelectedCards(cardId: number, cardCount: number, position: Vector2d): Promise<NumberOfSelectedCards> {
        return await this.numberOfSelectedCardsRepository.createNumberOfSelectedCards(cardId, cardCount, position);
    }

    private numberOfSelectedCardsPosition(cardId: number): NumberOfSelectedCardsPosition {
        const positionY = this.getSelectedCardBlockPositionY(cardId);
        if (positionY !== null) {
            return this.numberOfSelectedCardsPositionRepository.addNumberOfSelectedCardsPosition(cardId, positionY);
        }
        throw new Error(`No valid position found for cardId: ${cardId}`);
    }

    private getSelectedCardBlockPositionY(clickedCardId: number): number | null {
        const blockPosition = this.selectedCardBlockPositionRepository.findPositionByCardId(clickedCardId);
        if(!blockPosition) {
            console.warn(`[WARN] block Position (ID: ${clickedCardId}) not found`);
            return null;
        }
        const positionY = blockPosition.getY();
        return positionY;
    }

    private getCardClickCount(clickedCardId: number): number {
        return this.cardCountManager.getCardClickCount(clickedCardId);
    }

    // 2개 이상 선택된 모든 카드 id 리스트 반환
    private getMultiSelectedCardIds(): number[] {
        return this.numberOfSelectedCardsRepository.findAllCardIds();
    }

    public getNumberObjectMeshByCardId(cardId: number): THREE.Mesh | null {
        const cardCount = this.getCardClickCount(cardId);
        console.log(`[DEBUG] card count?: ${cardCount}`);

        const numberObject = this.numberOfSelectedCardsRepository.findNumberByCardIdAndCardCount(cardId, cardCount);
        if (!numberObject) {
            console.warn(`[WARN] number object (ID: ${cardId}) not found`);
            return null;
        }

        const numberObjectMesh = numberObject.getMesh();
        return numberObjectMesh;
    }

    private getPositionByCardId(cardId: number): NumberOfSelectedCardsPosition | null {
        return this.numberOfSelectedCardsPositionRepository.findPositionByCardId(cardId) || null;
    }

    public deleteNumberByCardId(cardId: number): void {
        this.numberOfSelectedCardsRepository.deleteNumberByCardId(cardId);
    }

    public getExistingNumberObjectMeshByCardId(cardId: number): THREE.Mesh | null {
        const hasCardId = this.numberOfSelectedCardsRepository.hasCardId(cardId);
        if (!hasCardId) {
            console.warn(`[WARN] number object (ID: ${cardId}) not found`);
            return null;
        }
        return this.numberOfSelectedCardsRepository.getNumberMeshByCardId(cardId);
    }

    public getNumberGroup(): THREE.Group {
        return this.numberOfSelectedCardsRepository.findNumberGroup();
    }

    public resetNumberGroup(): void {
        this.numberOfSelectedCardsRepository.resetNumberGroup();
    }

    public getNumberCardIdList(): number[] {
        return this.numberOfSelectedCardsRepository.findAllCardIds();
    }

    public getAllNumber(): NumberOfSelectedCards[] {
        return this.numberOfSelectedCardsRepository.findAllNumber();
    }

    private getSideScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(1, 0);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

}
