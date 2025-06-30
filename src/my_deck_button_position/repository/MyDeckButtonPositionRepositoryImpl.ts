import {Vector2d} from "../../common/math/Vector2d";
import { MyDeckButtonPosition } from "../entity/MyDeckButtonPosition";
import { MyDeckButtonPositionRepository } from "./MyDeckButtonPositionRepository";

export class MyDeckButtonPositionRepositoryImpl implements MyDeckButtonPositionRepository {
    private static instance: MyDeckButtonPositionRepositoryImpl;
    private positionMap: Map<number, { deckId: number, position: MyDeckButtonPosition}> = new Map();

    private initialX = - 0.38;
    private initialY = 0.153;
    private incrementY = - 0.075;
    private positionIndex = 0;

    private constructor() {}

    public static getInstance(): MyDeckButtonPositionRepositoryImpl {
        if (!MyDeckButtonPositionRepositoryImpl.instance) {
            MyDeckButtonPositionRepositoryImpl.instance = new MyDeckButtonPositionRepositoryImpl();
        }
        return MyDeckButtonPositionRepositoryImpl.instance;
    }

    public addMyDeckButtonPosition(deckId: number): MyDeckButtonPosition {
        if (this.containsDeckIdInMap(deckId)) {
            return this.findPositionByDeckId(deckId)!;
        }

        const positionX = this.initialX;
        const positionY = this.initialY + this.positionMap.size * this.incrementY;

        const position = new MyDeckButtonPosition(positionX, positionY);
        return position;
    }

    public save(deckId: number, position: MyDeckButtonPosition): void {
        this.positionMap.set(position.id, {deckId, position: position});
    }

    public findById(positionId: number): MyDeckButtonPosition | undefined {
        const position = this.positionMap.get(positionId);
        return position ? position.position : undefined;
    }

    public findAll(): MyDeckButtonPosition[] {
        return Array.from(this.positionMap.values()).map(({ position }) => position);
    }

    public findPositionByDeckId(deckId: number): MyDeckButtonPosition | null {
        for (const { deckId: storedDeckId, position } of this.positionMap.values()) {
            if (storedDeckId === deckId) {
                return position;
            }
        }
        return null;
    }

    public deleteById(positionId: number): void {
        this.positionMap.delete(positionId);

        let newPositionIndex = 0;
        const updatedPositionMap = new Map<number, { deckId: number, position: MyDeckButtonPosition }>();

        for (const [key, { deckId, position }] of this.positionMap.entries()) {
            const newPositionY = this.initialY + (newPositionIndex * this.incrementY);
            position.setPosition(this.initialX, newPositionY);
            updatedPositionMap.set(key, { deckId, position }); // 기존 key 유지하면서 값 업데이트
            newPositionIndex++;
        }

        this.positionMap = updatedPositionMap; // 업데이트된 맵을 적용
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
