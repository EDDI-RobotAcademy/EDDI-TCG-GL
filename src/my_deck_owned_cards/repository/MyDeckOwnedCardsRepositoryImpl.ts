import * as THREE from 'three';
import {MyDeckOwnedCardsRepository} from './MyDeckOwnedCardsRepository';
import {MyDeckOwnedCards} from "../entity/MyDeckOwnedCards";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";

export class MyDeckOwnedCardsRepositoryImpl implements MyDeckOwnedCardsRepository {
    private static instance: MyDeckOwnedCardsRepositoryImpl;
    private cardMap: Map<number, { cardId: number, cardMesh: MyDeckOwnedCards }> = new Map(); // card Unique ID: [card ID: card mesh]
    private cardGroup: THREE.Group | null = null;
    private cardCountMap: Map<number, number> = new Map(); // card Unique Id: card Count
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

    public async createMyDeckOwnedCards(cardId: number, cardCount: number, position: Vector2d): Promise<MyDeckOwnedCards> {
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
        this.cardCountMap.set(newCard.id, cardCount);

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

    public findCardGroup(): THREE.Group {
        if (!this.cardGroup) {
            this.cardGroup = new THREE.Group();
            this.findAllCards()?.forEach((card) => {
                this.cardGroup!.add(card.getMesh());
            });
        }
        return this.cardGroup;
    }

    // 모든 정보 삭제
    public deleteAllCard(): void {
        this.cardMap.clear();
        this.cardCountMap.clear();
    }

    // 특정 카드 삭제
    public deleteCardByCardUniqueId(cardUniqueId: number): void {
        const card = this.cardMap.get(cardUniqueId);
        if (card && this.cardGroup) {
            this.cardGroup.remove(card.cardMesh.getMesh());
        }
        this.cardMap.delete(cardUniqueId);
        this.cardCountMap.delete(cardUniqueId);
    }

    public findAllCardCount(): number {
        return this.cardMap.size;
    }

    public getCardCountByCardUniqueId(cardUniqueId: number): number | null {
        return this.cardCountMap.get(cardUniqueId) ?? null;
    }

}
