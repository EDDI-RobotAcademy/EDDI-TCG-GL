import {BattleFieldCardAttributeMarkScene} from "../entity/BattleFieldCardAttributeMarkScene";

export interface BattleFieldCardAttributeMarkSceneRepository {
    save(scene: BattleFieldCardAttributeMarkScene): Promise<BattleFieldCardAttributeMarkScene>;
    findById(id: number): Promise<BattleFieldCardAttributeMarkScene | null>;
    findAll(): Promise<BattleFieldCardAttributeMarkScene[]>;
    deleteById(id: number): Promise<boolean>;
    deleteAll(): Promise<void>;
}
