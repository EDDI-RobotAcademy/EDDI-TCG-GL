import {BattleFieldCardAttributeMark} from "../entity/BattleFieldCardAttributeMark";

export interface BattleFieldCardAttributeMarkStore {
    save(attributeMark: BattleFieldCardAttributeMark): Promise<BattleFieldCardAttributeMark>;
    findById(id: number): Promise<BattleFieldCardAttributeMark | null>;
    findAll(): Promise<BattleFieldCardAttributeMark[]>;
    deleteById(id: number): Promise<boolean>;
    deleteAll(): Promise<void>;
}