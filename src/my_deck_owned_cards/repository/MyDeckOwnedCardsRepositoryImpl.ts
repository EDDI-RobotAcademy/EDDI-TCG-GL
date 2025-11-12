import * as THREE from 'three';
import {MyDeckOwnedCardsRepository} from './MyDeckOwnedCardsRepository';
import {MyDeckOwnedCards} from "../entity/MyDeckOwnedCards";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";
import {CardRace} from "../../card/race";
import {CardGrade} from "../../card/grade";

export class MyDeckOwnedCardsRepositoryImpl implements MyDeckOwnedCardsRepository {
    private static instance: MyDeckOwnedCardsRepositoryImpl;
    private cardMap: Map<number, { cardId: number, cardMesh: MyDeckOwnedCards }> = new Map(); // card Unique ID: [card ID: card mesh]
    private cardGroup: THREE.Group | null = null;
    private textureManager: TextureManager;

    private readonly CARD_WIDTH: number = 0.096

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
    }

    public static getInstance(): MyDeckOwnedCardsRepositoryImpl {
        if (!MyDeckOwnedCardsRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            MyDeckOwnedCardsRepositoryImpl.instance = new MyDeckOwnedCardsRepositoryImpl(textureManager);
        }
        return MyDeckOwnedCardsRepositoryImpl.instance;
    }

    public async createMyDeckOwnedCards(cardId: number, position: Vector2d): Promise<MyDeckOwnedCards> {
        const card = getCardById(cardId);
        if (!card) {
            throw new Error(`Card with ID ${cardId} not found`);
        }

        const texture = await this.textureManager.getTexture('owned_card', card.카드번호);
        if (!texture) {
            throw new Error(`Texture for card ${cardId} not found`);
        }

        const cardWidth = this.CARD_WIDTH * window.innerWidth;
        const cardHeight = cardWidth * (1540 / 952);

        const cardPositionX = position.getX() * window.innerWidth;
        const cardPositionY = position.getY() * window.innerHeight;

        const cardMesh = MeshGenerator.createMesh(texture, cardWidth, cardHeight, position);
        cardMesh.position.set(cardPositionX, cardPositionY, 0);

        const newCard = new MyDeckOwnedCards(cardMesh, position);
        this.cardMap.set(newCard.id, { cardId: cardId, cardMesh: newCard });

        return newCard
    }

    public findCardByCardId(cardId: number): MyDeckOwnedCards | null {
        for (const { cardId: storedCardId, cardMesh } of this.cardMap.values()) {
            if (storedCardId === cardId) {
                return cardMesh;
            }
        }
        return null;
    }

    public findCardByCardUniqueId(cardUniqueId: number): MyDeckOwnedCards | null {
        const card = this.cardMap.get(cardUniqueId);
        if (card) {
            return card.cardMesh;
        } else {
            return null;
        }
    }

    public findAllCards(): MyDeckOwnedCards[] {
        return Array.from(this.cardMap.values()).map(({ cardMesh }) => cardMesh);
    }

    public findAllCardIdList(): number[] {
        return Array.from(this.cardMap.values()).map(({ cardId }) => cardId);
    }

    public findAllCardUniqueIdList(): number[] {
        return Array.from(this.cardMap.keys());
    }

    public findCardIdByCardUniqueId(cardUniqueId: number): number | null {
        const card = this.cardMap.get(cardUniqueId);
        if (card) {
            return card.cardId;
        } else {
            return null;
        }
    }

    public findSearchMatchedOwnedCardIdList(cardNames: string[]): number[] {
        const cardIdList = this.findAllCardIdList();

        // names 배열에 포함된 카드명에 해당하는 cardId만 필터링
        const nameSet = new Set(cardNames.map(name => name.toLowerCase()));
        const matchedCardIdList = cardIdList.filter(cardId => {
            const card = getCardById(cardId);
            if (!card) {
                throw new Error(`Card with ID ${cardId} not found`);
            }
            return nameSet.has(card.카드명.toLowerCase());
        });

        return matchedCardIdList;
    }

    public findUnmatchedOwnedCardIdList(names: string[]): number[] {
        const cardIdList = this.findAllCardIdList();

        // names 배열에 포함된 카드명에 해당하는 cardId는 제외
        const nameSet = new Set(names.map(name => name.toLowerCase()));
        const unmatchedCardIdList = cardIdList.filter(cardId => {
            const card = getCardById(cardId);
            if (!card) {
                throw new Error(`Card with ID ${cardId} not found`);
            }
            return !nameSet.has(card.카드명.toLowerCase());
        });

        return unmatchedCardIdList;
    }

    public findOwnedCardNameList(): string[] {
        const cardIdList = this.findAllCardIdList();
        const cardNames: string[] = [];

        for (const cardId of cardIdList) {
            const card = getCardById(cardId);
            if (!card) {
                throw new Error(`Card with ID ${cardId} not found`);
            }

            const cardName = card.카드명;
            if (cardName) {
                cardNames.push(cardName);
            }
        }
        return cardNames;
    }

    public filteredOwnedCardIdList(
        cardIdList: number[],
        raceType: CardRace[] | null,
        gradeType: CardGrade[] | null
    ): number[] | null {
        const filteredCardIdList: number[] = [];

        const hasRaceFilter = raceType && raceType.length > 0;
        const hasGradeFilter = gradeType && gradeType.length > 0;

        if (!hasRaceFilter && !hasGradeFilter) {
            return null;
        }

        for (const cardId of cardIdList) {
            const card = getCardById(cardId);
            if (!card) {
                throw new Error(`Card with ID ${cardId} not found`);
            }

            const cardRace = Number(card.종족);
            const cardGrade = Number(card.등급);

            // 선택된 필터만 조건으로 적용
            const raceMatches = !hasRaceFilter || raceType!.includes(cardRace);
            const gradeMatches = !hasGradeFilter || gradeType!.includes(cardGrade);

            // 둘 다 선택된 경우엔 AND 조건으로 필터링
            if (raceMatches && gradeMatches) {
                filteredCardIdList.push(cardId);
            }
        }

        return filteredCardIdList;
    }

    public unfilteredOwnedCardIdList(
        cardIdList: number[],
        raceType: CardRace[] | null,
        gradeType: CardGrade[] | null
    ): number[] {
        const unfilteredCardIdList: number[] = [];
        const filteredCardIdList = this.filteredOwnedCardIdList(cardIdList, raceType, gradeType);
        const allCardIdList = this.findAllCardIdList();

        if (filteredCardIdList == null) return allCardIdList;

        for (const cardId of allCardIdList) {
            if (!filteredCardIdList.includes(cardId)) {
                unfilteredCardIdList.push(cardId);
            }
        }

        return unfilteredCardIdList;
    }

    public saveCardGroup(): void {
        const newCardGroup = new THREE.Group();
        const cardList = this.findAllCards();
        if (cardList == null) return;

        cardList.forEach((card) => {
            newCardGroup.add(card.getMesh());
        });

        this.cardGroup = newCardGroup;
    }

    public findCardGroup(): THREE.Group {
        if (!this.cardGroup) {
            throw new Error(`My Deck Owned Cards Group not found`);
        }

        return this.cardGroup;
    }

    // 모든 정보 삭제
    public deleteAllCard(): void {
        this.cardMap.clear();
    }

    // 특정 카드 삭제
    public deleteCardByCardUniqueId(cardUniqueId: number): void {
        const card = this.cardMap.get(cardUniqueId);
        if (card && this.cardGroup) {
            this.cardGroup.remove(card.cardMesh.getMesh());
        }
        this.cardMap.delete(cardUniqueId);
    }

    public findAllCardCount(): number {
        return this.cardMap.size;
    }

}
