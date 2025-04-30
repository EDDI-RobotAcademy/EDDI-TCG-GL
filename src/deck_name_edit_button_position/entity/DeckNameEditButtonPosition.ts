import {IdGenerator} from "../../common/id_generator/IdGenerator";
import {Vector2d} from "../../common/math/Vector2d";

export class DeckNameEditButtonPosition {
    id: number;
    position: Vector2d;

    constructor(x: number = 0, y: number = 0) {
        this.id = IdGenerator.generateId("DeckNameEditButtonPosition");
        this.position = new Vector2d(x, y);
    }

    setPosition(x: number, y: number): void {
        this.position.setVector2d(x, y);
    }

    getX(): number {
        return this.position.getX();
    }

    getY(): number {
        return this.position.getY();
    }
}