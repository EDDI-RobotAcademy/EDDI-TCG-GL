import {BattleFieldCardAttributeMark} from "../entity/BattleFieldCardAttributeMark";

export interface BattleFieldCardAttributeMarkRepository {
    save(attributeMark: BattleFieldCardAttributeMark): Promise<BattleFieldCardAttributeMark>;
    findById(id: number): Promise<BattleFieldCardAttributeMark | null>;
    findAll(): Promise<BattleFieldCardAttributeMark[]>;
    deleteById(id: number): Promise<boolean>;
    deleteAll(): Promise<void>;
}