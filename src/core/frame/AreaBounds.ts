// 화면 비율로 적힌 네모 영역 하나의 실제 자리를 낸다.
//
// 화면 한가운데가 (0, 0) 인 좌표다. 가로는 화면 폭에, 세로는 화면 높이에 각각 비례한다.
// 두 비율이 따로 걸리므로 화면 모양이 바뀌면 가로세로 비율도 바뀐다. 통째로 늘리면 안 맞는다.
//
// 이 식을 여기 한 곳에 둔 이유는, 전에 같은 식이 여덟 군데에 손으로 적혀 있었기 때문이다.
// 하나를 고칠 때 나머지를 잊어서 창 크기 문제가 여러 번 났다 (R2-87 ~ R2-93).

// 비율로 적힌 네모. 필드 영역이든 무엇이든 이 넷만 있으면 자리가 나온다.
export interface AreaRatios {
    readonly xPercent: number;
    readonly yPercent: number;
    readonly widthPercent: number;
    readonly heightPercent: number;
}

export interface AreaBounds {
    readonly centerX: number;
    readonly centerY: number;
    readonly width: number;
    readonly height: number;
    readonly minX: number;
    readonly maxX: number;
    readonly minY: number;
    readonly maxY: number;
}

export function computeAreaBounds(
    ratios: AreaRatios, viewportWidth: number, viewportHeight: number,
): AreaBounds {
    const centerX = ratios.xPercent * viewportWidth;
    const centerY = ratios.yPercent * viewportHeight;
    const width = ratios.widthPercent * viewportWidth;
    const height = ratios.heightPercent * viewportHeight;
    return {
        centerX, centerY, width, height,
        minX: centerX - width / 2,
        maxX: centerX + width / 2,
        minY: centerY - height / 2,
        maxY: centerY + height / 2,
    };
}

// 이 자리가 그 네모 안인가. 떨어뜨린 곳을 판정할 때 쓴다.
export function isInsideArea(bounds: AreaBounds, x: number, y: number): boolean {
    return x >= bounds.minX && x <= bounds.maxX && y >= bounds.minY && y <= bounds.maxY;
}
