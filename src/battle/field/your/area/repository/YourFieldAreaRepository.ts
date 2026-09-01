import {YourFieldArea} from "../entity/YourFieldArea";

export interface YourFieldAreaRepository {
    save(entity: YourFieldArea): void;
    findById(id: number): YourFieldArea | null;
    deleteById(id: number): void;
    createYourFieldArea(xPos: number, yPos: number, width: number, height: number): YourFieldArea
}
