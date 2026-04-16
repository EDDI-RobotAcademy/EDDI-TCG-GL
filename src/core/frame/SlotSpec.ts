import { Vector2d } from "../../common/math/Vector2d";
import { Anchor } from "./Anchor";

export interface SlotSpec {
    readonly id: string;
    readonly anchor: Anchor;
    readonly offset: Vector2d;
    readonly widthRatio: number;
    readonly aspect: number;
    readonly renderOrder: number;
}
