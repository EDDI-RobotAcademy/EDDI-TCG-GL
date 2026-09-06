import {OpponentFieldCardAttributeMark} from "../entity/OpponentFieldCardAttributeMark";

export interface OpponentFieldCardAttributeMarkRepository {
    save(attributeMark: OpponentFieldCardAttributeMark): Promise<OpponentFieldCardAttributeMark>;
    findById(id: number): Promise<OpponentFieldCardAttributeMark | null>;
    findAll(): Promise<OpponentFieldCardAttributeMark[]>;
    deleteById(id: number): Promise<boolean>;
    deleteAll(): Promise<void>;
}