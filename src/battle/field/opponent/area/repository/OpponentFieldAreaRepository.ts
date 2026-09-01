import {OpponentFieldArea} from "../entity/OpponentFieldArea";

export interface OpponentFieldAreaRepository {
    save(entity: OpponentFieldArea): void;
    findById(id: number): OpponentFieldArea | null;
    deleteById(id: number): void;
    createOpponentFieldArea(xPos: number, yPos: number, width: number, height: number): OpponentFieldArea
}
