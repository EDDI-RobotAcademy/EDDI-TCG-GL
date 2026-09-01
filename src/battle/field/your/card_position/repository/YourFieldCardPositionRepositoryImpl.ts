
import {YourFieldCardPositionRepository} from "./YourFieldCardPositionRepository";
import {YourFieldCardPosition} from "../entity/YourFieldCardPosition";

export class YourFieldCardPositionRepositoryImpl implements YourFieldCardPositionRepository {
    private static instance: YourFieldCardPositionRepositoryImpl;
    private positionMap: Map<number, YourFieldCardPosition>;

    private constructor() {
        this.positionMap = new Map<number, YourFieldCardPosition>();
    }

    public static getInstance(): YourFieldCardPositionRepositoryImpl {
        if (!YourFieldCardPositionRepositoryImpl.instance) {
            YourFieldCardPositionRepositoryImpl.instance = new YourFieldCardPositionRepositoryImpl();
        }
        return YourFieldCardPositionRepositoryImpl.instance;
    }

    save(position: YourFieldCardPosition): YourFieldCardPosition {
        this.positionMap.set(position.id, position);
        return position
    }

    findById(id: number): YourFieldCardPosition | undefined {
        return this.positionMap.get(id);
    }

    findAll(): YourFieldCardPosition[] {
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

    extractById(id: number): YourFieldCardPosition | undefined {
        const position = this.positionMap.get(id);
        if (position) {
            this.positionMap.delete(id);
        }
        return position;
    }
}
