import {DeckDeleteButtonPosition} from "../entity/DeckDeleteButtonPosition";

export interface DeckDeleteButtonPositionRepository {
    findPositionByPositionId(positionId: number): DeckDeleteButtonPosition | null;
    findAllPosition(): DeckDeleteButtonPosition[];
    deleteByPositionId(positionId: number): void;
    deleteAll(): void;
    count(): number;
}