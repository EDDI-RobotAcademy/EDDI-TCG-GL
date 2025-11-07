import * as THREE from 'three';
import { MyDeckCardRepository } from './MyDeckCardRepository';
import {MyDeckCard} from "../entity/MyDeckCard";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";
import {MeshDestroyer} from "../../mesh/destroyer"
import {CardRace} from "../../card/race";
import {CardGrade} from "../../card/grade";

export class MyDeckCardRepositoryImpl implements MyDeckCardRepository {
    private static instance: MyDeckCardRepositoryImpl;
    private cardMap: Map<number, { cardId: number, cardMesh: MyDeckCard }> = new Map(); // card Unique ID: [card ID: card mesh]
    private deckMap: Map<number, number[]> = new Map(); // deckId: card Unique ID List
    private cardGroupMap: Map<number, THREE.Group> = new Map(); // deckId -> Group

    private originalCardMap: Map<number, { cardId: number, cardMesh: MyDeckCard }> = new Map();
    private originalDeckMap: Map<number, number[]> = new Map();

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

    public findCardIdListByDeckId(deckId: number): number[] {
        const cardUniqueIdList = this.deckMap.get(deckId);
        if (!cardUniqueIdList) {
            return [];
        }

        const cardIdList: number[] = [];
        for (const cardUniqueId of cardUniqueIdList) {
            const entry = this.cardMap.get(cardUniqueId);
            if (entry) {
                cardIdList.push(entry.cardId);
            } else {
                console.warn(`[WARN] Card with uniqueId ${cardUniqueId} not found in cardMap`);
            }
        }

        return cardIdList;
    }

    public findDeckIdList(): number[] {
        return Array.from(this.deckMap.keys());
    }

    public findCardCountByDeckId(deckId: number): number {
        const cardUniqueIdList = this.deckMap.get(deckId);
        return cardUniqueIdList ? cardUniqueIdList.length : 0;
    }

    public filteredDeckCardIdList(
        deckId: number,
        raceType: CardRace[] | null,
        gradeType: CardGrade[] | null
    ): number[] | null {
        const allCurrentDeckCardIdList = this.findCardIdListByDeckId(deckId);
        const filteredCardIdList: number[] = [];

        // 둘 다 선택되지 않았으면 필터링 없이 전체 카드 유지 (null로 표시)
        const hasRaceFilter = raceType && raceType.length > 0;
        const hasGradeFilter = gradeType && gradeType.length > 0;

        if (!hasRaceFilter && !hasGradeFilter) {
            return null;
        }

        for (const cardId of allCurrentDeckCardIdList) {
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

        this.cardGroupMap.set(deckId, cardGroup);
    }

    public findCardGroupByDeckId(deckId: number): THREE.Group {
        const cardGroup = this.cardGroupMap.get(deckId);
        if (!cardGroup) {
            throw new Error(`Deck group with ID ${deckId} not found`);
        }
        return cardGroup;
    }

    // 특정 덱의 특정 카드 삭제
    public deleteCard(deckId: number, cardUniqueId: number): void {
        const cardInfo = this.cardMap.get(cardUniqueId);
        if (cardInfo) {

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

    public deleteCardMesh(deckId: number, cardUniqueId: number): void {
        const cardInfo = this.cardMap.get(cardUniqueId);
        if (cardInfo) {
            this.meshDestroyer.destroyMesh(cardInfo.cardMesh.getMesh());

            const group = this.cardGroupMap.get(deckId);
            if (group) {
                group.remove(cardInfo.cardMesh.getMesh());
            }
        }
    }

    public resetCardGroup(): void {
        this.cardGroupMap.clear();
    }

    // 모든 정보 삭제(덱, 카드 모두)
    public deleteAllCard(): void {
        this.deckMap.clear();
        this.cardMap.clear();
    }

    // 특정 덱 삭제
    public deleteDeckByDeckId(deckId: number): void {
        const group = this.cardGroupMap.get(deckId);
        if (group) {
            this.meshDestroyer.destroyGroup(group);
            this.cardGroupMap.delete(deckId);
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

    // 원본 데이터 복제
    public saveClonedOriginalDeckState(deckId: number): void {
        this.originalCardMap.clear();
        this.originalDeckMap.set(deckId, [...(this.deckMap.get(deckId) || [])]);

        const cardUniqueIdList = this.deckMap.get(deckId);
        if (!cardUniqueIdList) {
            console.warn(`[WARN] No cardUniqueIdList for deck ${deckId}`);
            return;
        }

        cardUniqueIdList.forEach(cardUniqueId => {
            const entry = this.cardMap.get(cardUniqueId);
            if (entry) {
                const originalMesh = entry.cardMesh.getMesh();
                const clonedMesh = originalMesh.clone(true);
                const clonedPosition = entry.cardMesh.position.clone ? entry.cardMesh.position.clone() : entry.cardMesh.position;
                const clonedWrapper = new MyDeckCard(clonedMesh, clonedPosition);

                this.originalCardMap.set(cardUniqueId, {
                    cardId: entry.cardId,
                    cardMesh: clonedWrapper
                });

            } else {
                console.warn(`[WARN] cardUniqueId ${cardUniqueId} not found in cardMap`);
            }
        });

        // To-do: 확인 후 삭제하기
        console.log(
            `%c[INFO] Original deck state cloned and stored for deckId ${deckId}`, 'color: #2E9AFE; font-weight: bold;');
        console.log(
            'originalCardMap:',
            Array.from(this.originalCardMap.entries()).map(([id, data]) => ({
                cardUniqueId: id,
                cardId: data.cardId
            }))
        );
    }

    public restoreOriginalDeckState(deckId: number): void {
        const originalCardUniqueIdList = this.originalDeckMap.get(deckId);
        if (originalCardUniqueIdList) {
            this.deckMap.set(deckId, [...originalCardUniqueIdList]);
        }

        const cardUniqueIdList = this.deckMap.get(deckId);
        if (!cardUniqueIdList) return;

        cardUniqueIdList.forEach(cardUniqueId => {
            const originalCardInfo = this.originalCardMap.get(cardUniqueId);
            if (originalCardInfo) {
                const currentCardInfo = this.cardMap.get(cardUniqueId);
                if (currentCardInfo) {
                    this.meshDestroyer.destroyMesh(currentCardInfo.cardMesh.getMesh());
                }

                this.cardMap.set(cardUniqueId, {
                    cardId: originalCardInfo.cardId,
                    cardMesh: originalCardInfo.cardMesh
                });

                const group = this.cardGroupMap.get(deckId);
                if (group) {
                    originalCardInfo.cardMesh.setVisibility(false);
                    group.add(originalCardInfo.cardMesh.getMesh());
                }
            }
        });

        // To-do: 확인 후 없애야 함
        const restoredData = cardUniqueIdList.map(cardUniqueId => {
            const data = this.cardMap.get(cardUniqueId);
            return data ? {
                cardUniqueId,
                cardId: data.cardId,
                cardMesh: data.cardMesh
            } : { cardUniqueId, cardId: null, cardMesh: null };
        });

        console.log(
            `%c[덱 편집 중단 후 다른 덱 버튼을 눌렀을 때] Deck ${deckId} restored.`,
            'color: #2E9AFE; font-weight: bold;'
        );
        console.log('복원된 mesh 데이터:', restoredData);

    }

}
