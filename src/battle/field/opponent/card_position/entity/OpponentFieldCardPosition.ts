import {IdGenerator} from "../../../../../common/id_generator/IdGenerator";
import {Vector2d} from "../../../../../common/math/Vector2d";

export class OpponentFieldCardPosition {
    id: number;
    position: Vector2d;

    constructor(x: number = 0, y: number = 0) {
        this.id = IdGenerator.generateId("OpponentFieldCardPosition");
        this.position = new Vector2d(x, y);
    }

    getId(): number {
        return this.id;
    }

    getPosition(): Vector2d {
        return this.position
    }

    setPosition(x: number, y: number): void {
        this.position.setVector2d(x, y);
    }

    moveBy(vector: Vector2d): void {
        this.position.add(vector);
    }

    getX(): number {
        return this.position.getX();
    }

    getY(): number {
        return this.position.getY();
    }
}