import {BattleFieldCardAttributeMarkPosition} from "../entity/BattleFieldCardAttributeMarkPosition";

export interface BattleFieldCardAttributeMarkPositionRepository {
    save(position: BattleFieldCardAttributeMarkPosition): Promise<BattleFieldCardAttributeMarkPosition>;
    findById(id: number): Promise<BattleFieldCardAttributeMarkPosition | null>;
    findAll(): Promise<BattleFieldCardAttributeMarkPosition[]>;
    deleteById(id: number): Promise<void>;
    deleteAll(): Promise<void>;
}
