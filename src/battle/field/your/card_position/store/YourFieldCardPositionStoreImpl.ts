
import {YourFieldCardPositionStore} from "./YourFieldCardPositionStore";
import {YourFieldCardPosition} from "../entity/YourFieldCardPosition";

export class YourFieldCardPositionStoreImpl implements YourFieldCardPositionStore {
    private static instance: YourFieldCardPositionStoreImpl;
    private positionMap: Map<number, YourFieldCardPosition>;

    private constructor() {
        this.positionMap = new Map<number, YourFieldCardPosition>();
    }

    public static getInstance(): YourFieldCardPositionStoreImpl {
        if (!YourFieldCardPositionStoreImpl.instance) {
            YourFieldCardPositionStoreImpl.instance = new YourFieldCardPositionStoreImpl();
        }
        return YourFieldCardPositionStoreImpl.instance;
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
