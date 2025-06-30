import * as THREE from 'three';
import { MyDeckCardRepository } from './MyDeckCardRepository';
import {MyDeckCard} from "../entity/MyDeckCard";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";
import {MeshDestroyer} from "../../mesh/destroyer"

export class MyDeckCardRepositoryImpl implements MyDeckCardRepository {
    private static instance: MyDeckCardRepositoryImpl;
    private cardMap: Map<number, { cardId: number, cardMesh: MyDeckCard }> = new Map(); // card Unique ID: [card ID: card mesh]
    private deckMap: Map<number, number[]> = new Map(); // deckId: card Unique ID List
    private deckGroupMap: Map<number, THREE.Group> = new Map(); // deckId -> Group

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private readonly CARD_WIDTH: number = 0.096
    private readonly CARD_HEIGHT: number = 0.365

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): MyDeckCardRepositoryImpl {
        if (!MyDeckCardRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            MyDeckCardRepositoryImpl.instance = new MyDeckCardRepositoryImpl(textureManager, scene);
        }
        return MyDeckCardRepositoryImpl.instance;
    }

    public async createMyDeckCard(deckId: number, cardId: number, position: Vector2d): Promise<MyDeckCard> {
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

        const newCard = new MyDeckCard(cardMesh, position);
        this.cardMap.set(newCard.id, { cardId: cardId, cardMesh: newCard });

        if (!this.deckMap.has(deckId)) {
            this.deckMap.set(deckId, []);
        }
        const cardIdList = this.deckMap.get(deckId)!;
        cardIdList.push(newCard.id);
        this.deckMap.set(deckId, cardIdList);

        return newCard
    }

    public findCardByCardId(cardId: number): MyDeckCard | null {
        for (const { cardId: storedCardId, cardMesh } of this.cardMap.values()) {
            if (storedCardId === cardId) {
                return cardMesh;
            }
        }
        return null;
    }

    public findCardByCardUniqueId(cardUniqueId: number): MyDeckCard | null {
        const card = this.cardMap.get(cardUniqueId);
        if (card) {
            return card.cardMesh;
        } else {
            return null;
        }
    }

    public findCardIdByCardUniqueId(cardUniqueId: number): number | null {
        const card = this.cardMap.get(cardUniqueId);
        if (card) {
            return card.cardId;
        } else {
            return null;
        }
    }

    public findCardListByDeckId(deckId: number): MyDeckCard[] | null {
        const cardUniqueIdList = this.deckMap.get(deckId);
        if (cardUniqueIdList === undefined) {
            return null;
        }

        const cardMeshList: MyDeckCard[] = [];
        cardUniqueIdList.forEach((uniqueId) => {
            const cardMesh = this.findCardByCardUniqueId(uniqueId);
            if (cardMesh) {
                cardMeshList.push(cardMesh);
            } else {
                console.warn(`[WARN] Card with Unique ID ${uniqueId} not found in cardMap`);
            }
        });

        return cardMeshList;
    }

    public findCardByDeckIdAndCardId(deckId: number, cardId: number): MyDeckCard | null {
        const cardUniqueIdList = this.deckMap.get(deckId);
        if (!cardUniqueIdList) {
            return null;
        }

        for (const uniqueId of cardUniqueIdList) {
            const card = this.cardMap.get(uniqueId);
            if (card && card.cardId === cardId) {
                return card.cardMesh;
            }
        }

        return null;
    }

    public findCardUniqueIdByDeckIdAndCardId(deckId: number, cardId: number): number | null {
        const cardUniqueIdList = this.deckMap.get(deckId);
        if (!cardUniqueIdList) {
            return null;
        }

        for (const uniqueId of cardUniqueIdList) {
            const cardEntry = this.cardMap.get(uniqueId);
            if (cardEntry && cardEntry.cardId === cardId) {
                return uniqueId;
            }
        }

        return null;
    }

    public findCardUniqueIdListByDeckId(deckId: number): number[] {
        return this.deckMap.get(deckId) || [];
    }

    public findDeckIdList(): number[] {
        return Array.from(this.deckMap.keys());
    }

    public findCardCountByDeckId(deckId: number): number {
        const cardUniqueIdList = this.deckMap.get(deckId);
        return cardUniqueIdList ? cardUniqueIdList.length : 0;
    }

    public saveCardGroupByDeckId(deckId: number): void {
        const cardIdList = this.deckMap.get(deckId);
        if (!cardIdList) {
            throw new Error(`Deck with ID ${deckId} not found`);
        }

        const cardGroup = new THREE.Group();
        cardIdList.forEach(cardUniqueId => {
            const card = this.cardMap.get(cardUniqueId);
            if (card) {
                cardGroup.add(card.cardMesh.getMesh());
            } else {
                console.warn(`[WARN] Card with Unique ID ${cardUniqueId} not found in cardMap`);
            }
        });

        this.deckGroupMap.set(deckId, cardGroup);
    }

    public findCardGroupByDeckId(deckId: number): THREE.Group {
        const cardGroup = this.deckGroupMap.get(deckId);
        if (!cardGroup) {
            throw new Error(`Deck group with ID ${deckId} not found`);
        }
        return cardGroup;
    }

    // 특정 덱의 특정 카드 삭제
    public deleteCardByDeckIdAndCardUniqueId(deckId: number, cardUniqueId: number): void {
        const cardInfo = this.cardMap.get(cardUniqueId);
        if (cardInfo) {
            this.meshDestroyer.destroyMesh(cardInfo.cardMesh.getMesh());

            const group = this.deckGroupMap.get(deckId);
            if (group) {
                group.remove(cardInfo.cardMesh.getMesh());
            }

            this.cardMap.delete(cardUniqueId);
        }

        const cardIdList = this.deckMap.get(deckId);
        if (cardIdList) {
            const updatedList = cardIdList.filter(id => id !== cardUniqueId);
            this.deckMap.set(deckId, updatedList);

//             if (updatedList.length === 0) {
//                 this.deckMap.delete(deckId);
//             }
        }
    }

    public resetCardGroup(): void {
        this.deckGroupMap.clear();
    }

    // 모든 정보 삭제(덱, 카드 모두)
    public deleteAllCard(): void {
        this.deckMap.clear();
        this.cardMap.clear();
    }

    // 특정 덱 삭제
    public deleteDeckByDeckId(deckId: number): void {
        const group = this.deckGroupMap.get(deckId);
        if (group) {
            this.meshDestroyer.destroyGroup(group);
            this.deckGroupMap.delete(deckId);
        }

        const cardUniqueIdList = this.findCardUniqueIdListByDeckId(deckId);
        if (cardUniqueIdList) {
            cardUniqueIdList.forEach((cardId) => {
                this.cardMap.delete(cardId);
            });
        }
        this.deckMap.delete(deckId);
        const deckIdList = this.findDeckIdList();
        console.log(`%c삭제 후 남은 덱 id 리스트는? ${deckIdList}`, 'color: #FE2EF7; font-weight: bold;');
    }

}
