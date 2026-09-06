import { BattleFieldCardPosition } from "../entity/BattleFieldCardPosition";
import { BattleFieldCardPositionStore } from "./BattleFieldCardPositionStore";

export class BattleFieldCardPositionStoreImpl implements BattleFieldCardPositionStore {
    private static instance: BattleFieldCardPositionStoreImpl;
    private positionMap: Map<number, BattleFieldCardPosition>;

    private constructor() {
        this.positionMap = new Map<number, BattleFieldCardPosition>();
    }

    public static getInstance(): BattleFieldCardPositionStoreImpl {
        if (!BattleFieldCardPositionStoreImpl.instance) {
            BattleFieldCardPositionStoreImpl.instance = new BattleFieldCardPositionStoreImpl();
        }
        return BattleFieldCardPositionStoreImpl.instance;
    }

    save(position: BattleFieldCardPosition): BattleFieldCardPosition {
        this.positionMap.set(position.id, position);
        return position
    }

    findById(id: number): BattleFieldCardPosition | undefined {
        return this.positionMap.get(id);
    }

    findAll(): BattleFieldCardPosition[] {
        return Array.from(this.positionMap.values());
    }

    deleteById(id: number): boolean {
        return this.positionMap.delete(id);
    }

    deleteAll(): void {
        this.positionMap.clear();
    }

    count(): number {
        return this.positionMap.size;
    }

    extractById(id: number): BattleFieldCardPosition | undefined {
        const position = this.positionMap.get(id);
        if (position) {
            this.positionMap.delete(id);
        }
        return position;
    }
}
