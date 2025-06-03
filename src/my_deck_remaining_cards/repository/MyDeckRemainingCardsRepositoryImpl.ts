import * as THREE from 'three';
import {MyDeckRemainingCardsRepository} from './MyDeckRemainingCardsRepository';
import {MyDeckRemainingCards} from "../entity/MyDeckRemainingCards";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";

export class MyDeckRemainingCardsRepositoryImpl implements MyDeckRemainingCardsRepository {
    private static instance: MyDeckRemainingCardsRepositoryImpl;
    private remainingCardsMap: Map<number, { cardId: number, cardCount: number, remainingCardsMesh: MyDeckRemainingCards }> = new Map();
    private textureManager: TextureManager;
    private remainingCardsGroup: THREE.Group | null = null;

    private readonly REMAINING_CARDS_WIDTH: number = 0.013

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
    }

    public static getInstance(): MyDeckRemainingCardsRepositoryImpl {
        if (!MyDeckRemainingCardsRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            MyDeckRemainingCardsRepositoryImpl.instance = new MyDeckRemainingCardsRepositoryImpl(textureManager);
        }
        return MyDeckRemainingCardsRepositoryImpl.instance;
    }

    public async createMyDeckRemainingCards(cardId: number, cardCount: number, position: Vector2d): Promise<MyDeckRemainingCards> {
        const texture = await this.textureManager.getTexture('card_count', cardCount);

        if (!texture) {
            throw new Error('My Deck Card Count texture not found.');
        }

        const remainingCardsWidth = this.REMAINING_CARDS_WIDTH * window.innerWidth;
        const remainingCardsHeight = remainingCardsWidth;

        const remainingCardsPositionX = position.getX() * window.innerWidth;
        const remainingCardsPositionY = position.getY() * window.innerHeight;

        const remainingCardsMesh = MeshGenerator.createMesh(texture, remainingCardsWidth, remainingCardsHeight, position);
        remainingCardsMesh.position.set(remainingCardsPositionX, remainingCardsPositionY, 0);

        const newRemainingCards = new MyDeckRemainingCards(remainingCardsMesh, position);
        this.remainingCardsMap.set(newRemainingCards.id, { cardCount, cardId, remainingCardsMesh: newRemainingCards });

        return newRemainingCards;
    }

    public findRemainingCardsById(remainingCardsId: number): MyDeckRemainingCards | null {
        return this.remainingCardsMap.get(remainingCardsId)?.remainingCardsMesh ?? null;
    }

    public findCardCountByRemainingCardsId(remainingCardsId: number): number | null {
        return this.remainingCardsMap.get(remainingCardsId)?.cardCount ?? null;
    }

    public findCardIdByRemainingCardsId(remainingCardsId: number): number | null {
        return this.remainingCardsMap.get(remainingCardsId)?.cardId ?? null;
    }

    public findRemainingCardIdByCardId(cardId: number): number | null {
        for (const [remainingCardsId, { cardId: storedCardId }] of this.remainingCardsMap.entries()) {
            if (storedCardId === cardId) {
                console.log(`Match found! Returning Remaining Cards Id: ${remainingCardsId}`);
                return remainingCardsId;
            }
        }
        return null;
    }

    public findAllRemainingCardsList(): MyDeckRemainingCards[] {
        return Array.from(this.remainingCardsMap.values()).map(({ remainingCardsMesh }) => remainingCardsMesh);
    }

    public findAllCardIdList(): number[] {
        return Array.from(this.remainingCardsMap.values()).map(({ cardId }) => cardId);
    }

    public findAllRemainingCardsIdList(): number[] {
        return Array.from(this.remainingCardsMap.keys());
    }

    public deleteRemainingCardsById(remainingCardsId: number): void {
        const remainingCards = this.remainingCardsMap.get(remainingCardsId);
        if (remainingCards && this.remainingCardsGroup) {
            this.remainingCardsGroup.remove(remainingCards.remainingCardsMesh.getMesh());
        }
        this.remainingCardsMap.delete(remainingCardsId);
    }

    public deleteAll(): void {
        this.remainingCardsMap.clear();
        this.resetRemainingCardsGroup();
    }

    public findRemainingCardsGroup(): THREE.Group {
        if (!this.remainingCardsGroup) {
            this.remainingCardsGroup = new THREE.Group();
            this.findAllRemainingCardsList()?.forEach((remainingCards) => {
                this.remainingCardsGroup!.add(remainingCards.getMesh());
            });
        }
        return this.remainingCardsGroup;
    }

    public resetRemainingCardsGroup(): void {
        this.remainingCardsGroup = null;
    }

}
