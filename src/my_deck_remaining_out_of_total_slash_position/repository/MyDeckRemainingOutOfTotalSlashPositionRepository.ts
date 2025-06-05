import {MyDeckRemainingOutOfTotalSlashPosition} from "../entity/MyDeckRemainingOutOfTotalSlashPosition";

export interface MyDeckRemainingOutOfTotalSlashPositionRepository {
    findPositionByPositionId(positionId: number): MyDeckRemainingOutOfTotalSlashPosition | null;
    findPositionIdList(): number[];
    deleteById(positionId: number): boolean;
    deleteAll(): void;
    count(): number;
}