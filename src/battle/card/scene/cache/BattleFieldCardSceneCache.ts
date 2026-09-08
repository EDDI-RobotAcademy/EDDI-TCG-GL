import {BattleFieldCardScene} from "../entity/BattleFieldCardScene";
import {Vector2d} from "../../../../common/math/Vector2d";

export interface BattleFieldCardSceneCache {
    count(): number
    create(cardId: number, position: Vector2d): Promise<BattleFieldCardScene>;
    findById(id: number): BattleFieldCardScene | undefined;
    findAll(): BattleFieldCardScene[];
    deleteById(id: number): boolean;
    deleteAll(): void;
    extractById(cardSceneId: number): BattleFieldCardScene | undefined
}