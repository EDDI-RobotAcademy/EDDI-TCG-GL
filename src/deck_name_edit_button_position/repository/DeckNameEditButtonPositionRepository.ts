import {DeckNameEditButtonPosition} from "../entity/DeckNameEditButtonPosition";

export interface DeckNameEditButtonPositionRepository {
    findPositionByPositionId(positionId: number): DeckNameEditButtonPosition | null;
    findAllPosition(): DeckNameEditButtonPosition[];
    deleteByPositionId(positionId: number): void;
    deleteAll(): void;
    count(): number;
}