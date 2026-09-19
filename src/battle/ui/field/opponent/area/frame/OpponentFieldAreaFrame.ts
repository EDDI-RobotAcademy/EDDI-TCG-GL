import {AreaBounds, computeAreaBounds} from "../../../../../../core/frame/AreaBounds";

// Mirror of YourFieldAreaFrame across the horizontal axis. Legacy OpponentFieldAreaServiceImpl
// computes a positive yPos that would land above the viewport; the entity constructor silently
// overrides it with (h/2) - 0.347*h — the actually-correct opponent Y. V2 encodes the correct
// value directly in the Frame, no service/entity gymnastics.

export interface OpponentFieldAreaFrame {
    readonly color: number;
    readonly opacity: number;
    readonly widthPercent: number;
    readonly heightPercent: number;
    readonly xPercent: number;
    readonly yPercent: number;
    readonly renderOrder: number;
}

export function createDefaultOpponentFieldAreaFrame(): OpponentFieldAreaFrame {
    return {
        color: 0x000000,
        opacity: 0.1,
        widthPercent: 0.7,
        heightPercent: 0.23,
        xPercent: 0,
        // Mirror of your field: yPercent = +0.5 - 0.347 = +0.153
        yPercent: 0.5 - (0.024 * 3 + 0.11 * 2.5),
        renderOrder: 1,
    };
}

// 이 영역의 실제 자리.
//
// 전에는 이 함수가 없어서 화면이 같은 식을 손으로 두 번 적었다. 주석에 [내 필드 것과
// 같은 식] 이라고 적혀 있었다. 같은 식이 두 군데 있으면 하나를 고칠 때 나머지를 잊는다.
export function computeOpponentFieldAreaBounds(
    frame: OpponentFieldAreaFrame, viewportWidth: number, viewportHeight: number,
): AreaBounds {
    return computeAreaBounds(frame, viewportWidth, viewportHeight);
}
