import {OpponentFieldCardAttributeMarkRepository} from "./OpponentFieldCardAttributeMarkRepository";
import {OpponentFieldCardAttributeMark} from "../entity/OpponentFieldCardAttributeMark";

export class OpponentFieldCardAttributeMarkRepositoryImpl implements OpponentFieldCardAttributeMarkRepository {
    private static instance: OpponentFieldCardAttributeMarkRepositoryImpl;
    private attributeMarks: OpponentFieldCardAttributeMark[] = [];

    private constructor() {}

    public static getInstance(): OpponentFieldCardAttributeMarkRepositoryImpl {
        if (!OpponentFieldCardAttributeMarkRepositoryImpl.instance) {
            OpponentFieldCardAttributeMarkRepositoryImpl.instance = new OpponentFieldCardAttributeMarkRepositoryImpl();
        }
        return OpponentFieldCardAttributeMarkRepositoryImpl.instance;
    }

    async save(attributeMark: OpponentFieldCardAttributeMark): Promise<OpponentFieldCardAttributeMark> {
        this.attributeMarks.push(attributeMark);
        return attributeMark;
    }

    async findById(id: number): Promise<OpponentFieldCardAttributeMark | null> {
        return this.attributeMarks.find(attributeMark => attributeMark.id === id) || null;
    }

    async findAll(): Promise<OpponentFieldCardAttributeMark[]> {
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