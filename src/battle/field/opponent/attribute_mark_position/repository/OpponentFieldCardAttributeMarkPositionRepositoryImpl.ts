import {OpponentFieldCardAttributeMarkPositionRepository} from "./OpponentFieldCardAttributeMarkPositionRepository";
import {OpponentFieldCardAttributeMarkPosition} from "../entity/OpponentFieldCardAttributeMarkPosition";

export class OpponentFieldCardAttributeMarkPositionRepositoryImpl implements OpponentFieldCardAttributeMarkPositionRepository {
    private static instance: OpponentFieldCardAttributeMarkPositionRepositoryImpl;
    private positions: OpponentFieldCardAttributeMarkPosition[] = [];

    private constructor() {}

    public static getInstance(): OpponentFieldCardAttributeMarkPositionRepositoryImpl {
        if (!OpponentFieldCardAttributeMarkPositionRepositoryImpl.instance) {
            OpponentFieldCardAttributeMarkPositionRepositoryImpl.instance = new OpponentFieldCardAttributeMarkPositionRepositoryImpl();
        }
        return OpponentFieldCardAttributeMarkPositionRepositoryImpl.instance;
    }

    async save(position: OpponentFieldCardAttributeMarkPosition): Promise<OpponentFieldCardAttributeMarkPosition> {
        this.positions.push(position);
        return position;
    }

    async findById(id: number): Promise<OpponentFieldCardAttributeMarkPosition | null> {
        const position = this.positions.find(p => p.id === id);
        return position || null;
    }

    async findAll(): Promise<OpponentFieldCardAttributeMarkPosition[]> {
        return this.positions;
    }

    async deleteById(id: number): Promise<void> {
        this.positions = this.positions.filter(p => p.id !== id);
    }

    async deleteAll(): Promise<void> {
        this.positions = [];
    }
}
