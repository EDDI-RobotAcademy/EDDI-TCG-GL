import {Vector2d} from "../../common/math/Vector2d";
import {MyDeckNameTextPosition} from "../entity/MyDeckNameTextPosition";
import {MyDeckNameTextPositionRepository} from "./MyDeckNameTextPositionRepository";

export class MyDeckNameTextPositionRepositoryImpl implements MyDeckNameTextPositionRepository {
    private static instance: MyDeckNameTextPositionRepositoryImpl;
//     private positionMap: Map<number, MyDeckNameTextPosition>;
//     private deckToPositionMap: Map<number, number>;
    private positionMap: Map<number, { deckId: number, position: MyDeckNameTextPosition}> = new Map();;

    private initialX = - 0.398;
    private initialY = 0.153;
    private incrementY = - 0.075;
    private maxNameTextsPerPage = 6;
    private positionIndex = 0;

    private constructor() {
//         this.positionMap = new Map<number, MyDeckNameTextPosition>();
//         this.deckToPositionMap = new Map<number, number>();
    }

    public static getInstance(): MyDeckNameTextPositionRepositoryImpl {
        if (!MyDeckNameTextPositionRepositoryImpl.instance) {
            MyDeckNameTextPositionRepositoryImpl.instance = new MyDeckNameTextPositionRepositoryImpl();
        }
        return MyDeckNameTextPositionRepositoryImpl.instance;
    }

    public addMyDeckNameTextPosition(deckId: number): MyDeckNameTextPosition {
        if (this.containsDeckIdInMap(deckId) == false) {
            this.positionIndex++;
        }

        const positionX = this.initialX;
//         const positionY = this.initialY + ((deckId - 1) % this.maxNameTextsPerPage) * this.incrementY;
        const positionY = this.initialY + (this.positionIndex - 1) * this.incrementY;

        const position = new MyDeckNameTextPosition(positionX, positionY);
        return position;
    }

    save(deckId: number, position: MyDeckNameTextPosition): void {
//         this.positionMap.set(position.id, position);
//         this.deckToPositionMap.set(deckId, position.id);
        this.positionMap.set(position.id, {deckId, position: position});
    }

    findById(positionId: number): MyDeckNameTextPosition | undefined {
        const position = this.positionMap.get(positionId);
        return position ? position.position : undefined;
    }

    findAll(): MyDeckNameTextPosition[] {
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

    deleteById(positionId: number): void {
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
        this.positionIndex = this.positionMap.size; // 인덱스 감소 처리
    }

    deleteAll(): void {
        this.positionMap.clear();
    }

    count(): number {
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
