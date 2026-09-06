import {OpponentFieldCardAttributeMarkScene} from "../entity/OpponentFieldCardAttributeMarkScene";

export interface OpponentFieldCardAttributeMarkSceneRepository {
    save(scene: OpponentFieldCardAttributeMarkScene): Promise<OpponentFieldCardAttributeMarkScene>;
    findById(id: number): Promise<OpponentFieldCardAttributeMarkScene | null>;
    findAll(): Promise<OpponentFieldCardAttributeMarkScene[]>;
    deleteById(id: number): Promise<boolean>;
    deleteAll(): Promise<void>;
}
