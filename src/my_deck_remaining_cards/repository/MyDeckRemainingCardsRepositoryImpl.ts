import * as THREE from 'three';
import {MyDeckRemainingCardsRepository} from './MyDeckRemainingCardsRepository';
import {MyDeckRemainingCards} from "../entity/MyDeckRemainingCards";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";
import {MeshDestroyer} from "../../mesh/destroyer"

export class MyDeckRemainingCardsRepositoryImpl implements MyDeckRemainingCardsRepository {
    private static instance: MyDeckRemainingCardsRepositoryImpl;
    private remainingCardsMap: Map<number, { cardId: number, cardCount: number, remainingCardsMesh: MyDeckRemainingCards }> = new Map();
    private remainingCardsGroup: THREE.Group | null = null;

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private readonly REMAINING_CARDS_WIDTH: number = 0.013

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): MyDeckRemainingCardsRepositoryImpl {
        if (!MyDeckRemainingCardsRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            MyDeckRemainingCardsRepositoryImpl.instance = new MyDeckRemainingCardsRepositoryImpl(textureManager, scene);
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
        this.remainingCardsMap.set(newRemainingCards.id, { cardId, cardCount, remainingCardsMesh: newRemainingCards });

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

    public findRemainingCardByCardId(cardId: number): MyDeckRemainingCards | null {
        for (const [remainingCardsId, { cardId: storedCardId, remainingCardsMesh}] of this.remainingCardsMap.entries()) {
            if (storedCardId === cardId) {
                console.log(`Match found! Returning Remaining Cards Id: ${cardId}`);
                return remainingCardsMesh;
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

    public findRemainingCardCountById(remainingCardsId: number): number {
        const entry = this.remainingCardsMap.get(remainingCardsId);
        if (entry) {
            return entry.cardCount;
        } else {
            throw new Error(`Remaining Card Count with ID ${remainingCardsId} not found.`);
        }
    }

    public deleteRemainingCardsById(remainingCardsId: number): void {
        const remainingCards = this.remainingCardsMap.get(remainingCardsId);
        if (remainingCards && this.remainingCardsGroup) {
            this.remainingCardsGroup.remove(remainingCards.remainingCardsMesh.getMesh());
        }
        this.remainingCardsMap.delete(remainingCardsId);
    }

    public deleteRemainingCardsByCardId(cardId: number): void {
        const remainingCardsId = this.findRemainingCardIdByCardId(cardId);
        if (remainingCardsId === null) return;

        const remainingCardEntry = this.remainingCardsMap.get(remainingCardsId);
        if (!remainingCardEntry) return;

        const mesh = remainingCardEntry.remainingCardsMesh.getMesh();

        this.meshDestroyer.destroyMesh(mesh);
        this.remainingCardsGroup?.remove(mesh);
        this.remainingCardsMap.delete(remainingCardsId);
    }

    public deleteAll(): void {
        this.remainingCardsMap.clear();
        this.resetRemainingCardsGroup();
    }

    public saveRemainingCardsGroup(): void {
        const remainingCardsList = this.findAllRemainingCardsList();
        const numberOfCardsGroup = new THREE.Group();

        remainingCardsList.forEach((remainingCard) => {
            numberOfCardsGroup.add(remainingCard.getMesh());
        });

        this.remainingCardsGroup = numberOfCardsGroup;
    }

    public findRemainingCardsGroup(): THREE.Group {
        if (!this.remainingCardsGroup) {
            throw new Error(`My Deck Number Of Remaining Cards Group not found`);
        }

        return this.remainingCardsGroup;
    }

    public resetRemainingCardsGroup(): void {
        this.remainingCardsGroup = null;
    }

}
