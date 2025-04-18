import {DeckEditButtonPosition} from "../entity/DeckEditButtonPosition";

export interface DeckEditButtonPositionRepository {
    findPositionByPositionId(positionId: number): DeckEditButtonPosition | null;
    findAllPosition(): DeckEditButtonPosition[];
    deleteByPositionId(positionId: number): void;
    deleteAll(): void;
    count(): number;
}