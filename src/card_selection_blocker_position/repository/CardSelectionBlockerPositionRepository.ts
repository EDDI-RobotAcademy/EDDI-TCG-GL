import {CardSelectionBlockerPosition} from "../entity/CardSelectionBlockerPosition";

export interface CardSelectionBlockerPositionRepository {
    findPositionByPositionId(positionId: number): CardSelectionBlockerPosition | null;
    findPositionIdList(): number[];
    deleteById(positionId: number): boolean;
    deleteAll(): void;
    count(): number;
}