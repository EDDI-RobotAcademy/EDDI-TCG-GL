import {BattleFieldCardAttributeMarkStore} from "./BattleFieldCardAttributeMarkStore";
import {BattleFieldCardAttributeMark} from "../entity/BattleFieldCardAttributeMark";

export class BattleFieldCardAttributeMarkStoreImpl implements BattleFieldCardAttributeMarkStore {
    private static instance: BattleFieldCardAttributeMarkStoreImpl;
    private attributeMarks: BattleFieldCardAttributeMark[] = [];

    private constructor() {}

    public static getInstance(): BattleFieldCardAttributeMarkStoreImpl {
        if (!BattleFieldCardAttributeMarkStoreImpl.instance) {
            BattleFieldCardAttributeMarkStoreImpl.instance = new BattleFieldCardAttributeMarkStoreImpl();
        }
        return BattleFieldCardAttributeMarkStoreImpl.instance;
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