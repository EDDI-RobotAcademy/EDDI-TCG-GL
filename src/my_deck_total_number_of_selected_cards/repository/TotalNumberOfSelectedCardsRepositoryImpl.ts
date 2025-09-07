import * as THREE from 'three';
import {TotalNumberOfSelectedCardsRepository} from './TotalNumberOfSelectedCardsRepository';
import {TotalNumberOfSelectedCards} from "../entity/TotalNumberOfSelectedCards";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {MeshDestroyer} from "../../mesh/destroyer"

export class TotalNumberOfSelectedCardsRepositoryImpl implements TotalNumberOfSelectedCardsRepository {
    private static instance: TotalNumberOfSelectedCardsRepositoryImpl;
    private numberMap: Map<number, { numberId: number, totalCardCount: number, numberMesh: TotalNumberOfSelectedCards }> = new Map();
    private originalNumberMap: Map<number, { numberId: number, totalCardCount: number, numberMesh: TotalNumberOfSelectedCards }> = new Map();

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private readonly NUMBER_WIDTH: number = 0.013
    private readonly NUMBER_POSITION_X: number = 0.444
    private readonly NUMBER_POSITION_Y: number = 0.308

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): TotalNumberOfSelectedCardsRepositoryImpl {
        if (!TotalNumberOfSelectedCardsRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            TotalNumberOfSelectedCardsRepositoryImpl.instance = new TotalNumberOfSelectedCardsRepositoryImpl(textureManager, scene);
        }
        return TotalNumberOfSelectedCardsRepositoryImpl.instance;
    }

    public async createTotalNumberOfSelectedCards(deckId: number, count: number): Promise<TotalNumberOfSelectedCards> {
        const texture = await this.textureManager.getTexture('card_count', count);
        if (!texture) {
            throw new Error(`[My Deck Edit] Card Count texture not found`);
        }

        const numberWidth = this.NUMBER_WIDTH * window.innerWidth;
        const numberHeight = numberWidth;

        const position = new Vector2d(this.NUMBER_POSITION_X, this.NUMBER_POSITION_Y);

        const numberPositionX = position.getX() * window.innerWidth;
        const numberPositionY = position.getY() * window.innerHeight;

        const numberMesh = MeshGenerator.createMesh(texture, numberWidth, numberHeight, position);
        numberMesh.position.set(numberPositionX, numberPositionY, 0);

        const newNumber = new TotalNumberOfSelectedCards(numberMesh, position);
        this.numberMap.set(deckId, { numberId: newNumber.id, totalCardCount: count, numberMesh: newNumber });

        return newNumber;
    }

    public findNumberByDeckId(deckId: number): TotalNumberOfSelectedCards | null {
        return this.numberMap.get(deckId)?.numberMesh ?? null;
    }

    public findTotalCardCountByDeckId(deckId: number): number | null {
        return this.numberMap.get(deckId)?.totalCardCount ?? null;
    }

    public findNumberIdByDeckId(deckId: number): number | null {
        return this.numberMap.get(deckId)?.numberId ?? null;
    }

    public findDeckIdList(): number[] {
        return Array.from(this.numberMap.keys());
    }

    public deleteNumberByDeckId(deckId: number): void {
        const numberInfo = this.numberMap.get(deckId);
        if (numberInfo) {
            this.meshDestroyer.destroyMesh(numberInfo.numberMesh.getMesh());
        }
        this.numberMap.delete(deckId);
    }

    public deleteAll(): void {
        const deckIdList = this.findDeckIdList();
        for (const deckId of deckIdList) {
            this.deleteNumberByDeckId(deckId);
        }

        this.numberMap.clear();
    }

    public saveClonedOriginalDeckState(deckId: number): void {
        this.originalNumberMap.clear();

        const entry = this.numberMap.get(deckId);
        if (entry) {
            const originalMesh = entry.numberMesh.getMesh();
            const clonedMesh = originalMesh.clone(true);
            const clonedPosition = entry.numberMesh.position.clone ? entry.numberMesh.position.clone() : entry.numberMesh.position;
            const clonedWrapper = new TotalNumberOfSelectedCards(clonedMesh, clonedPosition);

            this.originalNumberMap.set(deckId, {
                numberId: entry.numberId,
                totalCardCount: entry.totalCardCount,
                numberMesh: clonedWrapper
            });
        } else {
            console.warn(`[WARN] deckId ${deckId} not found in numberMap`);
        }

        // To-do: 확인 후 삭제하기
        console.log(
            `%c[INFO] Original deck state cloned and stored for deckId ${deckId}`, 'color: #2E9AFE; font-weight: bold;');
        console.log(
            'originalNumberMap:',
            Array.from(this.originalNumberMap.entries()).map(([id, data]) => ({
                deckId: id,
                numberId: data.numberId,
                totalCardCount: data.totalCardCount
            }))
        );
    }

    public restoreOriginalDeckState(deckId: number): void {
        const originalNumberInfo = this.originalNumberMap.get(deckId);
        if (originalNumberInfo) {
            // 기존 numberMap의 mesh를 삭제/교체
            const currentNumberInfo = this.numberMap.get(deckId);
            if (currentNumberInfo) {
                // 현재 mesh를 scene에서 제거
                this.meshDestroyer.destroyMesh(currentNumberInfo.numberMesh.getMesh());
            }
            // 원래대로 복원
            this.numberMap.set(deckId, {
                numberId: originalNumberInfo.numberId,
                totalCardCount: originalNumberInfo.totalCardCount,
                numberMesh: originalNumberInfo.numberMesh
            });

            // To-do: scene 에 다시 추가해야 함,,
        }
    }

}
