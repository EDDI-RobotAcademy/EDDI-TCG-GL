import { Vector2d } from "../../common/math/Vector2d";

export type Anchor =
    | 'TL' | 'T' | 'TR'
    | 'L'  | 'C' | 'R'
    | 'BL' | 'B' | 'BR';

export function resolveAnchorPoint(anchor: Anchor, width: number, height: number): Vector2d {
    const halfW = width / 2;
    const halfH = height / 2;

    let x = 0;
    let y = 0;

    if (anchor === 'TL' || anchor === 'L' || anchor === 'BL') x = -halfW;
    if (anchor === 'TR' || anchor === 'R' || anchor === 'BR') x = halfW;

    if (anchor === 'TL' || anchor === 'T' || anchor === 'TR') y = halfH;
    if (anchor === 'BL' || anchor === 'B' || anchor === 'BR') y = -halfH;

    return new Vector2d(x, y);
}
