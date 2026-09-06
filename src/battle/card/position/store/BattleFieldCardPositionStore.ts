import { BattleFieldCardPosition } from "../entity/BattleFieldCardPosition";

export interface BattleFieldCardPositionStore {
    save(position: BattleFieldCardPosition): BattleFieldCardPosition;
    findById(id: number): BattleFieldCardPosition | undefined;
    findAll(): BattleFieldCardPosition[];
    deleteById(id: number): boolean;
    deleteAll(): void;
    count(): number;
    extractById(id: number): BattleFieldCardPosition | undefined
}