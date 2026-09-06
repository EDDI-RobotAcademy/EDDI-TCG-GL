
import { BattleFieldCardAttributeMarkPositionStore } from "./BattleFieldCardAttributeMarkPositionStore";
import {BattleFieldCardAttributeMarkPosition} from "../entity/BattleFieldCardAttributeMarkPosition";

export class BattleFieldCardAttributeMarkPositionStoreImpl implements BattleFieldCardAttributeMarkPositionStore {
    private static instance: BattleFieldCardAttributeMarkPositionStoreImpl;
    private positions: BattleFieldCardAttributeMarkPosition[] = [];

    private constructor() {}

    public static getInstance(): BattleFieldCardAttributeMarkPositionStoreImpl {
        if (!BattleFieldCardAttributeMarkPositionStoreImpl.instance) {
            BattleFieldCardAttributeMarkPositionStoreImpl.instance = new BattleFieldCardAttributeMarkPositionStoreImpl();
        }
        return BattleFieldCardAttributeMarkPositionStoreImpl.instance;
    }

    async save(position: BattleFieldCardAttributeMarkPosition): Promise<BattleFieldCardAttributeMarkPosition> {
        this.positions.push(position);
        return position;
    }

    async findById(id: number): Promise<BattleFieldCardAttributeMarkPosition | null> {
        const position = this.positions.find(p => p.id === id);
        return position || null;
    }

    async findAll(): Promise<BattleFieldCardAttributeMarkPosition[]> {
        return this.positions;
    }

    async deleteById(id: number): Promise<void> {
        this.positions = this.positions.filter(p => p.id !== id);
    }

    async deleteAll(): Promise<void> {
        this.positions = [];
    }
}
