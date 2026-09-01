import {OpponentFieldCardPositionRepository} from "./OpponentFieldCardPositionRepository";
import {OpponentFieldCardPosition} from "../entity/OpponentFieldCardPosition";

export class OpponentFieldCardPositionRepositoryImpl implements OpponentFieldCardPositionRepository {
    private static instance: OpponentFieldCardPositionRepositoryImpl;
    private positionMap: Map<number, OpponentFieldCardPosition>;

    private constructor() {
        this.positionMap = new Map<number, OpponentFieldCardPosition>();
    }

    public static getInstance(): OpponentFieldCardPositionRepositoryImpl {
        if (!OpponentFieldCardPositionRepositoryImpl.instance) {
            OpponentFieldCardPositionRepositoryImpl.instance = new OpponentFieldCardPositionRepositoryImpl();
        }
        return OpponentFieldCardPositionRepositoryImpl.instance;
    }

    save(position: OpponentFieldCardPosition): OpponentFieldCardPosition {
        this.positionMap.set(position.id, position);
        return position
    }

    findById(id: number): OpponentFieldCardPosition | undefined {
        return this.positionMap.get(id);
    }

    findAll(): OpponentFieldCardPosition[] {
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

    extractById(id: number): OpponentFieldCardPosition | undefined {
        const position = this.positionMap.get(id);
        if (position) {
            this.positionMap.delete(id);
        }
        return position;
    }
}
