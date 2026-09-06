import {OpponentFieldCardAttributeMarkPosition} from "../entity/OpponentFieldCardAttributeMarkPosition";

export interface OpponentFieldCardAttributeMarkPositionRepository {
    save(position: OpponentFieldCardAttributeMarkPosition): Promise<OpponentFieldCardAttributeMarkPosition>;
    findById(id: number): Promise<OpponentFieldCardAttributeMarkPosition | null>;
    findAll(): Promise<OpponentFieldCardAttributeMarkPosition[]>;
    deleteById(id: number): Promise<void>;
    deleteAll(): Promise<void>;
}
