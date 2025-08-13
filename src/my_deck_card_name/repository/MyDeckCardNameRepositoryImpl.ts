import * as THREE from 'three';
import {MyDeckCardNameRepository} from './MyDeckCardNameRepository';
import {MyDeckCardName} from "../entity/MyDeckCardName";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {TextGenerator} from "../../text/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";
import {MeshDestroyer} from "../../mesh/destroyer"

export class MyDeckCardNameRepositoryImpl implements MyDeckCardNameRepository {
    private static instance: MyDeckCardNameRepositoryImpl;
    private cardNameMap: Map<number, { cardId: number, cardNameMesh: MyDeckCardName }> = new Map(); // card name unique id: {card id: mesh}
    private deckMap: Map<number, number[]> = new Map(); // deckId: card name unique ID List
    private nameGroupMap: Map<number, THREE.Group> = new Map(); // deckId -> Group

    private originalCardNameMap: Map<number, { cardId: number, cardNameMesh: MyDeckCardName }> = new Map();
    private originalDeckMap: Map<number, number[]> = new Map();

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private readonly CARD_NAME_WIDTH: number = 0.166

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): MyDeckCardNameRepositoryImpl {
        if (!MyDeckCardNameRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            MyDeckCardNameRepositoryImpl.instance = new MyDeckCardNameRepositoryImpl(textureManager, scene);
        }
        return MyDeckCardNameRepositoryImpl.instance;
    }

    public async createMyDeckCardName(deckId: number, cardId: number, position: Vector2d): Promise<MyDeckCardName> {
        const card = getCardById(cardId);
        if (!card) {
            throw new Error(`Card with ID ${cardId} not found`);
        }

        const cardName = card.카드명;
        const generator = new TextGenerator();
        const texture = generator.createText(cardName, 9, 'CustomFont', '#FFFFFF');

        if (!texture) {
            throw new Error('My Deck Card Name not found.');
        }

        const canvas = texture.image;
        const cardNameWidth = canvas.width;
        const cardNameHeight = canvas.height;

        const cardNamePositionX = position.getX() * window.innerWidth;
        const cardNamePositionY = position.getY() * window.innerHeight;

        const cardNameMesh = MeshGenerator.createMesh(texture, cardNameWidth, cardNameHeight, position);
        cardNameMesh.position.set(cardNamePositionX, cardNamePositionY, 0);

        const newCardName = new MyDeckCardName(cardNameMesh, position, cardNameWidth, cardNameHeight);
        this.cardNameMap.set(newCardName.id, { cardId, cardNameMesh: newCardName });

        if (!this.deckMap.has(deckId)) {
            this.deckMap.set(deckId, []);
        }
        const cardNameIdList = this.deckMap.get(deckId)!;
        cardNameIdList.push(newCardName.id);
        this.deckMap.set(deckId, cardNameIdList);

        return newCardName;
    }

    public findCardNameByCardId(cardId: number): MyDeckCardName | null {
        for (const { cardId: storedCardId, cardNameMesh } of this.cardNameMap.values()) {
            if (storedCardId === cardId) {
                return cardNameMesh;
            }
        }
        return null;
    }

    public findCardNameById(cardNameId: number): MyDeckCardName | null {
        const cardName = this.cardNameMap.get(cardNameId);
        if (cardName) {
            return cardName.cardNameMesh;
        } else {
            return null;
        }
    }

    public findCardIdByCardNameId(cardNameId: number): number | null {
        const card = this.cardNameMap.get(cardNameId);
        if (card) {
            return card.cardId;
        } else {
            return null;
        }
    }

    public findCardNameByDeckIdAndCardId(deckId: number, cardId: number): MyDeckCardName | null {
        const cardNameIdList = this.deckMap.get(deckId);
        if (!cardNameIdList) {
            return null;
        }

        for (const cardNameId of cardNameIdList) {
            const cardName = this.cardNameMap.get(cardNameId);
            if (cardName && cardName.cardId === cardId) {
                return cardName.cardNameMesh;
            }
        }
        return null;
    }

    public findCardNameIdByDeckIdAndCardId(deckId: number, cardId: number): number | null {
        const cardNameIdList = this.deckMap.get(deckId);
        if (!cardNameIdList) {
            return null;
        }

        for (const cardNameId of cardNameIdList) {
            const cardName = this.cardNameMap.get(cardNameId);
            if (cardName && cardName.cardId === cardId) {
                return cardNameId;
            }
        }
        return null;
    }

    public findCardNameListByDeckId(deckId: number): MyDeckCardName[] | null {
        const cardNameUniqueIdList = this.deckMap.get(deckId);
        if (cardNameUniqueIdList === undefined) {
            return null;
        }

        const cardNameMeshList: MyDeckCardName[] = [];
        cardNameUniqueIdList.forEach((uniqueId) => {
            const cardNameMesh = this.findCardNameById(uniqueId);
            if (cardNameMesh) {
                cardNameMeshList.push(cardNameMesh);
            } else {
                console.warn(`[WARN] Card Name with Unique ID ${uniqueId} not found in cardNameMap`);
            }
        });

        return cardNameMeshList;
    }

    public findCardNameIdListByDeckId(deckId: number): number[] {
        return this.deckMap.get(deckId) || [];
    }

    public findDeckIdList(): number[] {
        return Array.from(this.deckMap.keys());
    }

    public findCardNameCountByDeckId(deckId: number): number {
        const cardNameIdList = this.deckMap.get(deckId);
        return cardNameIdList ? cardNameIdList.length : 0;
    }

    public saveCardNameGroupByDeckId(deckId: number): void {
        const cardNameIdList = this.deckMap.get(deckId);
        if (!cardNameIdList) {
            throw new Error(`Card Name with Deck ID ${deckId} not found`);
        }

        const cardNameGroup = new THREE.Group();
        cardNameIdList.forEach(cardNameId => {
            const cardName = this.cardNameMap.get(cardNameId);
            if (cardName) {
                cardNameGroup.add(cardName.cardNameMesh.getMesh());
            } else {
                console.warn(`[WARN] Card Name with Unique ID ${cardNameId} not found in cardNameMap`);
            }
        });

        this.nameGroupMap.set(deckId, cardNameGroup);
    }

    public findCardNameGroupByDeckId(deckId: number): THREE.Group {
        const cardNameGroup = this.nameGroupMap.get(deckId);
        if (!cardNameGroup) {
            throw new Error(`card name group with Deck ID ${deckId} not found`);
        }
        return cardNameGroup;
    }

    public resetCardNameGroup(): void {
        this.nameGroupMap.clear();
    }

    // 특정 덱의 특정 card name 삭제
    public deleteCardName(deckId: number, cardNameId: number): void {
        const nameInfo = this.cardNameMap.get(cardNameId);
        if (nameInfo) {
            this.cardNameMap.delete(cardNameId);
        }

        const cardNameIdList = this.deckMap.get(deckId);
        if (cardNameIdList) {
            const updatedList = cardNameIdList.filter(id => id !== cardNameId);
            this.deckMap.set(deckId, updatedList);

//             if (updatedList.length === 0) {
//                 this.deckMap.delete(deckId);
//             }
        }
    }

    public deleteCardNameMesh(deckId: number, cardNameId: number): void {
        const nameInfo = this.cardNameMap.get(cardNameId);
        if (nameInfo) {
            this.meshDestroyer.destroyMesh(nameInfo.cardNameMesh.getMesh());

            const group = this.nameGroupMap.get(deckId);
            if (group) {
                group.remove(nameInfo.cardNameMesh.getMesh());
            }
        }
    }

    // 모든 정보 삭제
    public deleteAllCardName(): void {
        this.deckMap.clear();
        this.cardNameMap.clear();
    }

    // 특정 덱 삭제
    public deleteDeckByDeckId(deckId: number): void {
        const group = this.nameGroupMap.get(deckId);
        if (group) {
            this.meshDestroyer.destroyGroup(group);
            this.nameGroupMap.delete(deckId);
        }

        const cardNameIdList = this.findCardNameIdListByDeckId(deckId);
        if (cardNameIdList) {
            cardNameIdList.forEach((cardNameId) => {
                this.cardNameMap.delete(cardNameId);
            });
        }
        this.deckMap.delete(deckId);
        const deckIdList = this.findDeckIdList();
        console.log(`%c삭제 후 남은 덱 id 리스트는? ${deckIdList}`, 'color: #FE2EF7; font-weight: bold;');
    }

    // 원본 데이터 복제
    public saveClonedOriginalDeckState(deckId: number): void {
        this.originalCardNameMap.clear();
        this.originalDeckMap.set(deckId, [...(this.deckMap.get(deckId) || [])]);

        const cardNameIdList = this.deckMap.get(deckId);
        if (!cardNameIdList) {
            console.warn(`[WARN] No cardNameIdList for deck ${deckId}`);
            return;
        }

        cardNameIdList.forEach(cardNameId => {
            const entry = this.cardNameMap.get(cardNameId);
            if (entry) {
                const originalMesh = entry.cardNameMesh.getMesh();
                const clonedMesh = originalMesh.clone(true);
                const clonedPosition = entry.cardNameMesh.position.clone ? entry.cardNameMesh.position.clone() : entry.cardNameMesh.position;
                const clonedWrapper = new MyDeckCardName(clonedMesh, clonedPosition, entry.cardNameMesh.width, entry.cardNameMesh.height);

                this.originalCardNameMap.set(cardNameId, {
                    cardId: entry.cardId,
                    cardNameMesh: clonedWrapper
                });

            } else {
                console.warn(`[WARN] cardNameId ${cardNameId} not found in cardNameMap`);
            }
        });

        // To-do: 확인 후 삭제하기
        console.log(
            `%c[INFO] Original deck state cloned and stored for deckId ${deckId}`, 'color: #2E9AFE; font-weight: bold;');
        console.log(
            'originalCardNameMap:',
            Array.from(this.originalCardNameMap.entries()).map(([id, data]) => ({
                cardNameId: id,
                cardId: data.cardId
            }))
        );
    }


}
