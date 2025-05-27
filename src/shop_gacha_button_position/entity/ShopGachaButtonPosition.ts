import { Vector2d } from "../../common/math/Vector2d";

export class ShopGachaButtonPosition {
    private readonly _id: number;
    private readonly _position: Vector2d;

    constructor(id: number, x: number = 0, y: number = 0) {
        if (id < 1) {
            throw new Error('Button ID must be positive');
        }
        this._id = id;
        this._position = new Vector2d(x, y);
    }

    get id(): number {
        return this._id;
    }

    setPosition(x: number, y: number): void {
        this._position.setVector2d(x, y);
    }

    getX(): number {
        return this._position.getX();
    }

    getY(): number {
        return this._position.getY();
    }
} 