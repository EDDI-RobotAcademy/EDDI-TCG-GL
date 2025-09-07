import * as THREE from 'three';
import {DeckCardCountMarkerRepository} from './DeckCardCountMarkerRepository';
import {DeckCardCountMarker} from "../entity/DeckCardCountMarker";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";
import {MeshDestroyer} from "../../mesh/destroyer"

export class DeckCardCountMarkerRepositoryImpl implements DeckCardCountMarkerRepository {
    private static instance: DeckCardCountMarkerRepositoryImpl;

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private markerMap: Map<number, { cardId: number, markerMesh: DeckCardCountMarker }> = new Map(); // marker unique id: {card id: marker mesh}
    private deckMap: Map<number, number[]> = new Map(); // deckId: marker Unique ID List
    private markerGroupMap: Map<number, THREE.Group> = new Map(); // deckId -> Group

    private originalMarkerMap: Map<number, { cardId: number, markerMesh: DeckCardCountMarker }> = new Map();
    private originalDeckMap: Map<number, number[]> = new Map();

    private readonly MARKER_WIDTH: number = 0.012

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): DeckCardCountMarkerRepositoryImpl {
        if (!DeckCardCountMarkerRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            DeckCardCountMarkerRepositoryImpl.instance = new DeckCardCountMarkerRepositoryImpl(textureManager, scene);
        }
        return DeckCardCountMarkerRepositoryImpl.instance;
    }

    public async createDeckCardCountMarker(deckId: number, cardId: number, position: Vector2d): Promise<DeckCardCountMarker> {
        const texture = await this.textureManager.getTexture('card_count_notation', 0);
        if (!texture) {
            throw new Error(`Texture for Deck Card Count Marker(Deck ID: ${deckId}, Card ID: ${cardId}) not found`);
        }

        const markerWidth = this.MARKER_WIDTH * window.innerWidth;
        const markerHeight = markerWidth;

        const markerPositionX = position.getX() * window.innerWidth;
        const markerPositionY = position.getY() * window.innerHeight;

        const markerMesh = MeshGenerator.createMesh(texture, markerWidth, markerHeight, position);
        markerMesh.position.set(markerPositionX, markerPositionY, 0);

        const newMarker = new DeckCardCountMarker(markerMesh, position);
        this.markerMap.set(newMarker.id, { cardId, markerMesh: newMarker });

        if (!this.deckMap.has(deckId)) {
            this.deckMap.set(deckId, []);
        }
        const markerIdList = this.deckMap.get(deckId)!;
        markerIdList.push(newMarker.id);
        this.deckMap.set(deckId, markerIdList);

        return newMarker;
    }

    public findMarkerByCardId(cardId: number): DeckCardCountMarker | null {
        for (const { cardId: storedCardId, markerMesh } of this.markerMap.values()) {
            if (storedCardId === cardId) {
                return markerMesh;
            }
        }
        return null;
    }

    public findMarkerByMarkerId(markerId: number): DeckCardCountMarker | null {
        return this.markerMap.get(markerId)?.markerMesh ?? null;
    }

    public findCardIdByMarkerId(markerId: number): number | null {
        return this.markerMap.get(markerId)?.cardId ?? null;
    }

    public findMarkerByDeckIdAndCardId(deckId: number, cardId: number): DeckCardCountMarker | null {
        const markerIdList = this.deckMap.get(deckId);
        if (!markerIdList) {
            return null;
        }

        for (const markerId of markerIdList) {
            const marker = this.markerMap.get(markerId);
            if (marker && marker.cardId === cardId) {
                return marker.markerMesh;
            }
        }
        return null;
    }

    public findMarkerIdByDeckIdAndCardId(deckId: number, cardId: number): number | null {
        const markerIdList = this.deckMap.get(deckId);
        if (!markerIdList) {
            return null;
        }

        for (const markerId of markerIdList) {
            const marker = this.markerMap.get(markerId);
            if (marker && marker.cardId === cardId) {
                return markerId;
            }
        }
        return null;
    }

    public findMarkerListByDeckId(deckId: number): DeckCardCountMarker[] | null {
        const markerIdList = this.deckMap.get(deckId);
        if (markerIdList === undefined) {
            return null;
        }

        const markerMeshList: DeckCardCountMarker[] = [];
        markerIdList.forEach((markerId) => {
            const markerMesh = this.findMarkerByMarkerId(markerId);
            if (markerMesh) {
                markerMeshList.push(markerMesh);
            } else {
                console.warn(`[WARN] Marker with Unique ID ${markerId} not found in markerMap`);
            }
        });

        return markerMeshList;
    }

    public findMarkerIdListByDeckId(deckId: number): number[] {
        return this.deckMap.get(deckId) || [];
    }

    public findDeckIdList(): number[] {
        return Array.from(this.deckMap.keys());
    }

    public findMarkerCountByDeckId(deckId: number): number {
        const markerIdList = this.deckMap.get(deckId);
        return markerIdList ? markerIdList.length : 0;
    }

    public saveMarkerGroupByDeckId(deckId: number): void {
        const markerIdList = this.deckMap.get(deckId);
        if (!markerIdList) {
            throw new Error(`Marker ID List (with Deck ID: ${deckId}) Not Found`);
        }

        const markerGroup = new THREE.Group();
        markerIdList.forEach(markerId => {
            const marker = this.markerMap.get(markerId);
            if (marker) {
                markerGroup.add(marker.markerMesh.getMesh());
            } else {
                console.warn(`[WARN] Marker with Unique ID ${markerId} not found in markerMap`);
            }
        });

        this.markerGroupMap.set(deckId, markerGroup);
    }

    public findMarkerGroupByDeckId(deckId: number): THREE.Group {
        const markerGroup = this.markerGroupMap.get(deckId);
        if (!markerGroup) {
            throw new Error(`Marker Group (with Deck ID: ${deckId}) not found`);
        }
        return markerGroup;
    }

    public resetMarkerGroup(): void {
        this.markerGroupMap.clear();
    }

    // 특정 덱의 특정 마커 삭제
    public deleteMarkerByDeckIdAndMarkerId(deckId: number, markerId: number): void {
        const markerInfo = this.markerMap.get(markerId);
        if (markerInfo) {
            this.markerMap.delete(markerId);
        }

        const markerIdList = this.deckMap.get(deckId);
        if (markerIdList) {
            const updatedList = markerIdList.filter(id => id !== markerId);
            this.deckMap.set(deckId, updatedList);

//             if (updatedList.length === 0) {
//                 this.deckMap.delete(deckId);
//             }
        }
    }

    public deleteMarkerMesh(deckId: number, markerId: number): void {
        const markerInfo = this.markerMap.get(markerId);
        if (markerInfo) {
            this.meshDestroyer.destroyMesh(markerInfo.markerMesh.getMesh());

            const group = this.markerGroupMap.get(deckId);
            if (group) {
                group.remove(markerInfo.markerMesh.getMesh());
            }
        }
    }

    public deleteAllMarker(): void {
        this.deckMap.clear();
        this.markerMap.clear();
    }

    // 특정 덱 삭제
    public deleteDeckByDeckId(deckId: number): void {
        const group = this.markerGroupMap.get(deckId);
        if (group) {
            this.meshDestroyer.destroyGroup(group);
            this.markerGroupMap.delete(deckId);
        }

        const markerIdList = this.findMarkerIdListByDeckId(deckId);
        if (markerIdList) {
            markerIdList.forEach((markerId) => {
                this.markerMap.delete(markerId);
            });
        }

        this.deckMap.delete(deckId);
    }

    // 원본 데이터 복제
    public saveClonedOriginalDeckState(deckId: number): void {
        this.originalMarkerMap.clear();
        this.originalDeckMap.set(deckId, [...(this.deckMap.get(deckId) || [])]);

        const markerIdList = this.deckMap.get(deckId);
        if (!markerIdList) {
            console.warn(`[WARN] No markerIdList for deck ${deckId}`);
            return;
        }

        markerIdList.forEach(markerId => {
            const entry = this.markerMap.get(markerId);
            if (entry) {
                const originalMesh = entry.markerMesh.getMesh();
                const clonedMesh = originalMesh.clone(true);
                const clonedPosition = entry.markerMesh.position.clone ? entry.markerMesh.position.clone() : entry.markerMesh.position;
                const clonedWrapper = new DeckCardCountMarker(clonedMesh, clonedPosition);

                this.originalMarkerMap.set(markerId, {
                    cardId: entry.cardId,
                    markerMesh: clonedWrapper
                });

            } else {
                console.warn(`[WARN] markerId ${markerId} not found in markerMap`);
            }
        });

        // To-do: 확인 후 삭제하기
        console.log(
            `%c[INFO] Original deck state cloned and stored for deckId ${deckId}`, 'color: #2E9AFE; font-weight: bold;');
        console.log(
            'originalMarkerMap:',
            Array.from(this.originalMarkerMap.entries()).map(([id, data]) => ({
                markerId: id,
                cardId: data.cardId
            }))
        );
    }

    public restoreOriginalDeckState(deckId: number): void {
        const originalMarkerIdList = this.originalDeckMap.get(deckId);
        if (originalMarkerIdList) {
            this.deckMap.set(deckId, [...originalMarkerIdList]);
        }

        const markerIdList = this.deckMap.get(deckId);
        if (!markerIdList) return;

        markerIdList.forEach(markerId => {
            const originalMarkerInfo = this.originalMarkerMap.get(markerId);
            if (originalMarkerInfo) {
                const currentMarkerInfo = this.markerMap.get(markerId);
                if (currentMarkerInfo) {
                    this.meshDestroyer.destroyMesh(currentMarkerInfo.markerMesh.getMesh());
                }

                this.markerMap.set(markerId, {
                    cardId: originalMarkerInfo.cardId,
                    markerMesh: originalMarkerInfo.markerMesh
                });

                const group = this.markerGroupMap.get(deckId);
                if (group) {
                    originalMarkerInfo.markerMesh.setVisibility(false);
                    group.add(originalMarkerInfo.markerMesh.getMesh());
                }
            }
        });

        // To-do: 확인 후 없애야 함
        const restoredData = markerIdList.map(markerId => {
            const data = this.markerMap.get(markerId);
            return data ? {
                markerId,
                cardId: data.cardId,
                markerMesh: data.markerMesh
            } : { markerId, cardId: null, markerMesh: null };
        });

        console.log(
            `%c[덱 편집 중단 후 다른 덱 버튼을 눌렀을 때] Deck ${deckId} restored.`,
            'color: #2E9AFE; font-weight: bold;'
        );
        console.log('복원된 mesh 데이터:', restoredData);
    }

}
