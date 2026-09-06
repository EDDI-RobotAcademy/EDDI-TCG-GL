import {BattleFieldCardAttributeMarkRepository} from "./BattleFieldCardAttributeMarkRepository";
import {BattleFieldCardAttributeMark} from "../entity/BattleFieldCardAttributeMark";

export class BattleFieldCardAttributeMarkRepositoryImpl implements BattleFieldCardAttributeMarkRepository {
    private static instance: BattleFieldCardAttributeMarkRepositoryImpl;
    private attributeMarks: BattleFieldCardAttributeMark[] = [];

    private constructor() {}

    public static getInstance(): BattleFieldCardAttributeMarkRepositoryImpl {
        if (!BattleFieldCardAttributeMarkRepositoryImpl.instance) {
            BattleFieldCardAttributeMarkRepositoryImpl.instance = new BattleFieldCardAttributeMarkRepositoryImpl();
        }
        return BattleFieldCardAttributeMarkRepositoryImpl.instance;
    }

    async save(attributeMark: BattleFieldCardAttributeMark): Promise<BattleFieldCardAttributeMark> {
        this.attributeMarks.push(attributeMark);
        return attributeMark;
    }

    async findById(id: number): Promise<BattleFieldCardAttributeMark | null> {
        return this.attributeMarks.find(attributeMark => attributeMark.id === id) || null;
    }

    async findAll(): Promise<BattleFieldCardAttributeMark[]> {
        return this.attributeMarks;
    }

    async deleteById(id: number): Promise<boolean> {
        const index = this.attributeMarks.findIndex(attributeMark => attributeMark.id === id);
        if (index !== -1) {
            this.attributeMarks.splice(index, 1);
            return true;
        }
        return false;
    }

    async deleteAll(): Promise<void> {
        this.attributeMarks = [];
    }
}