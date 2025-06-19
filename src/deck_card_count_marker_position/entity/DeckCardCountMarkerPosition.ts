import {IdGenerator} from "../../common/id_generator/IdGenerator";
import {Vector2d} from "../../common/math/Vector2d";

export class DeckCardCountMarkerPosition {
    id: number;
    position: Vector2d;

    constructor(x: number = 0, y: number = 0) {
        this.id = IdGenerator.generateId("DeckCardCountMarkerPosition");
        this.position = new Vector2d(x, y);
    }

    public setPosition(x: number, y: number): void {
        this.position.setVector2d(x, y);
    }

    public moveBy(vector: Vector2d): void {
        this.position.add(vector);
    }

    public getX(): number {
        return this.position.getX();
    }

    public getY(): number {
        return this.position.getY();
    }

}