// 상대 본체를 누를 수 있는 영역이다.
//
// 배경 그림 위에 덮어 두는 **보이지 않는 판** 이다. 이 판을 눌러 본체를 겨누고, 겨냥
// 테두리도 이 판에 붙는다. 배경이 창 크기를 따라가므로 이 판도 따라가야 한다.
//
// 안 보이는 것이라 안 맞아도 눈에 안 띈다. 창 크기 문제가 여기서 여러 번 났다 (R2-88, R2-89).
export interface OpponentMasterAreaFrame {
    // 화면 가로 세로에 대한 비율이다. 왼쪽 위가 (0, 0), 오른쪽 아래가 (1, 1).
    readonly leftRatio: number;
    readonly topRatio: number;
    readonly rightRatio: number;
    readonly bottomRatio: number;
    readonly renderOrder: number;
}

// 옛 좌표를 그대로 옮긴 값이다.
export function createOpponentMasterAreaFrame(): OpponentMasterAreaFrame {
    return {
        leftRatio: 0.4605885,
        topRatio: 0.1920103,
        rightRatio: 0.5410156,
        bottomRatio: 0.0476804,
        renderOrder: 1,
    };
}

export interface MasterAreaBounds {
    readonly width: number;
    readonly height: number;
    readonly centerX: number;
    readonly centerY: number;
}

// 화면 크기를 넣으면 실제 자리를 낸다. 화면 한가운데가 (0, 0) 인 좌표다.
export function computeOpponentMasterArea(
    frame: OpponentMasterAreaFrame, viewportWidth: number, viewportHeight: number,
): MasterAreaBounds {
    const x1 = (frame.leftRatio - 0.5) * viewportWidth;
    const y1 = (0.5 - frame.topRatio) * viewportHeight;
    const x2 = (frame.rightRatio - 0.5) * viewportWidth;
    const y2 = (0.5 - frame.bottomRatio) * viewportHeight;
    return {
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
        centerX: (x1 + x2) / 2,
        centerY: (y1 + y2) / 2,
    };
}
