import {Vector2d} from "../../../../../common/math/Vector2d";
import {OpponentFieldCardScene} from "../entity/OpponentFieldCardScene";

export interface OpponentFieldCardSceneRepository {
    count(): number
    create(cardId: number, position: Vector2d): Promise<OpponentFieldCardScene>;
    findById(id: number): OpponentFieldCardScene | undefined;
    findAll(): OpponentFieldCardScene[];
    deleteById(id: number): boolean;
    deleteAll(): void;
    extractByIndex(index: number): OpponentFieldCardScene | undefined
}