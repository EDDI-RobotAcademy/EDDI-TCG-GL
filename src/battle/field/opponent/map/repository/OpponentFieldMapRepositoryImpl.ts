import {OpponentFieldMapRepository} from "./OpponentFieldMapRepository";

export class OpponentFieldMapRepositoryImpl implements OpponentFieldMapRepository {
    private static instance: OpponentFieldMapRepositoryImpl;

    private currentOpponentFieldMap: Map<number, number> = new Map();

    private constructor() {
        this.currentOpponentFieldMap.set(0, 31);
        this.currentOpponentFieldMap.set(1, 32);
        this.currentOpponentFieldMap.set(2, 32);
        this.currentOpponentFieldMap.set(3, 26);
        this.currentOpponentFieldMap.set(4, 27);
    }

    public static getInstance(): OpponentFieldMapRepositoryImpl {
        if (!OpponentFieldMapRepositoryImpl.instance) {
            OpponentFieldMapRepositoryImpl.instance = new OpponentFieldMapRepositoryImpl();
        }
        return OpponentFieldMapRepositoryImpl.instance;
    }

    public addOpponentField(cardId: number): void {
        const newIndex = this.currentOpponentFieldMap.size;
        this.currentOpponentFieldMap.set(newIndex, cardId);
    }

    public getOpponentFieldList(): number[] {
        return Array.from(this.currentOpponentFieldMap.values()).filter(value => value !== -1);
    }

    public getCardIdByIndex(index: number): number | undefined {
        const cardId = this.currentOpponentFieldMap.get(index);
        return cardId !== -1 ? cardId : undefined;
    }

    public removeOpponentField(index: number): void {
        if (this.currentOpponentFieldMap.has(index)) {
            this.currentOpponentFieldMap.set(index, -1); // 또는 null
        }
    }
}