import {YourFieldCardPosition} from "../entity/YourFieldCardPosition";

export interface YourFieldCardPositionStore {
    save(position: YourFieldCardPosition): YourFieldCardPosition;
    findById(id: number): YourFieldCardPosition | undefined;
    findAll(): YourFieldCardPosition[];
    deleteById(id: number): boolean;
    deleteAll(): void;
    count(): number;
    extractById(id: number): YourFieldCardPosition | undefined
}