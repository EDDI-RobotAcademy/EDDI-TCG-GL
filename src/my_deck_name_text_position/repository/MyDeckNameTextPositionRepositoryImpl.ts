import {Vector2d} from "../../common/math/Vector2d";
import {MyDeckNameTextPosition} from "../entity/MyDeckNameTextPosition";
import {MyDeckNameTextPositionRepository} from "./MyDeckNameTextPositionRepository";

export class MyDeckNameTextPositionRepositoryImpl implements MyDeckNameTextPositionRepository {
    private static instance: MyDeckNameTextPositionRepositoryImpl;
    private positionMap: Map<number, { deckId: number, position: MyDeckNameTextPosition}> = new Map();

    private initialX = - 0.37;
    private initialY = 0.153;
    private incrementY = - 0.075;
    private maxNameTextsPerPage = 6;
    private positionIndex = 0;

    private constructor() {}

    public static getInstance(): MyDeckNameTextPositionRepositoryImpl {
        if (!MyDeckNameTextPositionRepositoryImpl.instance) {
            MyDeckNameTextPositionRepositoryImpl.instance = new MyDeckNameTextPositionRepositoryImpl();
        }
        return MyDeckNameTextPositionRepositoryImpl.instance;
    }

    public addMyDeckNameTextPosition(deckId: number): MyDeckNameTextPosition {
        if (this.containsDeckIdInMap(deckId)) {
            this.findPositionByDeckId(deckId);
        }

        const positionX = this.initialX;
        const positionY = this.initialY + this.positionMap.size * this.incrementY;

        const position = new MyDeckNameTextPosition(positionX, positionY);
        return position;
    }

    public save(deckId: number, position: MyDeckNameTextPosition): void {
        this.positionMap.set(position.id, {deckId, position: position});
    }

    public findById(positionId: number): MyDeckNameTextPosition | undefined {
        const position = this.positionMap.get(positionId);
        return position ? position.position : undefined;
    }

    public findAll(): MyDeckNameTextPosition[] {
        return Array.from(this.positionMap.values()).map(({ position }) => position);
    }

    public findPositionByDeckId(deckId: number): MyDeckNameTextPosition | null {
        for (const { deckId: storedDeckId, position } of this.positionMap.values()) {
            if (storedDeckId === deckId) {
                return position;
            }
        }
        return null;
    }

    public findPositionIdByDeckId(deckId: number): number | null {
        for (const [positionId, { deckId: storedDeckId }] of this.positionMap.entries()) {
            if (storedDeckId === deckId) {
                return positionId;
            }
        }
        return null;
    }

    public deleteById(positionId: number): void {
        this.positionMap.delete(positionId);

        let newPositionIndex = 0;
        const updatedPositionMap = new Map<number, { deckId: number, position: MyDeckNameTextPosition }>();

        for (const [key, { deckId, position }] of this.positionMap.entries()) {
            const newPositionY = this.initialY + (newPositionIndex * this.incrementY);
            position.setPosition(this.initialX, newPositionY);
            updatedPositionMap.set(key, { deckId, position }); // 기존 key 유지하면서 값 업데이트
            newPositionIndex++;
        }

        this.positionMap = updatedPositionMap; // 업데이트된 맵을 적용
    }

    public deleteByDeckId(deckId: number): void {
        const positionId = this.findPositionIdByDeckId(deckId);
        if (positionId == null) return;

        this.deleteById(positionId);
    }

    public deleteAll(): void {
        this.positionMap.clear();
    }

    public count(): number {
        return this.positionMap.size;
    }

    private containsDeckIdInMap(deckId: number): boolean {
        for (const { deckId: storedDeckId } of this.positionMap.values()) {
            if (storedDeckId === deckId) {
                return true;
            }
        }
        return false;
    }
}
