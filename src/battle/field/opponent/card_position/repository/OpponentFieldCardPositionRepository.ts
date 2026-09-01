import {OpponentFieldCardPosition} from "../entity/OpponentFieldCardPosition";

export interface OpponentFieldCardPositionRepository {
    save(position: OpponentFieldCardPosition): OpponentFieldCardPosition;
    findById(id: number): OpponentFieldCardPosition | undefined;
    findAll(): OpponentFieldCardPosition[];
    deleteById(id: number): boolean;
    deleteAll(): void;
    count(): number;
    extractById(id: number): OpponentFieldCardPosition | undefined
}