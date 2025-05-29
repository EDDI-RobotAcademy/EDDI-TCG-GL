import * as THREE from 'three';
import {MyDeckTotalOwnedCardsRepository} from './MyDeckTotalOwnedCardsRepository';
import {MyDeckTotalOwnedCards} from "../entity/MyDeckTotalOwnedCards";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";

export class MyDeckTotalOwnedCardsRepositoryImpl implements MyDeckTotalOwnedCardsRepository {
    private static instance: MyDeckTotalOwnedCardsRepositoryImpl;
    private totalOwnedCardsMap: Map<number, { cardId: number, cardCount: number, totalOwnedCardsMesh: MyDeckTotalOwnedCards }> = new Map();
    private textureManager: TextureManager;
    private totalOwnedCardsGroup: THREE.Group | null = null;

    private readonly TOTAL_OWNED_CARDS_WIDTH: number = 0.013

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
    }

    public static getInstance(): MyDeckTotalOwnedCardsRepositoryImpl {
        if (!MyDeckTotalOwnedCardsRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            MyDeckTotalOwnedCardsRepositoryImpl.instance = new MyDeckTotalOwnedCardsRepositoryImpl(textureManager);
        }
        return MyDeckTotalOwnedCardsRepositoryImpl.instance;
    }

    public async createMyDeckTotalOwnedCards(cardId: number, cardCount: number, position: Vector2d): Promise<MyDeckTotalOwnedCards> {
        const texture = await this.textureManager.getTexture('card_count', cardCount);

        if (!texture) {
            throw new Error('My Deck Card Count texture not found.');
        }

        const totalOwnedCardsWidth = this.TOTAL_OWNED_CARDS_WIDTH * window.innerWidth;
        const totalOwnedCardsHeight = totalOwnedCardsWidth;

        const totalOwnedCardsPositionX = position.getX() * window.innerWidth;
        const totalOwnedCardsPositionY = position.getY() * window.innerHeight;

        const totalOwnedCardsMesh = MeshGenerator.createMesh(texture, totalOwnedCardsWidth, totalOwnedCardsHeight, position);
        totalOwnedCardsMesh.position.set(totalOwnedCardsPositionX, totalOwnedCardsPositionY, 0);

        const newTotalOwnedCards = new MyDeckTotalOwnedCards(totalOwnedCardsMesh, position);
        this.totalOwnedCardsMap.set(newTotalOwnedCards.id, { cardCount, cardId, totalOwnedCardsMesh: newTotalOwnedCards });

        return newTotalOwnedCards;
    }

    public findTotalOwnedCardsById(totalOwnedCardsId: number): MyDeckTotalOwnedCards | null {
        return this.totalOwnedCardsMap.get(totalOwnedCardsId)?.totalOwnedCardsMesh ?? null;
    }

    public findCardCountByTotalOwnedCardsId(totalOwnedCardsId: number): number | null {
        return this.totalOwnedCardsMap.get(totalOwnedCardsId)?.cardCount ?? null;
    }

    public findCardIdByTotalOwnedCardsId(totalOwnedCardsId: number): number | null {
        return this.totalOwnedCardsMap.get(totalOwnedCardsId)?.cardId ?? null;
    }

    public findAllTotalOwnedCardsList(): MyDeckTotalOwnedCards[] {
        return Array.from(this.totalOwnedCardsMap.values()).map(({ totalOwnedCardsMesh }) => totalOwnedCardsMesh);
    }

    public findAllCardIdList(): number[] {
        return Array.from(this.totalOwnedCardsMap.values()).map(({ cardId }) => cardId);
    }

    public findAllTotalOwnedCardsIdList(): number[] {
        return Array.from(this.totalOwnedCardsMap.keys());
    }

    public deleteTotalOwnedCardsById(totalOwnedCardsId: number): void {
        const totalOwnedCards = this.totalOwnedCardsMap.get(totalOwnedCardsId);
        if (totalOwnedCards && this.totalOwnedCardsGroup) {
            this.totalOwnedCardsGroup.remove(totalOwnedCards.totalOwnedCardsMesh.getMesh());
        }
        this.totalOwnedCardsMap.delete(totalOwnedCardsId);
    }

    public deleteAll(): void {
        this.totalOwnedCardsMap.clear();
        this.resetNumberGroup();
    }

    public findTotalOwnedCardsGroup(): THREE.Group {
        if (!this.totalOwnedCardsGroup) {
            this.totalOwnedCardsGroup = new THREE.Group();
            this.findAllTotalOwnedCardsList()?.forEach((totalOwnedCards) => {
                this.totalOwnedCardsGroup!.add(totalOwnedCards.getMesh());
            });
        }
        return this.totalOwnedCardsGroup;
    }

    public resetNumberGroup(): void {
        this.totalOwnedCardsGroup = null;
    }

}
