
import { BattleFieldCardAttributeMarkPositionRepository } from "./BattleFieldCardAttributeMarkPositionRepository";
import {BattleFieldCardAttributeMarkPosition} from "../entity/BattleFieldCardAttributeMarkPosition";

export class BattleFieldCardAttributeMarkPositionRepositoryImpl implements BattleFieldCardAttributeMarkPositionRepository {
    private static instance: BattleFieldCardAttributeMarkPositionRepositoryImpl;
    private positions: BattleFieldCardAttributeMarkPosition[] = [];

    private constructor() {}

    public static getInstance(): BattleFieldCardAttributeMarkPositionRepositoryImpl {
        if (!BattleFieldCardAttributeMarkPositionRepositoryImpl.instance) {
            BattleFieldCardAttributeMarkPositionRepositoryImpl.instance = new BattleFieldCardAttributeMarkPositionRepositoryImpl();
        }
        return BattleFieldCardAttributeMarkPositionRepositoryImpl.instance;
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
