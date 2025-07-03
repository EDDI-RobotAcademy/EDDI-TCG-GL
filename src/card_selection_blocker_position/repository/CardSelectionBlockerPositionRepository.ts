import {CardSelectionBlockerPosition} from "../entity/CardSelectionBlockerPosition";

export interface CardSelectionBlockerPositionRepository {
    findPositionByPositionId(positionId: number): CardSelectionBlockerPosition | null;
    findPositionIdList(): number[];
    deleteById(positionId: number): void;
    deleteAll(): void;
    count(): number;
}